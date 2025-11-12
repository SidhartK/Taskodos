from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    target_date = Column(DateTime)
    status = Column(String, default="active")  # active, completed, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    
    todos = relationship("Todo", back_populates="goal", cascade="all, delete-orphan")
    calendar_events = relationship("CalendarEvent", back_populates="goal")

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    due_date = Column(DateTime)
    completed = Column(Boolean, default=False)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    goal = relationship("Goal", back_populates="todos")
    calendar_events = relationship("CalendarEvent", back_populates="todo")

class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    event_date = Column(DateTime, nullable=False)
    todo_id = Column(Integer, ForeignKey("todos.id"), nullable=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    todo = relationship("Todo", back_populates="calendar_events")
    goal = relationship("Goal", back_populates="calendar_events")
