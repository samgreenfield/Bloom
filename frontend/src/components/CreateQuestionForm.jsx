import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

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
  const [title, setTitle] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [wrongAnswers, setWrongAnswers] = useState(["", "", ""]);

  const [addQuestion] = useMutation(ADD_QUESTION_TO_LESSON);
  const [updateQuestion] = useMutation(UPDATE_QUESTION);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCorrectAnswer(initialData.correctAnswer);
      setWrongAnswers(initialData.wrongAnswers || ["", "", ""]);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
      } else {
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


// export default function CreateQuestionForm({ lessonId, onClose, onCreated }) {
//   const [title, setTitle] = useState("");
//   const [correctAnswer, setCorrectAnswer] = useState("");
//   const [wrongAnswers, setWrongAnswers] = useState(["", "", ""]);

//   const [addQuestion, { loading }] = useMutation(ADD_QUESTION_TO_LESSON);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await addQuestion({
//         variables: {
//           lessonId,
//           title,
//           correctAnswer,
//           wrongAnswers,
//         },
//       });
//       onCreated(); // refresh lesson data
//       onClose();
//     } catch (err) {
//       console.error("Failed to create question:", err);
//     }
//   };

//   const handleWrongAnswerChange = (index, value) => {
//     const updated = [...wrongAnswers];
//     updated[index] = value;
//     setWrongAnswers(updated);
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
//       >
//         <h2 className="text-xl font-semibold text-forest">New Question</h2>

//         <input
//           type="text"
//           placeholder="Question title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="border border-gray-300 rounded-xl px-3 py-2"
//           required
//         />

//         <input
//           type="text"
//           placeholder="Correct answer"
//           value={correctAnswer}
//           onChange={(e) => setCorrectAnswer(e.target.value)}
//           className="border border-gray-300 rounded-xl px-3 py-2"
//           required
//         />

//         {wrongAnswers.map((wa, i) => (
//           <input
//             key={i}
//             type="text"
//             placeholder={`Wrong answer ${i + 1}`}
//             value={wa}
//             onChange={(e) => handleWrongAnswerChange(i, e.target.value)}
//             className="border border-gray-300 rounded-xl px-3 py-2"
//             required
//           />
//         ))}

//         <div className="flex justify-between mt-2">
//           <button
//             type="button"
//             onClick={onClose}
//             className="bg-gray-300 text-black px-4 py-2 rounded-xl hover:bg-gray-400 transition"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-forest text-beige px-4 py-2 rounded-xl hover:bg-green-900 transition"
//           >
//             {loading ? "Saving..." : "Create"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }