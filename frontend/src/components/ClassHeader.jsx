import React from "react";

export default function ClassHeader({ classData }) {
  if (!classData) return null;

  return (
    <div className="w-full bg-white shadow-md p-6 rounded-xl max-w-5xl mx-auto flex flex-col gap-2">
      <h1 className="text-2xl font-serif text-forest">{classData.name}</h1>
          <p>
          Teacher:{" "}
          <a
            href={`mailto:${classData.teacher.email}`}
            className="text-blue-600 underline"
          >
            {classData.teacher.name}
          </a>
        </p>
        <p className="text-sm text-gray-600">Class Code: {classData.code}</p>
    </div>
  );
}