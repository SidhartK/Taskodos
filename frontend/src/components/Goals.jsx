import { useState } from 'react'
import './Goals.css'

function Goals({ goals, onUpdate, apiUrl }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'active'
  })
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingId 
        ? `${apiUrl}/goals/${editingId}` 
        : `${apiUrl}/goals`
      
      const method = editingId ? 'PUT' : 'POST'
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      resetForm()
      onUpdate()
    } catch (error) {
      console.error('Error saving goal:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal? Associated todos will also be deleted.')) return
    
    try {
      await fetch(`${apiUrl}/goals/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleEdit = (goal) => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
      status: goal.status
    })
    setEditingId(goal.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_date: '',
      status: 'active'
    })
    setEditingId(null)
    setShowForm(false)
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className="goals">
      <div className="section-header">
        <h2>🎯 Goals</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Goal title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="3"
          />
          <input
            type="date"
            value={formData.target_date}
            onChange={(e) => setFormData({...formData, target_date: e.target.value})}
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Goal' : 'Create Goal'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="goals-sections">
        <div className="goals-section">
          <h3>Active Goals ({activeGoals.length})</h3>
          <div className="goals-list">
            {activeGoals.map(goal => (
              <div key={goal.id} className="goal-card">
                <div className="goal-header">
                  <h4>{goal.title}</h4>
                  <span className="badge badge-active">{goal.status}</span>
                </div>
                {goal.description && <p className="goal-description">{goal.description}</p>}
                {goal.target_date && (
                  <div className="goal-date">
                    📅 Target: {new Date(goal.target_date).toLocaleDateString()}
                  </div>
                )}
                <div className="goal-actions">
                  <button className="btn btn-small" onClick={() => handleEdit(goal)}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(goal.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
            {activeGoals.length === 0 && (
              <p className="empty-state">No active goals. Create one to get started!</p>
            )}
          </div>
        </div>

        {completedGoals.length > 0 && (
          <div className="goals-section">
            <h3>Completed Goals ({completedGoals.length})</h3>
            <div className="goals-list">
              {completedGoals.map(goal => (
                <div key={goal.id} className="goal-card completed">
                  <div className="goal-header">
                    <h4>{goal.title}</h4>
                    <span className="badge badge-completed">{goal.status}</span>
                  </div>
                  {goal.description && <p className="goal-description">{goal.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Goals