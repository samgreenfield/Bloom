import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Practice from './pages/Practice';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <div>
      <Navbar />
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
      </nav>

      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice/:topicId" element={<Practice />} />
        </Routes>
      </main>
    </div>
  );
}