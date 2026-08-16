import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const avatar =
  localStorage.getItem('profile_picture');
  console.log(avatar);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
  localStorage.getItem('theme') === 'dark'
);

const toggleTheme = () => {
  const nextTheme = !darkMode;

  setDarkMode(nextTheme);

  if (nextTheme) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
};

  const handleLogout = () => {
    logout();
    navigate('/');
  };
   if (darkMode) {
  document.body.classList.add('dark-mode');
}
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand navbar-brand-text fs-4" to="/">LearnTrack</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item"><NavLink className="nav-link glow" to="/">Home</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link glow" to="/courses">Courses</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link glow" to="/about">About Us</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link glow" to="/contact">Contact</NavLink></li>

            {!user && (
              <>
                <li className="nav-item"><NavLink className="nav-link glow" to="/login">Login</NavLink></li>
                <li className="nav-item">
                  <NavLink className="btn btn-primary glow-btn ms-lg-2 px-3" to="/register">Register</NavLink>
                </li>
              </>
            )}

            {user && user.role === 'user' && (
              <>
                <li className="nav-item"><NavLink className="nav-link glow" to="/dashboard">Dashboard</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link glow" to="/profile">Profile</NavLink></li>
              </>
            )}

            {user && user.role === 'admin' && (
              <li className="nav-item"><NavLink className="nav-link glow" to="/admin">Admin Panel</NavLink></li>
            )}

          {user && (
  <>
    <li className="nav-item ms-lg-2">
      <img
        src={avatar || "/default-avatar.png"}
        alt="Profile"
        width="40"
        height="40"
        style={{
          borderRadius: "50%",
          objectFit: "cover"
        }}
        onError={(e) => {
          e.target.src = "https://placehold.co/40x40";
        }}
      />
    </li>

    <li className="nav-item d-flex align-items-center">
      <button
        className="btn btn-sm btn-outline-secondary me-2"
        onClick={toggleTheme}
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <button
        className="btn btn-outline-secondary"
        onClick={handleLogout}
      >
        Logout
      </button>
    </li>
  </>
)}
          </ul>
        </div>
      </div>
    </nav>
  );
}
