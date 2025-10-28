import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

{/* 
  FILENAME.JSX:
  Text about what the following categories are:
    - Category 1
    - Category 2
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
  
  const { data, loading, error } = useQuery(GET_CLASSES_FOR_USER, {
    variables: { userId },
    fetchPolicy: "network-only",
  });

  if (loading) return <p>Loading classes...</p>;
  if (error) return <p>Error loading classes.</p>;

  const classes = data?.classesForUser || [];

  if (!classes.length) return <p></p>;

  return (
    <div className="w-full flex justify-center px-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
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