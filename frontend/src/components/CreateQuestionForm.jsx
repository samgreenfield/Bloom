import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

{/* 
  CREATEQUESTIONFORM.JSX:
  The form for creating or editing a question within a lesson displays:
    - A field for the question title
    - A field for the correct answer
    - Three fields for incorrect answers
    - Buttons for add/edit question, cancel 
*/}

// GraphQL mutation for adding a question to a lesson
const ADD_QUESTION_TO_LESSON = gql`
  mutation AddQuestionToLesson(
    $lessonId: String!
    $title: String!
    $correctAnswer: String!
    $wrongAnswers: [String!]!
  ) {
    addQuestionToLesson(
      lessonId: $lessonId
      title: $title
      correctAnswer: $correctAnswer
      wrongAnswers: $wrongAnswers
    ) {
      id
      title
    }
  }
`;

// GraphQL query for editing a question
const UPDATE_QUESTION = gql`
  mutation UpdateQuestion(
    $questionId: Int!
    $title: String!
    $correctAnswer: String!
    $wrongAnswers: [String!]!
  ) {
    updateQuestion(
      questionId: $questionId
      title: $title
      correctAnswer: $correctAnswer
      wrongAnswers: $wrongAnswers
    ) {
      id
      title
      correctAnswer
      wrongAnswers
    }
  }
`;

export default function CreateQuestionForm({
  lessonId,
  onClose,
  onCreated,
  onUpdated,
  initialData = null,
  isEditing = false,
}) {
  // Default states for form fields
  const [title, setTitle] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [wrongAnswers, setWrongAnswers] = useState(["", "", ""]);

  const [addQuestion] = useMutation(ADD_QUESTION_TO_LESSON);
  const [updateQuestion] = useMutation(UPDATE_QUESTION);

  // If editing, set the fields with the question's current information
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCorrectAnswer(initialData.correctAnswer);
      setWrongAnswers(initialData.wrongAnswers || ["", "", ""]);
    }
  }, [initialData]);

  // Function to add or edit a question based on the fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If editing, update question in db
      if (isEditing) {
        const { data } = await updateQuestion({
          variables: {
            questionId: initialData.id,
            title,
            correctAnswer,
            wrongAnswers,
          },
        });
        onUpdated && onUpdated(data.updateQuestion);
      } 
      // If adding, add question to db
      else {
        const { data } = await addQuestion({
          variables: { lessonId, title, correctAnswer, wrongAnswers },
        });
        onCreated && onCreated(data.addQuestionToLesson);
      }
      onClose();
    } catch (err) {
      console.error("Error saving question:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-2xl font-serif text-forest mb-4">
          {isEditing ? "Edit Question" : "Create Question"}
        </h2>

        {/* Form with fields for question, answers */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Question Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          />

          <input
            type="text"
            placeholder="Correct Answer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          />

          {/* Wrong answer fields */}
          {wrongAnswers.map((a, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Wrong Answer ${i + 1}`}
              value={a}
              onChange={(e) => {
                const newAnswers = [...wrongAnswers];
                newAnswers[i] = e.target.value;
                setWrongAnswers(newAnswers);
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            />
          ))}

          {/* Submit and cancel buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-forest text-beige rounded-lg hover:bg-green-900 transition"
            >
              {isEditing ? "Update Question" : "Add Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}