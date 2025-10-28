import { useNavigate, useParams } from "react-router-dom";

{/* 
  QUESTIONSLIST.JSX:
  The component listing questions in a lesson displays:
    - Each question in the lesson
    - The question's average accuracy (NOTE: NOT FUNCTIONAL- CURRENTLY SAYS "No responses yet")
    - Edit and delete buttons
*/}

export default function QuestionsList({ questions, isTeacher, onDeleteQuestion, onEditQuestion }) {

  return (
    <div className="questions-list w-full bg-white rounded-xl shadow p-6 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-forest">Questions</h2>

      {/* Display "no questions yet" if questions list is empty */}
      {questions.length === 0 ? (
        <p className="text-gray-500">No questions yet.</p>
      ) : (
        <ul className="space-y-3">
          {/* For each question, show The questions title and correct_count (NOTE: NOT FUNCTIONAL) */}
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex justify-between items-center bg-beige p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div>
                <p className="font-medium text-lg">{q.title}</p>
                <p className="text-sm text-gray-500">
                  {q.correct_count !== undefined
                    ? `${q.correct_count} students correct`
                    : "No responses yet"}
                </p>
              </div>
              {/* Show edit and delete question buttons (NOTE: isTeacher check is redundant- fix and test) */}
              <div className="flex gap-2">
                {isTeacher && (
                  <>
                    <button
                      onClick={() => onEditQuestion(q)}
                      className="bg-forest text-beige px-3 py-1 rounded hover:bg-green-900 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}