from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from sqlalchemy import Integer, String, ForeignKey

from typing import Optional, List
import string, random

def generate_class_code(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=length))

# Link users to classes
class EnrollmentLink(SQLModel, table=True):
    class_id: Optional[int] = Field(default=None, foreign_key="class.id", primary_key=True)
    student_id: Optional[int] = Field(default=None, foreign_key="user.id", primary_key=True)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    google_sub: str = Field(index=True, unique=True)
    name: str
    email: str
    picture: Optional[str] = None
    role: str = "student"

    # Users can teach classes (teachers) or be enrolled in them (students)
    classes_taught: List["Class"] = Relationship(back_populates="teacher")
    classes_enrolled: List["Class"] = Relationship(
        back_populates="students", link_model=EnrollmentLink
    )

    # Users have many responses
    responses: List["LessonScore"] = Relationship(back_populates="user")
    scores: list["LessonScore"] = Relationship(back_populates="user")

class Class(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    code: str = Field(default_factory=generate_class_code, unique=True)
    teacher_id: int = Field(foreign_key="user.id")

    # Classes have a teacher, many students enrolled, and many lessons
    teacher: User = Relationship(back_populates="classes_taught")
    students: List[User] = Relationship(back_populates="classes_enrolled", link_model=EnrollmentLink)
    lessons: List["Lesson"] = Relationship(back_populates="class_", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class Lesson(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=generate_class_code, primary_key=True)
    title: str
    class_id: int = Field(
        sa_column=Column(Integer, ForeignKey("class.id", ondelete="CASCADE"), nullable=False)
    )

    class_: "Class" = Relationship(back_populates="lessons")
    questions: list["Question"] = Relationship(
        back_populates="lesson",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    scores: list["LessonScore"] = Relationship(
        back_populates="lesson",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    correct_answer: str
    wrong_answers: list[str] = Field(sa_column=Column(JSON), default_factory=list)
    lesson_id: int = Field(
        sa_column=Column(Integer, ForeignKey("lesson.id", ondelete="CASCADE"), nullable=False)
    )

    lesson: Optional["Lesson"] = Relationship(back_populates="questions")

class LessonScore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    lesson_id: str = Field(
        sa_column=Column(String, ForeignKey("lesson.id", ondelete="CASCADE"))
    )
    user_id: int = Field(
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="CASCADE"))
    )
    score: float

    lesson: Optional["Lesson"] = Relationship(back_populates="scores")
    user: Optional["User"] = Relationship(back_populates="scores")