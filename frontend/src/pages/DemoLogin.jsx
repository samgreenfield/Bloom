import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DemoLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    // Define a fake "demo" user
    const demoUser = {
      id: 2,
      name: "DEMO USER",
      email: "demouser@example.com",
      role: "student", // or "student"
      google_sub: "DEMOUSER",
    };

    // Save to localStorage so the app treats this user as signed in
    localStorage.setItem("user", JSON.stringify(demoUser));

    // Redirect to dashboard
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-beige text-forest">
      <h1 className="text-3xl font-serif mb-4">Signing in as Demo User...</h1>
      <p className="text-gray-600">Redirecting to your dashboard...</p>
    </div>
  );
}