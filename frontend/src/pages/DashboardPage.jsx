import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ClassesWidget from "../components/ClassesWidgets";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

// Teacher: create class
const CREATE_CLASS = gql`
  mutation CreateClass($name: String!, $teacherId: Int!) {
    createClass(name: $name, teacherId: $teacherId) {
      id
      name
      code
    }
  }
`;

// Student: join class by code
const JOIN_CLASS = gql`
  mutation JoinClass($userId: Int!, $classCode: String!) {
    joinClass(userId: $userId, classCode: $classCode) {
      id
      name
      code
    }
  }
`;

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [newClassName, setNewClassName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [createClass] = useMutation(CREATE_CLASS);
  const [joinClass] = useMutation(JOIN_CLASS);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/questionnaire";
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  if (!user) return null;

  // Teacher: handle class creation
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName) return;

    try {
      await createClass({
        variables: { name: newClassName, teacherId: user.id },
      });
      setNewClassName("");
      window.location.reload(); // refresh classes
    } catch (err) {
      console.error("Error creating class:", err);
    }
  };

  // Student: handle joining a class
  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!joinCode) return;

    try {
      await joinClass({
        variables: { userId: user.id, classCode: joinCode },
      });
      setJoinCode("");
      window.location.reload(); // refresh classes
    } catch (err) {
      console.error("Error joining class:", err);
    }
  };

  return (
    <div className="min-h-screen bg-beige flex flex-col items-center">
      {/* Navbar */}
      <div className="w-full fixed top-0 left-0 z-10">
        <Navbar />
      </div>

      {/* Dashboard Content */}
      <div className="pt-24 w-full flex flex-col items-center gap-8">
        <h2 className="text-3xl font-serif text-forest mb-4">Your Classes</h2>

        {/* Classes Widget */}
        <div className="w-full max-w-5xl">
          <ClassesWidget userId={user.id} />
        </div>

        {/* Teacher: Create Class */}
        {user.role === "teacher" && (
          <div className="bg-white rounded-3xl shadow-md p-6 w-full max-w-md flex flex-col items-center gap-4">
            <h3 className="text-xl font-serif text-forest">Create a New Class</h3>
            <form
              onSubmit={handleCreateClass}
              className="flex flex-col w-full gap-3 items-center"
            >
              <input
                type="text"
                placeholder="Class Name"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 font-sans w-full"
              />
              <button
                type="submit"
                className="bg-forest text-beige px-6 py-3 rounded-xl font-sans hover:bg-green-900 transition w-full"
              >
                Create Class
              </button>
            </form>
          </div>
        )}

        {/* Student: Join Class */}
        {user.role === "student" && (
          <div className="bg-white rounded-3xl shadow-md p-6 w-full max-w-md flex flex-col items-center gap-4">
            <h3 className="text-xl font-serif text-forest">Join a Class</h3>
            <form
              onSubmit={handleJoinClass}
              className="flex flex-col w-full gap-3 items-center"
            >
              <input
                type="text"
                placeholder="Class Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 font-sans w-full"
              />
              <button
                type="submit"
                className="bg-forest text-beige px-6 py-3 rounded-xl font-sans hover:bg-green-900 transition w-full"
              >
                Join Class
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}