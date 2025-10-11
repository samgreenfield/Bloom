import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_QUESTIONS = gql`
  query GetQuestions($topicId: Int!) {
    questions(topicId: $topicId) {
      id
      prompt
      choiceA
      choiceB
      choiceC
      choiceD
      answer
      difficulty
    }
  }
`;

export default function Practice() {
  const { topicId } = useParams();
  const { data, loading, error } = useQuery(GET_QUESTIONS, {
    variables: { topicId: parseInt(topicId, 10) },
  });

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  if (loading) return <p>Loading questions…</p>;
  if (error) return <p>Error: {error.message}</p>;

  const questions = data.questions || [];
  if (questions.length === 0) return <p>No questions for this topic yet.</p>;

  const q = questions[index];
  const choices = [
    { key: 'A', text: q.choiceA },
    { key: 'B', text: q.choiceB },
    { key: 'C', text: q.choiceC },
    { key: 'D', text: q.choiceD },
  ];

  function submit() {
    if (!selected) return;
    const correct = (selected == q.answer);
    setFeedback(correct ? 'Correct ✅' : `Incorrect — correct answer: ${q.answer}`);
    // Optional: call submitResponse mutation here to persist
  }

  function next() {
    setSelected(null);
    setFeedback(null);
    setIndex(i => (i + 1 < questions.length ? i + 1 : 0));
  }

  return (
    <div>
      <h2>Practice</h2>
      <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 6 }}>
        <p><strong>Q{index + 1}:</strong> {q.prompt}</p>
        <div>
          {choices.map(c => (
            <label key={c.key} style={{ display: 'block', margin: '8px 0' }}>
              <input
                type="radio"
                name="choice"
                value={c.key}
                checked={selected === c.key}
                onChange={() => setSelected(c.text)}
              />{' '}
              <strong>{c.key}.</strong> {c.text}
            </label>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={submit} disabled={!selected}>Submit</button>
          <button onClick={next} style={{ marginLeft: 8 }}>Next</button>
        </div>

        {feedback && <div style={{ marginTop: 12 }}>{feedback}</div>}
      </div>
    </div>
  );
}