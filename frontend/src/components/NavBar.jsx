import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Logomark from './Logomark.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand"><Logomark className="brand-mark" />ClimaCheck</Link>
      {user ? (
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/favorites">Favorites</Link>
          <Link to="/alerts">Alert Settings</Link>
          {user.role === 'content_manager' && <Link to="/admin">Admin</Link>}
          <span className="nav-user">Hi, {user.name}</span>
          <button onClick={handleLogout} className="btn-link">Log out</button>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}
