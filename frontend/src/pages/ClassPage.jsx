import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import Navbar from "../components/Navbar";
import ClassHeader from "../components/ClassHeader";
import LessonsList from "../components/LessonsList";
import StudentsList from "../components/StudentsList"; // placeholder
import ClassFooter from "../components/ClassFooter"; // placeholder

{/* 
  CLASSPAGE.JSX:
  The component for pages at /class/CLASSID
    - Queries the database for the given class
    - Displays:
      - Class header (ClassHeader.jsx)
      - List of lessons in the class (LessonsList.jsx)
      - New lesson button (teachers only)
      - Student List (StudentsList.jsx, teachers only)
      - Class footer (ClassFooter.jsx)
*/}

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

// GraphQL mutation to create a lesson as part of a class
const CREATE_LESSON = gql`
  mutation CreateLesson($classId: Int!, $title: String!) {
    createLesson(classId: $classId, title: $title) {
      id
      title
    }
  }
`;

// GraphQL mutation to delete a lesson from a class
const DELETE_LESSON = gql`
  mutation DeleteLesson($classId: Int!, $lessonId: String!) {
    deleteLesson(classId: $classId, lessonId: $lessonId)
  }
`;

// GraphQL mutation to delete a class
const DELETE_CLASS = gql`
  mutation DeleteClass($classId: Int!) {
    deleteClass(classId: $classId)
  }
`;

// GraphQL mutation to remove a student from a class
const REMOVE_STUDENT = gql`
  mutation RemoveStudent($classId: Int!, $studentId: Int!) {
    leaveClass(classId: $classId, studentId: $studentId)
  }
`;

// GraphQL mutation to remove a student from a class
// NOTE: Redundant- need only one of REMOVE_STUDENT, LEAVE CLASS. Remove one and test.
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

  // Set data.classByCode = a Class type
  const { data, loading, error } = useQuery(GET_CLASS_BY_CODE, {
    variables: { code },
    // Get fresh data
    fetchPolicy: "network-only",
  });

  // Mutation functions
  const [createLesson] = useMutation(CREATE_LESSON);
  const [deleteLesson] = useMutation(DELETE_LESSON);
  const [removeStudent] = useMutation(REMOVE_STUDENT);
  const [deleteClassMutation] = useMutation(DELETE_CLASS);
  const [leaveClassMutation] = useMutation(LEAVE_CLASS);

  // Confirm user is signed in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // If not signed in, go to the signin page
    if (!storedUser) {
      navigate("/signin");
      return;
    }
    // Otherwise, set user = a User type
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  // Set students = a list of User types for the class
  useEffect(() => {
    if (data?.classByCode?.students) {
        setStudents(data.classByCode.students);
    }
  }, [data]);     

  // Set lessons = a list of Lesson types for the class
  useEffect(() => {
    if (data?.classByCode?.lessons) {
      setLessons(data.classByCode.lessons);
    }
  }, [data]);

  // Loading and error messages
  if (loading || !user) return <div>Loading...</div>;
  if (error) return <div>Error loading class data.</div>;

  // If loaded, classData is the Class type
  const classData = data.classByCode;

  // Set vars to ensure the user sees the correct data (and only the data they have access to)
  const isTeacher = classData.teacher.id === user.id;
  const isStudent = classData.students.some((s) => s.id === user.id);
  if (!isTeacher && !isStudent) return <div>You do not have access to this class.</div>;


  // Function to create lesson on button press
  const handleCreateLesson = async () => {
    // Must have a title
    if (!newLessonTitle) return;

    try {
      // Send mutation to create a lesson
      const { data } = await createLesson({
        variables: { classId: classData.id, title: newLessonTitle },
      });
      
      // Lessons = lessons + new lesson
      setLessons((prev) => [...prev, data.createLesson]);
      // Reset new lesson UI
      setNewLessonTitle("");
      setShowNewLessonInput(false);
    } catch (err) {
      console.error("Error creating lesson:", err);
    }
  };

  // Function to delete lesson on button press
  const handleDeleteLesson = async (lessonId) => {
    try {
      // Send mutation to delete a lesson
      await deleteLesson({ variables: { classId: classData.id, lessonId } });
      // Lessons = lessons - deleted lesson
      setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    }
  };

  // Function to delete a class
  const handleDeleteClass = async () => {
        try {
            // Send mutation to delete class
            await deleteClassMutation({ variables: { classId: classData.id } });
            // Go back to the dashboard page after deleting the class
            navigate("/dashboard");
        } catch (err) {
            console.error("Failed to delete class:", err);
        }
  };

  // Function to remove a student from a class on button press
  const handleRemoveStudent = async (studentId) => {
    try {
        // Send mutation to remove student from class
        await removeStudent({ variables: { classId: classData.id, studentId: studentId } });
        // Students = students - deleted student
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
        console.error("Failed to remove student:", err);
    }
  };

  // Function to leave a class as a student
  // NOTE: SAME REDUNDANCY AS REMOVE_STUDENT vs. LEAVE_CLASS
  const handleLeaveClass = async () => {
      try {
          await leaveClassMutation({ variables: { classId: classData.id, studentId: user.id } });
          navigate("/dashboard");
      } catch (err) {
          console.error("Failed to leave class:", err);
      }
  };

  // ClassPage Display
  return (

    <div className="pt-24 w-full flex flex-col items-center gap-6">
        {/* Show Navbar */}
        <div className="w-full fixed top-0 left-0 z-10">
            <Navbar />
        </div>

        {/* Align ClassHeader and LessonsList */}
        <div className="w-full max-w-4xl flex flex-col gap-4">
            <ClassHeader classData={classData} className="w-full" />
            
            {/* If there are lessons, show a LessonsList with the lessons */}
            {lessons.length > 0 && (
              <LessonsList
                  lessons={lessons}
                  isTeacher={isTeacher}
                  onDeleteLesson={handleDeleteLesson}
                  numStudents={classData.students.length}
                  user_id={user?.id}
              />
            )}

        {/* If the user is a teacher, show buttons to create a new lesson */}
        {isTeacher && (
        <div className="flex flex-col items-center gap-2 w-full">
            {/* If the New Lesson button hasn't been clicked, show it */}
            {!showNewLessonInput && (
            <button
                className="bg-forest text-beige px-6 py-2 rounded-xl hover:bg-green-900 transition"
                onClick={() => setShowNewLessonInput(true)}
            >
                + New Lesson
            </button>
            )}

            {/* After pressing the button, show the lesson creation box */}
            {showNewLessonInput && (
            <div className="flex gap-2 w-full">
                {/* Lesson title box */}
                <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Lesson title"
                className="border border-gray-300 rounded-xl px-4 py-2 flex-1"
                />

                {/* Create lesson button */}
                <button
                onClick={handleCreateLesson}
                className="bg-forest text-beige px-4 py-2 rounded-xl hover:bg-green-900 transition"
                >
                Add
                </button>
                
                {/* Cancel lesson creation button */}
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

        {/* If the user is a teacher, show StudentsList */}
        {isTeacher && (
            <StudentsList students={students} onRemoveStudent={handleRemoveStudent} />
        )}

        {/* HARD CODE: DON'T SHOW THE DEMO USER A FOOTER TO LEAVE CLASS */}
        {/* NOTE: ONLY IN PROD */}
        {/* {!(user.id===2) && */}
        <ClassFooter 
            isTeacher={isTeacher}
            onDeleteClass={handleDeleteClass}
            onLeaveClass={handleLeaveClass}
        />
        {/* } */}
    </div>
    </div>
  );
}