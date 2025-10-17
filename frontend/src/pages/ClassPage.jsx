import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import Navbar from "../components/Navbar";
import ClassHeader from "../components/ClassHeader";
import LessonsList from "../components/LessonsList";
import StudentsList from "../components/StudentsList"; // placeholder
import ClassFooter from "../components/ClassFooter"; // placeholder

// GraphQL query to get class info by code
const GET_CLASS_BY_CODE = gql`
  query GetClassByCode($code: String!) {
    classByCode(code: $code) {
      id
      name
      code
      teacher {
        name
        id
        email
      }
      students {
        name
        id
        email
      }
      lessons {
        id
        title
        scores {
          userId
          score
        }
      }
    }
  }
`;

const CREATE_LESSON = gql`
  mutation CreateLesson($classId: Int!, $title: String!) {
    createLesson(classId: $classId, title: $title) {
      id
      title
    }
  }
`;

const DELETE_LESSON = gql`
  mutation DeleteLesson($classId: Int!, $lessonId: String!) {
    deleteLesson(classId: $classId, lessonId: $lessonId)
  }
`;

const REMOVE_STUDENT = gql`
  mutation RemoveStudent($classId: Int!, $studentId: Int!) {
    leaveClass(classId: $classId, studentId: $studentId)
  }
`;

const DELETE_CLASS = gql`
  mutation DeleteClass($classId: Int!) {
    deleteClass(classId: $classId)
  }
`;

const LEAVE_CLASS = gql`
  mutation LeaveClass($classId: Int!, $studentId: Int!) {
    leaveClass(classId: $classId, studentId: $studentId)
  }
`;

export default function ClassPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [showNewLessonInput, setShowNewLessonInput] = useState(false);
  const [students, setStudents] = useState([]);


  const { data, loading, error } = useQuery(GET_CLASS_BY_CODE, {
    variables: { code },
    fetchPolicy: "network-only",
  });

  const [createLesson] = useMutation(CREATE_LESSON);
  const [deleteLesson] = useMutation(DELETE_LESSON);
  const [removeStudent] = useMutation(REMOVE_STUDENT);
  const [deleteClassMutation] = useMutation(DELETE_CLASS);
  const [leaveClassMutation] = useMutation(LEAVE_CLASS);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/signin");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (data?.classByCode?.students) {
        setStudents(data.classByCode.students);
    }
  }, [data]);     

  // Update lessons state when query data loads
  useEffect(() => {
    if (data?.classByCode?.lessons) {
      setLessons(data.classByCode.lessons);
    }
  }, [data]);

  if (loading || !user) return <div>Loading...</div>;
  if (error) return <div>Error loading class data.</div>;

  const classData = data.classByCode;

  // Authorization
  const isTeacher = classData.teacher.id === user.id;
  const isStudent = classData.students.some((s) => s.id === user.id);
  if (!isTeacher && !isStudent) return <div>You do not have access to this class.</div>;

  const handleCreateLesson = async () => {
    if (!newLessonTitle) return;

    try {
      const { data } = await createLesson({
        variables: { classId: classData.id, title: newLessonTitle },
      });

      setLessons((prev) => [...prev, data.createLesson]);
      setNewLessonTitle("");
      setShowNewLessonInput(false);
    } catch (err) {
      console.error("Error creating lesson:", err);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      console.log(classData.id)
      await deleteLesson({ variables: { classId: classData.id, lessonId } });
      setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
        await removeStudent({ variables: { classId: classData.id, studentId: studentId } });
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
        console.error("Failed to remove student:", err);
    }
  };

  const handleDeleteClass = async () => {
        try {
            await deleteClassMutation({ variables: { classId: classData.id } });
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to delete class:", err);
        }
  };

    const handleLeaveClass = async () => {
        try {
            await leaveClassMutation({ variables: { classId: classData.id, studentId: user.id } });
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to leave class:", err);
        }
    };

  return (
    <div className="pt-24 w-full flex flex-col items-center gap-6">
        <div className="w-full fixed top-0 left-0 z-10">
            <Navbar />
        </div>
    {/* Container to align header and lessons list */}
    <div className="w-full max-w-4xl flex flex-col gap-4">
        <ClassHeader classData={classData} className="w-full" />

        {lessons.length > 0 && (
          <LessonsList
              lessons={lessons}
              isTeacher={isTeacher}
              onDeleteLesson={handleDeleteLesson}
              numStudents={classData.students.length}
              user_id={user?.id}
          />
        )}

        {isTeacher && (
        <div className="flex flex-col items-center gap-2 w-full">
            {!showNewLessonInput && (
            <button
                className="bg-forest text-beige px-6 py-2 rounded-xl hover:bg-green-900 transition"
                onClick={() => setShowNewLessonInput(true)}
            >
                + New Lesson
            </button>
            )}

            {showNewLessonInput && (
            <div className="flex gap-2 w-full">
                <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Lesson title"
                className="border border-gray-300 rounded-xl px-4 py-2 flex-1"
                />
                <button
                onClick={handleCreateLesson}
                className="bg-forest text-beige px-4 py-2 rounded-xl hover:bg-green-900 transition"
                >
                Add
                </button>
                <button
                onClick={() => setShowNewLessonInput(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
                >
                Cancel
                </button>
            </div>
            )}
        </div>
        )}

        {isTeacher && (
            <StudentsList students={students} onRemoveStudent={handleRemoveStudent} />
        )}
        {!(user.id===2) &
        <ClassFooter 
            isTeacher={isTeacher}
            onDeleteClass={handleDeleteClass}
            onLeaveClass={handleLeaveClass}
        />
        }
    </div>
    </div>
  );
}