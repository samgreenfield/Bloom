import { useNavigate, useParams } from "react-router-dom";

{/* 
  LESSONSLIST.JSX:
  The component listing lessons in a class displays:
    - Each lesson in the class
      - Lesson name
      - For students: their current grade on the lesson
      - For teachers:
        - Number of students who have completed the question
        - Average grade for the lesson
        - Button to delete the lesson
*/}

export default function LessonsList({ lessons, user_id, isTeacher, onDeleteLesson, numStudents }) {
  const navigate = useNavigate();
  const { code } = useParams();

  // Function to navigate to a lesson when clicked
  const handleLessonClick = (lessonId) => {
    navigate(`/class/${code}/lesson/${lessonId}`);
  };

  // Function to calculate the average score for a lesson
  const calculateAverage = (scores) => {
    if (!scores || scores.length === 0) return null;
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    return Math.round(total / scores.length);
  };

  return (
    <div className="lessons-list mt-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Lessons</h2>
      <ul className="space-y-3">
        {/* For each lesson, show the box with its information */}
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            onClick={() => handleLessonClick(lesson.id)}
            className="flex justify-between items-center bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-medium">{lesson.title}</p>
              {isTeacher ? (
                // Teachers see completion ratio and average grade
                <p className="text-sm text-gray-500">
                  Completed by{" "}
                  <span className="font-medium text-forest">
                    {lesson.scores?.length ?? 0}/{numStudents ?? 0}
                  </span>{" "}
                  students. Average grade:{" "}
                  <span className="font-medium text-forest">
                    {(calculateAverage(lesson.scores) || 0) + "%"}
                  </span>
                </p>
              ) : (
                // Students see their current grade
                <p className="text-sm text-gray-500">
                  Current Grade:{" "}
                  <span className="font-medium text-forest">
                    {(Math.round(lesson.scores.find(s => s.userId === user_id)?.score) || 0) + "%"}
                  </span>
                </p>
              )}
            </div>
            
            {/* Teachers see button to delete lesson */}
            {isTeacher && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteLesson(lesson.id);
                }}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}