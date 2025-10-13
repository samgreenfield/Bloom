import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      // If no user is signed in, redirect to questionnaire/login
      window.location.href = "/questionnaire";
      return;
    }

    setUser(JSON.parse(storedUser));
  }, []);

  if (!user) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-beige flex flex-col">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Navbar />
      </div>

      {/* Page content */}
      <div className="flex-1 pt-24 px-6">
        <h1 className="text-3xl font-serif text-forest mb-6">
          Welcome, {user.name}
        </h1>

        {/* Example: list of classes or students */}
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-forest mb-4">
            Your Classes
          </h2>
          <p className="text-text font-sans">
            This is where teacher-specific content will go.
          </p>
        </div>
      </div>
    </div>
  );
}