from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Goal Schemas
class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    status: str = "active"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None

class Goal(GoalBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Todo Schemas
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool = False
    goal_id: Optional[int] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    goal_id: Optional[int] = None

class Todo(TodoBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Calendar Event Schemas
class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    todo_id: Optional[int] = None
    goal_id: Optional[int] = None

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    todo_id: Optional[int] = None
    goal_id: Optional[int] = None

class CalendarEvent(CalendarEventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Extended schemas with relationships
class GoalWithTodos(Goal):
    todos: List[Todo] = []

class TodoWithGoal(Todo):
    goal: Optional[Goal] = None
