from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

import models
import schemas
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Taskodos API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ GOALS ENDPOINTS ============

@app.get("/api/goals", response_model=List[schemas.Goal])
def get_goals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).offset(skip).limit(limit).all()
    return goals

@app.get("/api/goals/{goal_id}", response_model=schemas.GoalWithTodos)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@app.post("/api/goals", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    db_goal = models.Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    # Auto-create calendar event if target_date is set
    if db_goal.target_date:
        event = models.CalendarEvent(
            title=f"Goal: {db_goal.title}",
            description=db_goal.description,
            event_date=db_goal.target_date,
            goal_id=db_goal.id
        )
        db.add(event)
        db.commit()
    
    return db_goal

@app.put("/api/goals/{goal_id}", response_model=schemas.Goal)
def update_goal(goal_id: int, goal: schemas.GoalUpdate, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    update_data = goal.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_goal, field, value)
    
    db.commit()
    db.refresh(db_goal)
    
    # Update calendar event if target_date changed
    if "target_date" in update_data and update_data["target_date"]:
        existing_event = db.query(models.CalendarEvent).filter(
            models.CalendarEvent.goal_id == goal_id,
            models.CalendarEvent.todo_id == None
        ).first()
        
        if existing_event:
            existing_event.event_date = update_data["target_date"]
            existing_event.title = f"Goal: {db_goal.title}"
        else:
            event = models.CalendarEvent(
                title=f"Goal: {db_goal.title}",
                description=db_goal.description,
                event_date=update_data["target_date"],
                goal_id=goal_id
            )
            db.add(event)
        db.commit()
    
    return db_goal

@app.delete("/api/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(db_goal)
    db.commit()
    return {"message": "Goal deleted successfully"}

# ============ TODOS ENDPOINTS ============

@app.get("/api/todos", response_model=List[schemas.TodoWithGoal])
def get_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = db.query(models.Todo).offset(skip).limit(limit).all()
    return todos

@app.get("/api/todos/{todo_id}", response_model=schemas.TodoWithGoal)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@app.post("/api/todos", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    db_todo = models.Todo(**todo.dict())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    
    # Auto-create calendar event if due_date is set
    if db_todo.due_date:
        event = models.CalendarEvent(
            title=f"Todo: {db_todo.title}",
            description=db_todo.description,
            event_date=db_todo.due_date,
            todo_id=db_todo.id,
            goal_id=db_todo.goal_id
        )
        db.add(event)
        db.commit()
    
    return db_todo

@app.put("/api/todos/{todo_id}", response_model=schemas.Todo)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = todo.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_todo, field, value)
    
    db.commit()
    db.refresh(db_todo)
    
    # Update calendar event if due_date changed
    if "due_date" in update_data and update_data["due_date"]:
        existing_event = db.query(models.CalendarEvent).filter(
            models.CalendarEvent.todo_id == todo_id
        ).first()
        
        if existing_event:
            existing_event.event_date = update_data["due_date"]
            existing_event.title = f"Todo: {db_todo.title}"
        else:
            event = models.CalendarEvent(
                title=f"Todo: {db_todo.title}",
                description=db_todo.description,
                event_date=update_data["due_date"],
                todo_id=todo_id,
                goal_id=db_todo.goal_id
            )
            db.add(event)
        db.commit()
    
    return db_todo

@app.delete("/api/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted successfully"}

# ============ CALENDAR EVENTS ENDPOINTS ============

@app.get("/api/calendar", response_model=List[schemas.CalendarEvent])
def get_calendar_events(
    start_date: datetime = None,
    end_date: datetime = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.CalendarEvent)
    
    if start_date:
        query = query.filter(models.CalendarEvent.event_date >= start_date)
    if end_date:
        query = query.filter(models.CalendarEvent.event_date <= end_date)
    
    events = query.all()
    return events

@app.get("/api/calendar/{event_id}", response_model=schemas.CalendarEvent)
def get_calendar_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return event

@app.post("/api/calendar", response_model=schemas.CalendarEvent)
def create_calendar_event(event: schemas.CalendarEventCreate, db: Session = Depends(get_db)):
    db_event = models.CalendarEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@app.put("/api/calendar/{event_id}", response_model=schemas.CalendarEvent)
def update_calendar_event(event_id: int, event: schemas.CalendarEventUpdate, db: Session = Depends(get_db)):
    db_event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    update_data = event.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@app.delete("/api/calendar/{event_id}")
def delete_calendar_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    
    db.delete(db_event)
    db.commit()
    return {"message": "Calendar event deleted successfully"}

# ============ STATS ENDPOINT ============

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_goals = db.query(models.Goal).count()
    active_goals = db.query(models.Goal).filter(models.Goal.status == "active").count()
    completed_goals = db.query(models.Goal).filter(models.Goal.status == "completed").count()
    
    total_todos = db.query(models.Todo).count()
    completed_todos = db.query(models.Todo).filter(models.Todo.completed == True).count()
    pending_todos = db.query(models.Todo).filter(models.Todo.completed == False).count()
    
    total_events = db.query(models.CalendarEvent).count()
    
    return {
        "goals": {
            "total": total_goals,
            "active": active_goals,
            "completed": completed_goals
        },
        "todos": {
            "total": total_todos,
            "completed": completed_todos,
            "pending": pending_todos
        },
        "calendar_events": total_events
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
