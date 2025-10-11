import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';

const GET_TOPICS = gql`
  query GetTopics {
    topics {
      id
      name
      description
    }
  }
`;

export default function TopicList() {
  const { data, loading, error } = useQuery(GET_TOPICS);

  if (loading) return <p>Loading topics…</p>;
  if (error) return <p>Error loading topics: {error.message}</p>;

  return (
    <ul>
      {data.topics.map(t => (
        <li key={t.id} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            <Link to={`/practice/${t.id}`}>{t.name}</Link>
          </div>
          <div style={{ color: '#555' }}>{t.description}</div>
        </li>
      ))}
    </ul>
  );
}