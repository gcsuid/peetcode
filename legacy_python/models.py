from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship

class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class AttemptType(str, Enum):
    ORIGINAL = "ORIGINAL"
    REVIEW = "REVIEW"

class MemoryRating(str, Enum):
    REMEMBERED = "REMEMBERED"
    PARTIAL = "PARTIAL"
    FORGOT = "FORGOT"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    problems: List["Problem"] = Relationship(back_populates="user")
    attempts: List["Attempt"] = Relationship(back_populates="user")
    schedules: List["ReviewSchedule"] = Relationship(back_populates="user")

class Problem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    leetcode_ref: str = Field(index=True)
    title: str
    difficulty: Difficulty
    tags: str # Comma-separated
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    first_solved_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="problems")
    attempts: List["Attempt"] = Relationship(back_populates="problem")
    schedule: Optional["ReviewSchedule"] = Relationship(back_populates="problem")

class Attempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    problem_id: int = Field(foreign_key="problem.id")
    user_id: int = Field(foreign_key="user.id")
    attempt_date: datetime = Field(default_factory=datetime.utcnow)
    attempt_type: AttemptType
    approach_text: str
    code: Optional[str] = None
    language: Optional[str] = None
    ai_feedback_summary: Optional[str] = None
    ai_memory_rating: Optional[MemoryRating] = None

    user: User = Relationship(back_populates="attempts")
    problem: Problem = Relationship(back_populates="attempts")

class ReviewSchedule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    problem_id: int = Field(foreign_key="problem.id")
    user_id: int = Field(foreign_key="user.id")
    next_review_date: date
    last_review_date: Optional[date] = None
    current_interval_days: int
    active: bool = True

    user: User = Relationship(back_populates="schedules")
    problem: Problem = Relationship(back_populates="schedule")
