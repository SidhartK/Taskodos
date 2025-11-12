# Taskodos - Full Stack Goal Tracking Application

A modern full-stack application for managing goals, daily todos, and calendar events with intelligent integration between all three entities.

## Features

### 🎯 Goal Tracking
- Create, update, and delete goals
- Set target dates for goals
- Track goal status (active, completed, archived)
- Goals automatically create calendar events

### 📋 Daily Todos
- Manage daily tasks with descriptions
- Set due dates for todos
- Mark todos as complete/incomplete
- Link todos to specific goals
- Todos with due dates automatically create calendar events

### 📅 Calendar
- View all events in list or upcoming view
- Manual event creation
- Automatic events from goals and todos
- Filter events by date ranges
- Visual indicators for auto-generated events

### 🔗 Smart Integration
- Todos can be linked to goals for better organization
- Goals and todos with dates automatically appear on the calendar
- Calendar events are color-coded by type (todo vs goal)
- Deleting a goal removes associated todos
- Updating dates synchronizes calendar events

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Pydantic** - Data validation using Python type hints

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with custom properties

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the FastAPI server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Goals
- `GET /api/goals` - List all goals
- `GET /api/goals/{id}` - Get a specific goal with todos
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal

### Todos
- `GET /api/todos` - List all todos
- `GET /api/todos/{id}` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/{id}` - Update a todo
- `DELETE /api/todos/{id}` - Delete a todo

### Calendar Events
- `GET /api/calendar` - List all calendar events
- `GET /api/calendar/{id}` - Get a specific event
- `POST /api/calendar` - Create a new event
- `PUT /api/calendar/{id}` - Update an event
- `DELETE /api/calendar/{id}` - Delete an event

### Stats
- `GET /api/stats` - Get application statistics

## Project Structure

```
Taskodos/
├── backend/
│   ├── main.py           # FastAPI application and routes
│   ├── models.py         # SQLAlchemy database models
│   ├── schemas.py        # Pydantic schemas for validation
│   ├── database.py       # Database configuration
│   └── requirements.txt  # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Goals.jsx
│   │   │   ├── Todos.jsx
│   │   │   ├── Calendar.jsx
│   │   │   └── *.css
│   │   ├── App.jsx       # Main application component
│   │   ├── App.css       # Application styles
│   │   └── index.css     # Global styles
│   ├── package.json      # Node dependencies
│   └── vite.config.js    # Vite configuration
└── README.md
```

## Database Schema

### Goals Table
- `id` - Primary key
- `title` - Goal title (required)
- `description` - Detailed description
- `target_date` - Target completion date
- `status` - active/completed/archived
- `created_at` - Timestamp

### Todos Table
- `id` - Primary key
- `title` - Todo title (required)
- `description` - Detailed description
- `due_date` - Due date
- `completed` - Boolean flag
- `goal_id` - Foreign key to Goals
- `created_at` - Timestamp

### Calendar Events Table
- `id` - Primary key
- `title` - Event title (required)
- `description` - Event description
- `event_date` - Date of the event (required)
- `todo_id` - Foreign key to Todos (optional)
- `goal_id` - Foreign key to Goals (optional)
- `created_at` - Timestamp

## Development

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

### Linting

Frontend:
```bash
cd frontend
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.