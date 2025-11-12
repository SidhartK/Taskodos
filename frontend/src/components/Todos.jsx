import { useState } from 'react'
import './Todos.css'

function Todos({ todos, goals, onUpdate, apiUrl }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    completed: false,
    goal_id: ''
  })
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingId 
        ? `${apiUrl}/todos/${editingId}` 
        : `${apiUrl}/todos`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const data = {
        ...formData,
        goal_id: formData.goal_id ? parseInt(formData.goal_id) : null
      }
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      resetForm()
      onUpdate()
    } catch (error) {
      console.error('Error saving todo:', error)
    }
  }

  const handleToggleComplete = async (todo) => {
    try {
      await fetch(`${apiUrl}/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      })
      onUpdate()
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this todo?')) return
    
    try {
      await fetch(`${apiUrl}/todos/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const handleEdit = (todo) => {
    setFormData({
      title: todo.title,
      description: todo.description || '',
      due_date: todo.due_date ? todo.due_date.split('T')[0] : '',
      completed: todo.completed,
      goal_id: todo.goal_id || ''
    })
    setEditingId(todo.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      completed: false,
      goal_id: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const pendingTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  return (
    <div className="todos">
      <div className="section-header">
        <h2>📋 Daily Todos</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Todo'}
        </button>
      </div>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Todo title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="2"
          />
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            placeholder="Due date"
          />
          <select
            value={formData.goal_id}
            onChange={(e) => setFormData({...formData, goal_id: e.target.value})}
          >
            <option value="">No goal (standalone todo)</option>
            {goals.filter(g => g.status === 'active').map(goal => (
              <option key={goal.id} value={goal.id}>
                🎯 {goal.title}
              </option>
            ))}
          </select>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Todo' : 'Create Todo'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="todos-sections">
        <div className="todos-section">
          <h3>Pending ({pendingTodos.length})</h3>
          <div className="todos-list">
            {pendingTodos.map(todo => (
              <div key={todo.id} className="todo-card">
                <div className="todo-main">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                    className="todo-checkbox"
                  />
                  <div className="todo-content">
                    <h4>{todo.title}</h4>
                    {todo.description && <p className="todo-description">{todo.description}</p>}
                    <div className="todo-meta">
                      {todo.due_date && (
                        <span className="todo-date">
                          📅 {new Date(todo.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {todo.goal && (
                        <span className="todo-goal">
                          🎯 {todo.goal.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="todo-actions">
                  <button className="btn btn-small" onClick={() => handleEdit(todo)}>
                    ✏️
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(todo.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {pendingTodos.length === 0 && (
              <p className="empty-state">No pending todos. Great job! 🎉</p>
            )}
          </div>
        </div>

        {completedTodos.length > 0 && (
          <div className="todos-section">
            <h3>Completed ({completedTodos.length})</h3>
            <div className="todos-list">
              {completedTodos.map(todo => (
                <div key={todo.id} className="todo-card completed">
                  <div className="todo-main">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                      className="todo-checkbox"
                    />
                    <div className="todo-content">
                      <h4>{todo.title}</h4>
                      {todo.goal && (
                        <span className="todo-goal">🎯 {todo.goal.title}</span>
                      )}
                    </div>
                  </div>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(todo.id)}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Todos