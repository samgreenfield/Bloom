import strawberry
from datetime import datetime, UTC
from typing import List
from sqlmodel import Session, select
from .db import engine, init_db
from .models import User, Topic, Question, Response

# Start Types
@strawberry.type
class UserType:
    id: int
    name: str
    email: str
    role: str

@strawberry.type
class TopicType:
    id: int
    name: str
    description: str

@strawberry.type
class QuestionType:
    id: int
    topic_id: int
    prompt: str
    choice_a: str
    choice_b: str
    choice_c: str
    choice_d: str
    answer: str
    difficulty: int

@strawberry.type
class ResponseType:
    id: int
    user_id: int
    question_id: int
    correct: bool
    timestamp: str

# Start Queries
@strawberry.type
class Query:
    @strawberry.field
    def users(self) -> List[UserType]:
        with Session(engine) as session:
            users = session.exec(select(User)).all()
            return [UserType(**u.model_dump()) for u in users]
        
    @strawberry.field
    def topics(self) -> List[TopicType]:
        with Session(engine) as session:
            rows = session.exec(select(Topic)).all()
            return [TopicType(**row.model_dump()) for row in rows]
        
    @strawberry.field
    def questions(self, topic_id: int) -> List[QuestionType]:
        with Session(engine) as session:
            rows = session.exec(select(Question).where(Question.topic_id == topic_id)).all()
            return [QuestionType(**row.model_dump()) for row in rows]
        
# Start Mutations
@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, name: str, email: str, role: str = "student") -> UserType:
        with Session(engine) as session:
            user = User(name=name, email=email, role=role)
            session.add(user)
            session.commit()
            session.refresh(user)
            return UserType(**user.model_dump())
        
    @strawberry.mutation
    def create_topic(self, name: str, description: str) -> TopicType:
        with Session(engine) as session:
            topic = Topic(name=name, description=description)
            session.add(topic)
            session.commit()
            session.refresh(topic)
            return TopicType(**topic.model_dump())

    @strawberry.mutation
    def create_question(
        self, topic_id: int, prompt: str,
        choice_a: str, choice_b: str, choice_c: str, choice_d: str,
        answer: str, difficulty: int = 1
    ) -> QuestionType:
        with Session(engine) as session:
            q = Question(
                topic_id=topic_id, prompt=prompt,
                choice_a=choice_a, choice_b=choice_b,
                choice_c=choice_c, choice_d=choice_d,
                answer=answer, difficulty=difficulty
            )
            session.add(q)
            session.commit()
            session.refresh(q)
            return QuestionType(**q.model_dump())

    @strawberry.mutation
    def submit_response(self, user_id: int, question_id: int, correct: bool) -> ResponseType:
        with Session(engine) as session:
            r = Response(user_id=user_id, question_id=question_id, correct=correct, timestamp=datetime.now(UTC))
            session.add(r)
            session.commit()
            session.refresh(r)
            return ResponseType(**r.model_dump())
        
schema = strawberry.Schema(query=Query, mutation=Mutation)

init_db()