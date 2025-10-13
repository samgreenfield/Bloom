// src/components/StudentDashboard.jsx
import React from "react";
import Navbar from "../Navbar";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-beige flex flex-col">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Navbar />
      </div>

      {/* Main content */}
      <div className="pt-20 px-6 w-full flex justify-center">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-serif text-forest mb-6">
            Student Dashboard
          </h1>

          {/* Progress summary */}
          <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-sans text-forest mb-4">
              Your Progress
            </h2>
            <p className="text-text font-sans">Lessons completed: 0/0</p>
            <p className="text-text font-sans">Next lesson: TBD</p>
          </div>

          {/* Teacher info */}
          <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-sans text-forest mb-4">
              Assigned Teacher
            </h2>
            <p className="text-text font-sans">Teacher Name</p>
            <p className="text-text font-sans">Class Code: ABC123</p>
          </div>

          {/* Additional student widgets */}
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h2 className="text-2xl font-sans text-forest mb-4">
              Lessons to Work On
            </h2>
            <ul className="list-disc list-inside font-sans text-text">
              <li>Lesson 1</li>
              <li>Lesson 2</li>
              <li>Lesson 3</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}