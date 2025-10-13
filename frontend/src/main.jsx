import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import client from './api/client';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = "245589766619-2e9nus67ff28ggqbr02q6v9q8vbssm5p.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);