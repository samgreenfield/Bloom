import React from "react";

export default function StudentsList({ students, onRemoveStudent }) {
  if (!students || students.length === 0) return <div>No students enrolled yet.</div>;

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-4 flex flex-col gap-3">
      <h3 className="text-xl font-semibold mb-2">Enrolled Students</h3>
      <ul className="flex flex-col gap-2">
        {students.map((student) => (
          <li
            key={student.id}
            className="flex justify-between items-center bg-gray-100 rounded-xl px-4 py-2"
          >
            <span>{student.name}</span>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition"
              onClick={() => onRemoveStudent(student.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}