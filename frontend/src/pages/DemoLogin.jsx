import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

{/* 
  DEMOLOGIN.JSX:
  The component for /demo
    - Builds the demo user (who is added to the demo class IN PROD)
    - Redirects to the demo lesson at /class/PROD_DEMO_CLASS/lesson/PROD_DEMO_LESSON
    - NOTE: HARD CODED- demo user is id = 2.
*/}

export default function DemoLogin() {
  const navigate = useNavigate();

  // Create a dmeo user
  useEffect(() => {
    const demoUser = {
      id: 2,
      name: "DEMO USER",
      email: "demouser@example.com",
      role: "student", // or "student"
      google_sub: "DEMOUSER",
    };

    // Set local user as demo user
    localStorage.setItem("user", JSON.stringify(demoUser));
    // Navigate to lesson (HARD CODED)
    navigate("/class/Z0QB23JK/lesson/FY71S22X");
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-beige text-forest">
      <h1 className="text-3xl font-serif mb-4">Signing in as Demo User...</h1>
      <p className="text-gray-600">Redirecting to your dashboard...</p>
    </div>
  );
}