import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const SUBMIT_SCORE = gql`
  mutation SubmitLessonScore($lessonId: String!, $userId: Int!, $score: Float!) {
    submitLessonScore(lessonId: $lessonId, userId: $userId, score: $score) {
      score
    }
  }
`;

export default function TakeQuizView({ questions, user, lessonId, onExit }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitScore] = useMutation(SUBMIT_SCORE);

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <p>No questions yet!</p>
  }

  // Shuffle answers once per question
  useEffect(() => {
    if (!currentQuestion) return;
    const allAnswers = [...currentQuestion.wrongAnswers, currentQuestion.correctAnswer];
    setShuffledAnswers(allAnswers.sort(() => Math.random() - 0.5));
    setSelectedAnswer("");
  }, [currentQuestionIndex, currentQuestion]);

  const handleNext = () => {
    // Update score if student selected the correct answer
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Quiz finished
      setFinished(true);
      if (user.role === "student") {
        const percentScore = ((score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0)) / questions.length) * 100;
        submitScore({
          variables: { lessonId, userId: user.id, score: percentScore },
        }).catch((err) => console.error("Failed to submit score:", err));
      }
    }
  };

  if (finished && score) {
    const percentScore = (score / questions.length) * 100;
    return (
      <div className="p-6 max-w-md w-full bg-white rounded-xl shadow flex flex-col items-center">
        <h2 className="text-2xl font-serif mb-4">Quiz Complete!</h2>
        <p className="text-lg mb-4">Your score: {score} / {questions.length}</p>
        <div className="w-full bg-gray-200 h-6 rounded-full overflow-hidden mb-4">
            <div
                className="h-full bg-green-800 transition-all duration-500"
                style={{ width: `${percentScore}%` }}
            />
        </div>
        <button
          onClick={onExit}
          className="bg-forest text-beige px-6 py-2 rounded-xl hover:bg-green-900 transition"
        >
          Exit Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md w-full bg-white rounded-xl shadow flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">{currentQuestion.title}</h2>
      <div className="flex flex-col gap-2 w-full">
        {shuffledAnswers.map((answer, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedAnswer(answer)}
            className={`border px-4 py-2 rounded transition text-left w-full
              ${selectedAnswer === answer ? "border-green-700" : "border-gray-300 bg-white hover:bg-gray-100"}`}
          >
            {answer}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedAnswer}
        className={`mt-4 px-6 py-2 rounded-xl font-semibold transition
          ${selectedAnswer ? "bg-forest text-beige hover:bg-green-900" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
      >
        {currentQuestionIndex + 1 === questions.length ? "Finish Quiz" : "Next Question"}
      </button>
    </div>
  );
}