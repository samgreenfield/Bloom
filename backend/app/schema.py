import strawberry
from datetime import datetime, UTC
from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy.orm.attributes import flag_modified
from .db import engine, init_db
from .models import User, Topic, Question, Response, Class, generate_class_code

# Start Types
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

@strawberry.type
class UserType:
    id: int
    google_sub: str
    name: str
    email: str
    picture: Optional[str]
    classCodes: List[str]
    role: str

@strawberry.type
class ClassType:
    id: int
    name: str
    teacher_id: UserType
    code: str

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
    def user_by_google_sub(self, google_sub: str) -> Optional[UserType]:
        with Session(engine) as session:
            user = session.exec(select(User).where(User.google_sub == google_sub)).first()
            return UserType(**user.model_dump()) if user else None
        
    @strawberry.field
    def questions(self, topic_id: int) -> List[QuestionType]:
        with Session(engine) as session:
            rows = session.exec(select(Question).where(Question.topic_id == topic_id)).all()
            return [QuestionType(**row.model_dump()) for row in rows]
        
    @strawberry.field
    def classes_for_user(self, user_id: int) -> List[ClassType]:
        with Session(engine) as session:
            user = session.get(User, user_id)
            if not user or not user.classCodes:
                return []
            classes = session.exec(
                select(Class).where(Class.code.in_(user.classCodes))
            ).all()
            return [ClassType(**cls.model_dump()) for cls in classes]
        
    @strawberry.field
    def classes() -> List[ClassType]:
        with Session(engine) as session:
            classes = session.exec(select(Class)).all()
            return [ClassType(
                id=cls.id,
                name=cls.name,
                code=cls.code,
                teacher_id=cls.teacher_id
            ) for cls in classes]
        
# Start Mutations
@strawberry.type
class Mutation:
    # @strawberry.mutation
    # def create_user(self, name: str, email: str, role: str = "student") -> UserType:
    #     with Session(engine) as session:
    #         user = User(name=name, email=email, role=role)
    #         session.add(user)
    #         session.commit()
    #         session.refresh(user)
    #         return UserType(**user.model_dump())
        
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
        
    @strawberry.mutation
    def create_or_update_user(
        self,
        google_sub: str,
        name: str,
        email: str,
        role: str,
        picture: Optional[str] = None,
        classCode: Optional[str] = None,
    ) -> UserType:
        with Session(engine) as session:
            user = session.exec(select(User).where(User.google_sub == google_sub)).first()
            if user:
                # Update fields if necessary
                user.name = name
                user.email = email
                user.picture = picture
                # Append class code if provided and not already present
                if classCode and classCode not in user.classCodes:
                    user.classCodes.append(classCode)
            else:
                # Create new user
                user = User(
                    google_sub=google_sub,
                    name=name,
                    email=email,
                    picture=picture,
                    role=role,
                    classCodes=[classCode] if classCode else [],
                )
                session.add(user)

            session.commit()
            session.refresh(user)
            return UserType(**user.dict())

    @strawberry.mutation
    def create_class(name: str, teacher_id: int) -> ClassType:
        with Session(engine) as session:
            teacher = session.get(User, teacher_id)
            if not teacher:
                raise ValueError("Teacher not found")

            # Generate class code
            new_code = generate_class_code()
            new_class = Class(name=name, code=new_code, teacher_id=teacher.id)
            session.add(new_class)

            # Add code to teacher
            if teacher.classCodes is None:
                teacher.classCodes = []
            teacher.classCodes.append(new_code)
            flag_modified(teacher, "classCodes")

            session.commit()
            session.refresh(new_class)

            return ClassType(
                id=new_class.id,
                name=new_class.name,
                code=new_class.code,
                teacher_id=new_class.teacher_id,
            )
        
    @strawberry.mutation
    def join_class(self, user_id: int, class_code: str) -> ClassType:
        with Session(engine) as session:
            user = session.get(User, user_id)
            cls = session.exec(select(Class).where(Class.code == class_code)).first()
            if not cls: raise ValueError("Class not found")
            if class_code in user.classCodes:
                return cls
            user.classCodes.append(class_code)
            session.add(user)
            flag_modified(user, "classCodes")
            session.commit()
            return cls
        
    
        
schema = strawberry.Schema(query=Query, mutation=Mutation)

init_db()