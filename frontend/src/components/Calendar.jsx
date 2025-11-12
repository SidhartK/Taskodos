import { useState } from 'react'
import './Calendar.css'

function Calendar({ events, onUpdate, apiUrl }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [viewMode, setViewMode] = useState('list') // list or month

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingId 
        ? `${apiUrl}/calendar/${editingId}` 
        : `${apiUrl}/calendar`
      
      const method = editingId ? 'PUT' : 'POST'
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      resetForm()
      onUpdate()
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    
    try {
      await fetch(`${apiUrl}/calendar/${id}`, { method: 'DELETE' })
      onUpdate()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date.split('T')[0]
    })
    setEditingId(event.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.event_date).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {})

  const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
    return new Date(a) - new Date(b)
  })

  // Get upcoming and past events
  const now = new Date()
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now)
  const pastEvents = events.filter(e => new Date(e.event_date) < now)

  return (
    <div className="calendar">
      <div className="section-header">
        <h2>📅 Calendar</h2>
        <div className="header-actions">
          <button 
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button 
            className={`btn ${viewMode === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('upcoming')}
          >
            Upcoming
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Event'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Event title"
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
            value={formData.event_date}
            onChange={(e) => setFormData({...formData, event_date: e.target.value})}
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {viewMode === 'list' && (
        <div className="calendar-list">
          {sortedDates.map(date => (
            <div key={date} className="date-group">
              <h3 className="date-header">{date}</h3>
              <div className="events-list">
                {eventsByDate[date].map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-content">
                      <h4>{event.title}</h4>
                      {event.description && <p className="event-description">{event.description}</p>}
                      <div className="event-meta">
                        {event.todo_id && <span className="badge badge-todo">📋 Todo</span>}
                        {event.goal_id && <span className="badge badge-goal">🎯 Goal</span>}
                      </div>
                    </div>
                    <div className="event-actions">
                      {!event.todo_id && !event.goal_id && (
                        <>
                          <button className="btn btn-small" onClick={() => handleEdit(event)}>
                            ✏️
                          </button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(event.id)}>
                            🗑️
                          </button>
                        </>
                      )}
                      {(event.todo_id || event.goal_id) && (
                        <span className="auto-generated">Auto-generated</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {sortedDates.length === 0 && (
            <p className="empty-state">No calendar events yet. Create one or add a todo/goal with a date!</p>
          )}
        </div>
      )}

      {viewMode === 'upcoming' && (
        <div className="calendar-sections">
          <div className="calendar-section">
            <h3>Upcoming Events ({upcomingEvents.length})</h3>
            <div className="events-list">
              {upcomingEvents
                .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                .map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-content">
                      <h4>{event.title}</h4>
                      {event.description && <p className="event-description">{event.description}</p>}
                      <div className="event-date">
                        📅 {new Date(event.event_date).toLocaleDateString()}
                      </div>
                      <div className="event-meta">
                        {event.todo_id && <span className="badge badge-todo">📋 Todo</span>}
                        {event.goal_id && <span className="badge badge-goal">🎯 Goal</span>}
                      </div>
                    </div>
                    <div className="event-actions">
                      {!event.todo_id && !event.goal_id && (
                        <>
                          <button className="btn btn-small" onClick={() => handleEdit(event)}>
                            ✏️
                          </button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(event.id)}>
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              {upcomingEvents.length === 0 && (
                <p className="empty-state">No upcoming events.</p>
              )}
            </div>
          </div>

          {pastEvents.length > 0 && (
            <div className="calendar-section">
              <h3>Past Events ({pastEvents.length})</h3>
              <div className="events-list">
                {pastEvents
                  .sort((a, b) => new Date(b.event_date) - new Date(a.event_date))
                  .slice(0, 10)
                  .map(event => (
                    <div key={event.id} className="event-card past">
                      <div className="event-content">
                        <h4>{event.title}</h4>
                        <div className="event-date">
                          📅 {new Date(event.event_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Calendar