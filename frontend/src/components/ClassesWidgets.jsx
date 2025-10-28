import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

{/* 
  CLASSESWIDGETS.JSX:
  The component listing classes a user is part of displays:
    - A list of widget-like boxes for each class
    - Each widget has class name and class code
*/}

// GraphQL query to fetch all classes for a user by user ID
const GET_CLASSES_FOR_USER = gql`
  query GetClassesForUser($userId: Int!) {
    classesForUser(userId: $userId) {
      id
      name
      code
    }
  }
`;

export default function ClassesWidget({ userId }) {
  const navigate = useNavigate();
  
  // Set data.classesForUser = list of Class types for the user
  const { data, loading, error } = useQuery(GET_CLASSES_FOR_USER, {
    variables: { userId },
    fetchPolicy: "network-only",
  });

  // Loading and error messages
  if (loading) return <p>Loading classes...</p>;
  if (error) return <p>Error loading classes.</p>;

  const classes = data?.classesForUser || [];

  if (!classes.length) return <p></p>;

  return (
    <div className="w-full flex justify-center px-20">
      {/* Grid div */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* For each class, display a box with the class name and code */}
        {classes.map((cls) => (
          <div
            key={cls.id}
            onClick={() => navigate(`/class/${cls.code}`)}
            className="cursor-pointer bg-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition"
          >
            <h3 className="font-serif text-xl text-forest mb-2">{cls.name}</h3>
            <p className="font-sans text-sm text-gray-600">Code: {cls.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}