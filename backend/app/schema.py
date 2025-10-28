import strawberry
from typing import List, Optional
from sqlmodel import Session, select, delete
from .db import engine, init_db
from .models import *

'''
SCHEMA.PY:
Describes the schema of the GraphQL API. Inculdes three sections:
    - Types: Basic objects to be mutated or queried via the API
    - Queries: Requests which can be made to get data in the database
    - Mutations: Requests which can be made to change data in the database
'''

### TYPES ###
# User
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

# Class
@strawberry.type
class ClassType:
    id: int
    name: str
    code: str
    teacher: UserType
    students: List["UserType"]
    lessons: List["LessonType"]

#Lesson
@strawberry.type
class LessonType:
    id: str
    title: str
    class_: ClassType
    questions: Optional[List["QuestionType"]] = None
    scores: Optional[List["LessonScoreType"]] = None

# Question
@strawberry.type
class QuestionType:
    id: int
    title: str
    correct_answer: str
    wrong_answers: List[str]
    lesson: LessonType

# Lesson Score
@strawberry.type
class LessonScoreType:
    lesson_id: int
    user_id: int
    score: float


### QUERIES ###
@strawberry.type
class Query:
    
    # Retrieve a User type by their Google sub (Sign-In Page)
    @strawberry.field
    def user_by_google_sub(self, google_sub: str) -> Optional[UserType]:
        with Session(engine) as session:
            user = session.exec(select(User).where(User.google_sub == google_sub)).first()
            # if not user:
            #     raise ValueError("User not found")

            return UserType(**user.model_dump()) if user else None
    
    # # Get all Users (DEBUG ONLY)
    # @strawberry.field
    # def users(self) -> List[UserType]:
    #     with Session(engine) as session:
    #         return [UserType(**user.model_dump()) for user in session.exec(select(User))]
        
    # Retrieves all Class objects which the User is part of (Classes Widget)
    @strawberry.field
    def classes_for_user(self, user_id: int) -> List["ClassType"]:
        with Session(engine) as session:
            # Get the user object by ID
            user = session.get(User, user_id)
            if not user:
                raise ValueError("User not found")

            # If teacher, get classes they teach
            if user.role == "teacher":
                classes = user.classes_taught
            # If student, get classes they’re enrolled in
            else:
                classes = user.classes_enrolled
            
            # Rebuild Class types for each class (no classes --> [])
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
        
    # # Retrieve all Classes (DEBUG ONLY)
    # @strawberry.field
    # def classes(self) -> List[ClassType]:
    #     with Session(engine) as session:
    #         classes = session.exec(select(Class)).all()
    #         return [
    #             ClassType(
    #                 id=cls.id,
    #                 name=cls.name,
    #                 code=cls.code,
    #                 teacher=cls.teacher,
    #                 students=cls.students,
    #                 lessons=cls.lessons
    #             )
    #             for cls in classes
    #         ]
    
    # Retrieve a class object by its code (Class Page)
    @strawberry.field
    def class_by_code(self, code: str) -> Optional[ClassType]:
        with Session(engine) as session:
            # Get the class where the class' code is the given code
            cls = session.exec(select(Class).where(Class.code == code)).first()
            if not cls:
                raise ValueError("Class not found")

            # Rebuild and return Class type
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
    
    # # Retrieve all lessons which are part of class by the class' code (DEBUG ONLY)
    # @strawberry.field
    # def lessons_for_class(self, class_id: int) -> List[LessonType]:
    #     with Session(engine) as session:
    #         # Get lessons where the lesson's class id is the same as the given id
    #         lessons = session.exec(select(Lesson).where(Lesson.class_id == class_id)).all()
    #         # Rebuild and return Lesson types for each lesson
    #         return [LessonType(
    #             id=lesson.id,
    #             title=lesson.title,
    #             class_=lesson.class_,
    #             questions=lesson.questions,
    #         ) for lesson in lessons]
    
    # Retrieve a lesson by its code (LessonPage)
    @strawberry.field
    def lesson_by_id(self, lesson_id: str) -> LessonType:
        with Session(engine) as session:
            # Get the lesson
            lesson = session.get(Lesson, lesson_id)
            if not lesson:
                raise ValueError("Lesson not found")

            # Rebuild and return Lesson type
            return LessonType(
                id = lesson.id,
                title = lesson.title,
                class_= lesson.class_,
                questions= lesson.questions
            )
        
### MUTATIONS ###
@strawberry.type
class Mutation:

    # Add or update a user during sign-in flow (Sign-in Page)
    @strawberry.mutation
    def create_or_update_user(
        self,
        google_sub: str,
        name: str,
        email: str,
        role: str,
        picture: Optional[str] = None,
    ) -> UserType:
        with Session(engine) as session:
            # Get the user object if it exists
            user = session.exec(select(User).where(User.google_sub == google_sub)).first()

            # If the user exists, update only name, email, picture (don't update the role of registered users)
            if user:
                user.name = name
                user.email = email
                user.picture = picture

            # If there is a new user, build a new User type with Google sub and role
            else:
                user = User(
                    google_sub=google_sub,
                    name=name,
                    email=email,
                    picture=picture,
                    role=role,
                )
                session.add(user)

            # Update database
            session.commit()
            session.refresh(user)
            return UserType(**user.model_dump())

    # Create a class (Dashboard Page, teachers only)
    @strawberry.mutation
    def create_class(self, name: str, teacher_id: int) -> ClassType:
        with Session(engine) as session:
            # Get the User type
            teacher = session.get(User, teacher_id)
            if not teacher:
                raise ValueError("Teacher not found.")
            if teacher.role != "teacher":
                raise ValueError("Only teachers can create classes.")

            # Build a new Class type
            new_class = Class(
                name=name,
                code=generate_class_code(),
                teacher_id=teacher.id,
            )

            # Update database
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
    
    # Join a class (Dashboard Page, students only)
    @strawberry.mutation
    def join_class(self, user_id: int, class_code: str) -> ClassType:
        with Session(engine) as session:
            # Get the User type
            user = session.get(User, user_id)
            if not user:
                raise ValueError("User not found.")
            if user.role != "student":
                raise ValueError("Only students can join classes.")

            # Get the Class type
            cls = session.exec(select(Class).where(Class.code == class_code)).first()
            if not cls:
                raise ValueError("Class not found.")

            # Check if the student is already in the class
            if user not in cls.students:
                # Update database
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
    
    # Create a lesson as part of a class (Class Page, teachers only)
    @strawberry.mutation
    def create_lesson(self, class_id: int, title: str) -> LessonType:
        with Session(engine) as session:
            # Get the class type
            class_obj = session.get(Class, class_id)
            if not class_obj:
                raise ValueError("Class not found.")

            # Create a new Lesson type
            new_lesson = Lesson(title=title, class_id=class_obj.id)
    
            # Update database
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
                questions=[],
                scores=[]
            )

    # Remove a lesson from a class (Class Page, teachers only)
    @strawberry.mutation
    def delete_lesson(self, class_id: int, lesson_id: str) -> bool:
        with Session(engine) as session:
            # Get the Class type
            class_obj = session.get(Class, class_id)
            if not class_obj:
                return False
            
            # Get the Lesson type
            lesson_to_delete = session.get(Lesson, lesson_id)
            if not lesson_to_delete or lesson_to_delete.class_id != class_id:
                return False

            # Delete lesson, update database
            session.delete(lesson_to_delete)
            session.commit()
            return True
    
    # Leave a class (Class Page, students only)
    @strawberry.mutation
    def leave_class(self, class_id: int, student_id: int) -> bool:
        with Session(engine) as session:
            # Get the Class type
            cls = session.get(Class, class_id)
            if not cls:
                raise ValueError("Class not found")

            # Get the User type
            student = session.get(User, student_id)
            if not student:
                raise ValueError("Student not found")
            
            # Check if the student is in the class
            if student in cls.students:
                # Delete the student's scores from the lesson
                session.exec(
                    delete(LessonScore).where(
                        LessonScore.user_id == student_id,
                        LessonScore.lesson_id.in_(
                            [lesson.id for lesson in cls.lessons]
                        )
                    )
                )
                # Remove the student from the class
                cls.students.remove(student)
                # Update database
                session.add(cls)
                session.commit()
                return True
            else:
                return False
    
    # Delete a Class (Class Page, teachers only)
    @strawberry.mutation
    def delete_class(self, class_id: int) -> bool:
        with Session(engine) as session:
            # Get the Class type
            cls = session.get(Class, class_id)
            if not cls:
                raise ValueError("Class not found")

            # Delete the class
            session.delete(cls)
            # Update database
            session.commit()
            return True
    
    # Add a question to a lesson (Create Question Form, teachers only)
    @strawberry.mutation
    def add_question_to_lesson(
        self,
        lesson_id: str,
        title: str,
        correct_answer: str,
        wrong_answers: List[str]
    ) -> Optional[QuestionType]:
        with Session(engine) as session:
            # Get the Lesson type
            lesson = session.get(Lesson, lesson_id)
            if not lesson:
                raise ValueError(f"Lesson with ID {lesson_id} not found")

            # Build the question
            question = Question(
                title=title,
                lesson_id=lesson_id,
                correct_answer=correct_answer,
                wrong_answers=wrong_answers
            )
            # Update database
            session.add(question)
            session.commit()

            
            # session.refresh(question)

            # return QuestionType(
            #     id=question.id,
            #     title=question.title,
            #     correct_answer=question.correct_answer,
            #     wrong_answers=question.wrong_answers,
            #     lesson=question.lesson
            # )

    # Add a lesson score to a lesson
    @strawberry.mutation
    def submit_lesson_score(
        self,
        lesson_id: str,
        user_id: int,
        score: float  # score as percentage (0–100)
    ) -> Optional["LessonScoreType"]:
        with Session(engine) as session:
            # Get Lesson type
            lesson = session.get(Lesson, lesson_id)
            if not lesson:
                raise ValueError(f"Lesson {lesson_id} not found")
            
            # Get User type
            user = session.get(User, user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            # Get the last score if it exists
            existing = session.exec(
                select(LessonScore)
                .where(LessonScore.lesson_id == lesson_id)
                .where(LessonScore.user_id == user_id)
            ).first()

            # If there's a previous score, update it with the new one
            if existing:
                existing.score = score
                session.add(existing)
                session.commit()
                # session.refresh(existing)
                # return existing

            # Otherwise, build a new LessonScore type
            lesson_score = LessonScore(
                lesson_id=lesson_id,
                user_id=user_id,
                score=score
            )
            
            # Update database
            session.add(lesson_score)
            session.commit()
            # session.refresh(lesson_score)

            # return LessonScoreType(
            #     lesson_id=lesson_score.id,
            #     user_id=lesson_score.user_id,
            #     score=lesson_score.score
            # )
    
    # Remove a question from a lesson
    @strawberry.mutation
    def delete_question(self, question_id: int) -> bool:
        with Session(engine) as session:
            # Get Question type
            question = session.get(Question, question_id)
            if not question:
                return False
            
            # Delete question, update database
            session.delete(question)
            session.commit()
            return True
        
    # Update a question with new data
    @strawberry.mutation
    def update_question(
        self,
        question_id: int,
        title: str,
        correct_answer: str,
        wrong_answers: List[str],
    ) -> Optional[QuestionType]:
        with Session(engine) as session:
            # Get Question type
            question = session.get(Question, question_id)
            if not question:
                return None

            # Update values of the question
            question.title = title
            question.correct_answer = correct_answer
            question.wrong_answers = wrong_answers

            # Update database
            session.add(question)
            session.commit()
            # session.refresh(question)

            # return QuestionType(
            #     id=question.id,
            #     title=question.title,
            #     correct_answer=question.correct_answer,
            #     wrong_answers=question.wrong_answers,
            #     lesson=None
            # )
        
schema = strawberry.Schema(query=Query, mutation=Mutation)

init_db()