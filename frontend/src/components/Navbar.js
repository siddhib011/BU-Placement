import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; // Ensure this file exists for styling

const Navbar = () => {
  const { user, logout } = useAuth(); // Get user object and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user state from React Context
    logout();
    // Clear user info from local storage
    localStorage.removeItem('userInfo');
    // Redirect the user to the login page
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Link for the brand/logo area */}
         <Link to="/">
         <img src="/image.png" alt="" />
        </Link>
      </div>
      <div className="navbar-links">
        {user ? (
          // --- LINKS FOR LOGGED-IN USERS ---
          <>
            {/* 1. ROLE-BASED DASHBOARD LINK */}
            {user.role === 'student' && <Link to="/dashboard">Dashboard</Link>}
            {user.role === 'admin' && <Link to="/admin-dashboard">Admin Dashboard</Link>}
            {user.role === 'placementcell' && <Link to="/tpo-dashboard">TPO Dashboard</Link>}

            {/* 2. PROFILE LINK (Mostly for students/recruiters to manage their info) */}
            {user.role === 'student' && <Link to="/profile">My Profile</Link>}
            {/* Recruiters/Admins could also have a profile management link if needed */}

            {/* 3. LOGOUT BUTTON */}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          // --- LINKS FOR GUESTS (NOT LOGGED IN) ---
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;