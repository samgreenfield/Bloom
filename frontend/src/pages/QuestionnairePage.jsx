import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import Navbar from "../components/Navbar";

const CREATE_OR_UPDATE_USER = gql`
  mutation CreateOrUpdateUser(
    $googleSub: String!
    $name: String!
    $email: String!
    $picture: String
    $role: String!
    $classCode: String
  ) {
    createOrUpdateUser(
      googleSub: $googleSub
      name: $name
      email: $email
      picture: $picture
      role: $role
      classCode: $classCode
    ) {
      id
      name
      email
      role
      classCodes
    }
  }
`;

export default function QuestionnairePage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [classCode, setClassCode] = useState("");
  const [createOrUpdateUser] = useMutation(CREATE_OR_UPDATE_USER);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      window.location.href = dashboard;
    }
  }, []);

  // Handlers (temporary placeholders)
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "teacher") setStep(3);
    else setStep(2);
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("No credential found in response.");
      return;
    }

    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleSub = decoded.sub;

      const query = `
        query GetUserByGoogleSub($googleSub: String!) {
          userByGoogleSub(googleSub: $googleSub) {
            id
            name
            email
            role
            classCode
          }
        }
      `;

      const body = JSON.stringify({
        query,
        variables: { googleSub },
      });

      const res = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const json = await res.json();
      const existingUser = json.data?.userByGoogleSub;

      if (existingUser) {
        const dashboard = "/dashboard"
        window.location.href = dashboard;
        return;
      }

      const {data} = await createOrUpdateUser({
        variables: {
          googleSub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          role,
          classCode,
        },
      });

      const user = data.createOrUpdateUser;
      localStorage.setItem("user", JSON.stringify(user));
      const dashboard = "/dashboard";
      window.location.href = dashboard;

    } catch (err) {
      console.error("Error processing Google sign-in:", err);
    }
  };

  const handleGoogleError = () => {
    console.log("Google sign-in failed");
  };

  return (
    <div className="min-h-screen bg-beige relative flex flex-col">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Navbar />
      </div>

      {/* Centered content */}
      <div className="flex-grow flex items-center justify-center px-6 pt-16">
        <div className="bg-white rounded-3xl shadow-md p-10 w-full max-w-md text-center flex flex-col items-center">
          {step === 1 && (
            <>
              <h2 className="text-3xl font-serif text-forest mb-6">
                Welcome to Bloom
              </h2>
              <p className="text-lg font-sans text-text mb-8">
                Are you a teacher or a student?
              </p>
              <div className="flex gap-4 justify-center mb-4">
                <button
                  onClick={() => handleRoleSelect("teacher")}
                  className="bg-forest text-beige px-6 py-3 rounded-xl font-sans hover:bg-green-900 transition"
                >
                  I’m a Teacher
                </button>
                <button
                  onClick={() => handleRoleSelect("student")}
                  className="bg-beige text-forest border border-forest px-6 py-3 rounded-xl font-sans hover:bg-green-900 hover:text-beige transition"
                >
                  I’m a Student
                </button>
              </div>
              <button
                onClick={() => setStep(3)}
                className="text-sm text-forest underline hover:text-black transition"
              >
                Already using Bloom? Sign in
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-3xl font-serif text-forest mb-6">
                Enter a class code if you have one.
              </h2>
              <form
                onSubmit={handleClassSubmit}
                className="w-full flex flex-col items-center"
              >
                <input
                  type="text"
                  placeholder="Class Code (optional)"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-2 font-sans w-3/4 mb-6"
                />
                <button
                  type="submit"
                  className="bg-forest text-beige px-6 py-3 rounded-xl font-sans hover:bg-black transition"
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-3xl font-serif text-forest mb-6">
                Log in to start growing.
              </h2>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}