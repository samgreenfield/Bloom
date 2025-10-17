import { useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";


const JOIN_CLASS = gql`
  mutation JoinClass($userId: Int!, $classCode: String!) {
    joinClass(userId: $userId, classCode: $classCode) {
      id
      name
      code
    }
  }
`;

export default function DemoLogin() {
  const navigate = useNavigate();
  const [joinClass] = useMutation(JOIN_CLASS);

  useEffect(() => {
    const demoUser = {
      id: 2,
      name: "DEMO USER",
      email: "demouser@example.com",
      role: "student", // or "student"
      google_sub: "DEMOUSER",
    };

  joinClass({
        variables: { userId: 2, classCode: "RA5ONSOQ" },
  }); 

  localStorage.setItem("user", JSON.stringify(demoUser));

    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-beige text-forest">
      <h1 className="text-3xl font-serif mb-4">Signing in as Demo User...</h1>
      <p className="text-gray-600">Redirecting to your dashboard...</p>
    </div>
  );
}