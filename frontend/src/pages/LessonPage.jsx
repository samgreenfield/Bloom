import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import Navbar from "../components/Navbar";
import QuestionsList from "../components/QuestionsList";
import CreateQuestionForm from "../components/CreateQuestionForm";
import TakeQuizView from "../components/TakeQuizView";

{/* 
  LESSONPAGE.JSX:
  The component for pages at /class/CLASSID/lesson/LESSONID displays:
    - NavBar
    - For students: TakeQuizView
    - For teachers:
      - QuestionsList
      - Create Question button (displays CreateQuestionForm)
      - Preview as Student button (displays TakeQuizView)
*/}

// NOTE: NEED TO ADD STUDENT LIST WITH GRADES

// GraphQL query for getting the lesson by lesson's id
const GET_LESSON_BY_ID = gql`
  query GetLessonById($lessonId: String!) {
    lessonById(lessonId: $lessonId) {
      id
      title
      questions {
        id
        title
        correctAnswer
        wrongAnswers
      }
    }
  }
`;

// GraphQL mutation for deleting a question from a lesson
const DELETE_QUESTION = gql`
  mutation DeleteQuestion($questionId: Int!) {
    deleteQuestion(questionId: $questionId)
  }
`;

export default function LessonPage() {
  const { code, lessonId } = useParams();
  const [deleteQuestion] = useMutation(DELETE_QUESTION);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewAsStudent, setViewAsStudent] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Set data.lessonById = a Lesson type
  const { data, loading, error, refetch } = useQuery(GET_LESSON_BY_ID, {
    variables: { lessonId: lessonId},
    fetchPolicy: "network-only",
  });

  // Function to delete a question from a lesson
  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion({ variables: { questionId } });
      await refetch(); // refresh questions after delete
    } catch (err) {
      console.error("Error deleting question:", err);
    }
  };

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

  // Loading and error messages
  if (loading || !user) return <div>Loading...</div>;
  if (error){
    console.log(error)
    return <div>Error loading lesson.</div>;
  }

  const lesson = data.lessonById;
  const isTeacher = user.role === "teacher";

  return (
    <div className="min-h-screen bg-beige flex flex-col items-center">
      {/* Show Navbar */}
      <div className="w-full fixed top-0 left-0 z-10">
        <Navbar />
      </div>

      <div className="pt-24 w-full max-w-3xl flex flex-col items-center gap-6 px-4">
        <h1 className="text-3xl font-serif text-forest">{lesson.title}</h1>
        {/* If the user is a teacher (and not testing the lesson), show QuestionsList */}
        {isTeacher && !viewAsStudent && (
          <>
            <QuestionsList
              questions={lesson.questions}
              isTeacher={isTeacher}
              onDeleteQuestion={handleDeleteQuestion}
              onEditQuestion={(q) => {
                setEditingQuestion(q);
                setShowEditForm(true);
              }}
            />
            {/* Button to create a question */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-forest text-beige px-6 py-3 rounded-xl hover:bg-green-900 transition"
            >
              + Create Question
            </button>
            {/* Button to view as a student (test lesson) */}
            <button
              onClick={() => setViewAsStudent(true)}
              className="text-sm text-forest underline hover:text-black mt-2"
            >
              Preview as Student
            </button>
            
            {/* On show create form, show CreateQuestionForm */}
            {showCreateForm && (
              <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/30">
                <CreateQuestionForm
                  lessonId={lesson.id}
                  onClose={() => setShowCreateForm(false)}
                  onCreated={refetch}
                />
              </div>
            )}

            {/* If editing a question, show CreateQuestionForm with data from the question being edited */}
            {showEditForm && editingQuestion && (
              <CreateQuestionForm
                isEditing
                initialData={editingQuestion}
                onClose={() => setShowEditForm(false)}
                onUpdated={refetch}
              />
            )}
          </>
        )}

        {/* If a teacher wants to test the lesson, show TakeQuizView */}
        {isTeacher && viewAsStudent && (
          <>
            <TakeQuizView
              questions={lesson.questions}
              onExit={() => setViewAsStudent(false)}
            />
          </>
        )}

        {/* If user is a student (not isTeacher), show TakeQuizView */}
        {!isTeacher && <TakeQuizView questions={lesson.questions} user={user} lessonId={lesson.id} onExit={() => navigate(`/class/${code}`)} />}
      </div>
    </div>
  );
}