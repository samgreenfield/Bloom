from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, UTC

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    role: str = "student"

    responses: List["Response"] = Relationship(back_populates="user")

class Topic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None

    questions: List["Question"] = Relationship(back_populates="topic")

class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    topic_id: int = Field(foreign_key="topic.id")
    prompt: str
    choice_a: str
    choice_b: str
    choice_c: str
    choice_d: str
    answer: str
    difficulty: int = 1

    topic: Optional[Topic] = Relationship(back_populates="questions")
    responses: List["Response"] = Relationship(back_populates="question")

class Response(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    question_id: int = Field(foreign_key="question.id")
    correct: bool
    timestamp: datetime = Field(default_factory=datetime.now(UTC))

    user: Optional[User] = Relationship(back_populates="responses")
    question: Optional[Question] = Relationship(back_populates="responses")