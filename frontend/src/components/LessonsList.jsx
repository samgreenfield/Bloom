import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function LessonsList({ lessons, user_id, isTeacher, onDeleteLesson, numStudents }) {
  const navigate = useNavigate();
  const { code } = useParams();

  const handleLessonClick = (lessonId) => {
    navigate(`/class/${code}/lesson/${lessonId}`);
  };

  const calculateAverage = (scores) => {
    if (!scores || scores.length === 0) return null;
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    return Math.round(total / scores.length);
  };

  return (
    <div className="lessons-list mt-6 w-full">
      <h2 className="text-xl font-semibold mb-4">Lessons</h2>
      <ul className="space-y-3">
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            onClick={() => handleLessonClick(lesson.id)}
            className="flex justify-between items-center bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition"
          >
            <div>
              <p className="font-medium">{lesson.title}</p>

              {isTeacher ? (
                <p className="text-sm text-gray-500">
                  Completed by{" "}
                  <span className="font-medium text-forest">
                    {lesson.scores.length ?? 0}/{numStudents ?? 0}
                  </span>{" "}
                  students. Average grade:{" "}
                  <span className="font-medium text-forest">
                    {(calculateAverage(lesson.scores) || 0) + "%"}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Current Grade:{" "}
                  <span className="font-medium text-forest">
                    {(Math.round(lesson.scores.find(s => s.userId === user_id)?.score) || 0) + "%"}
                  </span>
                </p>
              )}
            </div>

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