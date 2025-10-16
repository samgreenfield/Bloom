import strawberry
from typing import List, Optional
from sqlmodel import Session, select, delete
from .db import engine, init_db
from .models import *

# Start Types
@strawberry.type
class UserType:
    id: int
    google_sub: str
    name: str
    email: str
    picture: Optional[str]
    role: str
    classes_taught: Optional[List["ClassType"]] = None
    classes_enrolled: Optional[List["ClassType"]] = None

@strawberry.type
class ClassType:
    id: int
    name: str
    code: str
    teacher: UserType
    students: List["UserType"]
    lessons: List["LessonType"]

@strawberry.type
class LessonType:
    id: str
    title: str
    class_: ClassType
    questions: Optional[List["QuestionType"]] = None
    scores: Optional[List["LessonScoreType"]] = None

@strawberry.type
class QuestionType:
    id: int
    title: str
    correct_answer: str
    wrong_answers: List[str]
    lesson: LessonType

@strawberry.type
class LessonScoreType:
    lesson_id: int
    user_id: int
    score: float

# Start Queries
@strawberry.type
class Query:
    @strawberry.field
    def user_by_google_sub(self, google_sub: str) -> Optional[UserType]:
        with Session(engine) as session:
            user = session.exec(select(User).where(User.google_sub == google_sub)).first()
            return UserType(**user.model_dump()) if user else None
    
    @strawberry.field
    def users(self) -> List[UserType]:
        with Session(engine) as session:
            return [UserType(**user.model_dump()) for user in session.exec(select(User))]
        
    @strawberry.field
    def classes_for_user(self, user_id: int) -> List["ClassType"]:
        with Session(engine) as session:
            user = session.get(User, user_id)
            if not user:
                raise ValueError("User not found")

            # If teacher, return classes they teach
            if user.role == "teacher":
                classes = user.classes_taught
            # If student, return classes they’re enrolled in
            else:
                classes = user.classes_enrolled

            return [
                ClassType(
                    id=cls.id,
                    name=cls.name,
                    code=cls.code,
                    teacher=cls.teacher,
                    students=cls.students,
                    lessons=cls.lessons
                )
                for cls in classes
            ]
    
    @strawberry.field
    def classes(self) -> List[ClassType]:
        with Session(engine) as session:
            classes = session.exec(select(Class)).all()
            return [
                ClassType(
                    id=cls.id,
                    name=cls.name,
                    code=cls.code,
                    teacher=cls.teacher,
                    students=cls.students,
                    lessons=cls.lessons
                )
                for cls in classes
            ]
    
    @strawberry.field
    def class_by_code(self, code: str) -> Optional[ClassType]:
        with Session(engine) as session:
            cls = session.exec(select(Class).where(Class.code == code)).first()
            return (
                ClassType(
                    id=cls.id,
                    name=cls.name,
                    code=cls.code,
                    teacher=cls.teacher,
                    students=cls.students,
                    lessons=[
                        Lesson(
                            id=lesson.id,
                            title=lesson.title,
                            class_id=lesson.class_id,
                            scores=lesson.scores

                        ) for lesson in cls.lessons
                    ]
                )
                if cls
                else None
            )
    
    @strawberry.field
    def lessons_for_class(self, class_id: int) -> List[LessonType]:
        with Session(engine) as session:
            lessons = session.exec(select(Lesson).where(Lesson.class_id == class_id)).all()
            return [LessonType(
                id=lesson.id,
                title=lesson.title,
                class_=lesson.class_,
                questions=lesson.questions,
            ) for lesson in lessons]
        
    @strawberry.field
    def lesson_by_id(self, lesson_id: str) -> LessonType:
        with Session(engine) as session:
            lesson = session.get(Lesson, lesson_id)
            if not lesson:
                raise ValueError("Lesson not found")

            return LessonType(
                id = lesson.id,
                title = lesson.title,
                class_= lesson.class_,
                questions= lesson.questions
            )
        
# Start Mutations
@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_or_update_user(
        self,
        google_sub: str,
        name: str,
        email: str,
        role: str,
        picture: Optional[str] = None,
        classCode: Optional[str] = None
    ) -> UserType:
        with Session(engine) as session:
            user = session.exec(select(User).where(User.google_sub == google_sub)).first()

            if user:
                user.name = name
                user.email = email
                user.picture = picture
            else:
                user = User(
                    google_sub=google_sub,
                    name=name,
                    email=email,
                    picture=picture,
                    role=role,
                )
                session.add(user)

            session.commit()
            session.refresh(user)
            return UserType(**user.model_dump())

    @strawberry.mutation
    def create_class(self, name: str, teacher_id: int) -> ClassType:
        with Session(engine) as session:
            teacher = session.get(User, teacher_id)
            if not teacher:
                raise ValueError("Teacher not found.")
            if teacher.role != "teacher":
                raise ValueError("Only teachers can create classes.")

            new_class = Class(
                name=name,
                code=generate_class_code(),
                teacher_id=teacher.id,
            )
            session.add(new_class)
            session.commit()
            session.refresh(new_class)

            return ClassType(
                id=new_class.id,
                name=new_class.name,
                code=new_class.code,
                teacher=UserType(
                    id=teacher.id,
                    google_sub=teacher.google_sub,
                    name=teacher.name,
                    email=teacher.email,
                    picture=teacher.picture,
                    role=teacher.role,
                ),
                students=new_class.students,
                lessons=new_class.lessons,
            )
        
    @strawberry.mutation
    def join_class(self, user_id: int, class_code: str) -> ClassType:
        with Session(engine) as session:
            user = session.get(User, user_id)
            if not user:
                raise ValueError("User not found.")
            if user.role != "student":
                raise ValueError("Only students can join classes.")

            cls = session.exec(select(Class).where(Class.code == class_code)).first()
            if not cls:
                raise ValueError("Class not found.")

            # Add student to class if not already joined
            if user not in cls.students:
                cls.students.append(user)
                session.commit()
                session.refresh(cls)

            return ClassType(
                id=cls.id,
                name=cls.name,
                code=cls.code,
                teacher=cls.teacher,
                students=cls.students,
                lessons=cls.lessons,
            )
        
    @strawberry.mutation
    def create_lesson(self, class_id: int, title: str) -> LessonType:
        with Session(engine) as session:
            class_obj = session.get(Class, class_id)
            if not class_obj:
                raise ValueError("Class not found.")

            new_lesson = Lesson(title=title, class_id=class_obj.id)
            session.add(new_lesson)
            session.commit()
            session.refresh(new_lesson)

            return LessonType(
                id=new_lesson.id,
                title=new_lesson.title,
                class_=ClassType(
                    id=class_obj.id,
                    name=class_obj.name,
                    code=class_obj.code,
                    teacher=class_obj.teacher,
                    students = class_obj.students,
                    lessons = class_obj.lessons
                ),
                questions=[]
            )
    @strawberry.mutation
    def delete_lesson(self, class_id: int, lesson_id: str) -> bool:
        with Session(engine) as session:
            class_obj = session.get(Class, class_id)
            if not class_obj:
                return False

            lesson_to_delete = session.get(Lesson, lesson_id)
            if not lesson_to_delete or lesson_to_delete.class_id != class_id:
                return False

            # Delete lesson directly (do not remove from relationship)
            session.delete(lesson_to_delete)
            session.commit()
            return True
    
    @strawberry.mutation
    def leave_class(self, class_id: int, student_id: int) -> bool:
        with Session(engine) as session:
            cls = session.get(Class, class_id)
            if not cls:
                raise ValueError("Class not found")

            student = session.get(User, student_id)
            if not student:
                raise ValueError("Student not found")

            if student in cls.students:
                session.exec(
                    delete(LessonScore).where(
                        LessonScore.user_id == student_id,
                        LessonScore.lesson_id.in_(
                            [lesson.id for lesson in cls.lessons]
                        )
                    )
                )
                cls.students.remove(student)
                session.add(cls)
                session.commit()
                return True
            else:
                return False
    
    @strawberry.mutation
    def delete_class(self, class_id: int) -> bool:
        with Session(engine) as session:
            cls = session.get(Class, class_id)
            if not cls:
                raise ValueError("Class not found")
            
            teacher_id = cls.teacher_id

            session.delete(cls)
            session.commit()
            return True
        
    @strawberry.mutation
    def add_question_to_lesson(
        self,
        lesson_id: str,
        title: str,
        correct_answer: str,
        wrong_answers: List[str]
    ) -> Optional[QuestionType]:
        with Session(engine) as session:
            # Verify that the lesson exists
            lesson = session.get(Lesson, lesson_id)
            if not lesson:
                raise ValueError(f"Lesson with ID {lesson_id} not found")

            # Create the question
            question = Question(
                title=title,
                lesson_id=lesson_id,
                correct_answer=correct_answer,
                wrong_answers=wrong_answers
            )
            session.add(question)
            session.commit()
            session.refresh(question)

            session.commit()

            # Reload with relationships
            session.refresh(question)

            return QuestionType(
                id=question.id,
                title=question.title,
                correct_answer=question.correct_answer,
                wrong_answers=question.wrong_answers,
                lesson=question.lesson
            )

    @strawberry.mutation
    def submit_lesson_score(
        self,
        lesson_id: str,
        user_id: int,
        score: float  # score as percentage (0–100)
    ) -> Optional["LessonScoreType"]:
        with Session(engine) as session:
            # Verify lesson exists
            lesson = session.get(Lesson, lesson_id)
            if not lesson:
                raise ValueError(f"Lesson {lesson_id} not found")
            
            # Verify user exists
            user = session.get(User, user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            # Check if there is already a score
            existing = session.exec(
                select(LessonScore)
                .where(LessonScore.lesson_id == lesson_id)
                .where(LessonScore.user_id == user_id)
            ).first()

            if existing:
                existing.score = score
                session.add(existing)
                session.commit()
                session.refresh(existing)
                return existing

            # Otherwise create new score
            lesson_score = LessonScore(
                lesson_id=lesson_id,
                user_id=user_id,
                score=score
            )
            session.add(lesson_score)
            session.commit()
            session.refresh(lesson_score)

            return LessonScoreType(
                lesson_id=lesson_score.id,
                user_id=lesson_score.user_id,
                score=lesson_score.score
            )
        
    @strawberry.mutation
    def delete_question(self, question_id: int) -> bool:
        with Session(engine) as session:
            question = session.get(Question, question_id)
            if not question:
                return False
            session.delete(question)
            session.commit()
            return True
        
    @strawberry.mutation
    def update_question(
        self,
        question_id: int,
        title: str,
        correct_answer: str,
        wrong_answers: List[str],
    ) -> Optional[QuestionType]:
        with Session(engine) as session:
            question = session.get(Question, question_id)
            if not question:
                return None

            question.title = title
            question.correct_answer = correct_answer
            question.wrong_answers = wrong_answers

            session.add(question)
            session.commit()
            session.refresh(question)

            return QuestionType(
                id=question.id,
                title=question.title,
                correct_answer=question.correct_answer,
                wrong_answers=question.wrong_answers,
                lesson=None
            )
        
    
        
schema = strawberry.Schema(query=Query, mutation=Mutation)

init_db()