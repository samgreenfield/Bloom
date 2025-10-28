import React from "react";
import { useEffect, useState } from "react";
import * as ReactOAuth from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { gql } from "@apollo/client";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import Navbar from "../components/Navbar";

{/* 
  SIGNINPAGE.JSX:
  The component for /signin displays:
    - NavBar
    - Signin form:
      - Teachers --> Google OAuth --> Add user
      - Students --> Class code (optional) --> Google OAuth --> Add user
      - Previously registered users --> Google OAuth (only name, email, picture are updated)
*/}


// GraphQL mutation to create or update a user
const CREATE_OR_UPDATE_USER = gql`
  mutation CreateOrUpdateUser(
    $googleSub: String!
    $name: String!
    $email: String!
    $picture: String
    $role: String!
  ) {
    createOrUpdateUser(
      googleSub: $googleSub
      name: $name
      email: $email
      picture: $picture
      role: $role
    ) {
      id
      name
      email
      role
    }
  }
`;

// GraphQL mutation to get a User type from the user's Google id
const GET_USER_BY_GOOGLE_SUB = gql`
  query GetUserByGoogleSub($googleSub: String!) {
    userByGoogleSub(googleSub: $googleSub) {
      id
      name
      email
      role
    }
  }
`;

// GraphQL mutation to add a student to a class
const JOIN_CLASS = gql`
  mutation JoinClass($userId: Int!, $classCode: String!) {
    joinClass(userId: $userId, classCode: $classCode) {
      id
      name
      code
    }
  }
`;

export default function SigninPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [classCode, setClassCode] = useState("");
  const [createOrUpdateUser] = useMutation(CREATE_OR_UPDATE_USER);
  const [getUserByGoogleSub] = useLazyQuery(GET_USER_BY_GOOGLE_SUB);
  const [joinClass] = useMutation(JOIN_CLASS);

  // Check if there is already a user signed in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      // If there is a user, navigate to dashboard
      const user = JSON.parse(storedUser);
      window.location.href = "/dashboard";
    }
  }, []);

  // Function to determine whether to ask for a class code
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    // Teachers skip to step 3
    if (selectedRole === "teacher") setStep(3);
    // Students move to step 2
    else setStep(2);
  };

  // Function to handle submission of an optional class code on register
  const handleClassSubmit = (e) => {
    // Don't reload page, keep the class
    e.preventDefault();
    // Send students to step 3
    setStep(3);
  };

  // Function to sign in a user if OAuth succeeds
  const handleGoogleSuccess = async (credentialResponse) => {
    // Sanity check for credential response
    if (!credentialResponse.credential) {
      console.error("No credential found in response.");
      return;
    }

    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleSub = decoded.sub;

      // Set body.userByGoogleSub = a User type if the user was already registered
      const {body} = await getUserByGoogleSub({
        variables: {
          googleSub: googleSub
        }
      })

      const existingUser = body?.userByGoogleSub;

      // If the user was already registered, navigate to dashboard
      if (existingUser) {
        const dashboard = "/dashboard"
        window.location.href = dashboard;
        return;
      }

      // For new users, create a new user in the db
      const {data} = await createOrUpdateUser({
        variables: {
          googleSub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          role
        },
      });

      // Set user = the new User type
      const user = data.createOrUpdateUser;

      // If a classcode was given, add the student to that class
      if (classCode && role === "student") {
        try {
          await joinClass({
            variables: {
              userId: user.id,
              classCode: classCode,
            },
          });
        } catch (err) {
          console.error("Failed to join class:", err);
        }
      }

      // Set local user to be the user, navigate to dashboard
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

      <div className="flex-grow flex items-center justify-center px-6 pt-16">
        <div className="bg-white rounded-3xl shadow-md p-10 w-full max-w-md text-center flex flex-col items-center">
          {/* On step 1, ask if teacher or student */}
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
                Already using Bloom? Sign in here.
              </button>
            </>
          )}

          {/* On step 2, students can submit an optional class code to join on registration */}
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

          {/* On step 3, users use Google OAuth to sign in */}
          {step === 3 && (
            <>
              <h2 className="text-3xl font-serif text-forest mb-6">
                Log in to start growing.
              </h2>
              <ReactOAuth.GoogleLogin
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