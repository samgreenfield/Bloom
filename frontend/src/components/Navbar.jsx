import { useState, useEffect } from 'react';
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

{/* 
  NAVBAR.JSX:
  The navigation bar component displays:
    - Bloom with Logo (navigates to landing page)
    - User info:
      - User image (NOTE: NOT FUNCTIONAL- NEED TO DEBUG)
      - Name
    - Sign out button
*/}

export default function Navbar() {
  const [user, setUser] = useState(null);

  // Get the User type if signed in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Function to log out on button press
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-300">
      {/* Logo press navigates to landing page (which navigates to dashboard if signed in) */}
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
        <img src={logo} className="h-10 w-10 object-contain" alt="Bloom Logo" />
        <span className="text-2xl font-serif text-forest">Bloom</span>
      </Link>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3">
          <img
            src={user.picture}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-sans text-forest">{user.name}</span>
          {/* Sign out button */}
          <button
            onClick={handleLogout}
            className="bg-forest text-beige px-4 py-2 rounded-xl hover:bg-green-900 transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}