import { useState, useEffect } from 'react'
import './App.css'
import Goals from './components/Goals'
import Todos from './components/Todos'
import Calendar from './components/Calendar'

const API_URL = 'http://localhost:8000/api'

function App() {
  const [goals, setGoals] = useState([])
  const [todos, setTodos] = useState([])
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('todos')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [goalsRes, todosRes, eventsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/goals`),
        fetch(`${API_URL}/todos`),
        fetch(`${API_URL}/calendar`),
        fetch(`${API_URL}/stats`)
      ])
      
      setGoals(await goalsRes.json())
      setTodos(await todosRes.json())
      setEvents(await eventsRes.json())
      setStats(await statsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📝 Taskodos</h1>
        <p className="subtitle">Goal Tracking • Daily Todos • Calendar</p>
      </header>

      {stats && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{stats.goals.active}</span>
            <span className="stat-label">Active Goals</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.todos.pending}</span>
            <span className="stat-label">Pending Todos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.todos.completed}</span>
            <span className="stat-label">Completed Todos</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.calendar_events}</span>
            <span className="stat-label">Calendar Events</span>
          </div>
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          📋 Todos
        </button>
        <button 
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 Goals
        </button>
        <button 
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendar
        </button>
      </div>

      <div className="content">
        {activeTab === 'todos' && (
          <Todos 
            todos={todos} 
            goals={goals}
            onUpdate={fetchData}
            apiUrl={API_URL}
          />
        )}
        {activeTab === 'goals' && (
          <Goals 
            goals={goals}
            onUpdate={fetchData}
            apiUrl={API_URL}
          />
        )}
        {activeTab === 'calendar' && (
          <Calendar 
            events={events}
            onUpdate={fetchData}
            apiUrl={API_URL}
          />
        )}
      </div>
    </div>
  )
}

export default App
