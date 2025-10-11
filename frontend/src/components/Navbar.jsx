import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';


export default function Navbar() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded);
  };

  const handleLogout = () => setUser(null);

  return (
    <nav style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
      <div><strong>Bloom</strong></div>
      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={user.picture} alt="profile" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            <span>{user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log('Login Failed')}
          />
        )}
      </div>
    </nav>
  );
}