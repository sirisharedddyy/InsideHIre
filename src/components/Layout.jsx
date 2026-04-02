import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();

  // Initialize theme from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('insideHireTheme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to body when state changes
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('insideHireTheme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('insideHireTheme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Helper for active navigation link styling
  const navClass = ({ isActive }) => isActive ? "nav-item active" : "nav-item";

  // Determine display name and avatar
  const displayName = userProfile?.name || currentUser?.displayName || 'User';
  const avatarUrl = userProfile?.photoURL || currentUser?.photoURL || null;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <i className="fa-solid fa-chart-line logo-icon"></i>
              <span className="logo-text">InsideHire</span>
          </div>
          <nav className="nav-menu">
              <NavLink to="/" className={navClass}>
                  <i className="fa-solid fa-house"></i>
                  <span>Home</span>
              </NavLink>
              <NavLink to="/library" className={navClass}>
                  <i className="fa-solid fa-book-open"></i>
                  <span>Library</span>
              </NavLink>
              <NavLink to="/profile" className={navClass}>
                  <i className="fa-regular fa-user"></i>
                  <span>Profile</span>
              </NavLink>
              <NavLink to="/stories" className={navClass}>
                  <i className="fa-solid fa-layer-group"></i>
                  <span>Stories</span>
              </NavLink>
              <NavLink to="/messages" className={navClass}>
                  <i className="fa-solid fa-message"></i>
                  <span>Messages</span>
              </NavLink>
              <NavLink to="/following" className={navClass}>
                  <i className="fa-solid fa-users"></i>
                  <span>Following</span>
              </NavLink>
          </nav>
          <div className="sidebar-footer">
              <NavLink to="/settings" className={navClass}>
                  <i className="fa-solid fa-gear"></i>
                  <span>Settings</span>
              </NavLink>
              <button
                className="nav-item"
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: 'var(--text-secondary)' }}
                title="Sign out"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>Sign Out</span>
              </button>
          </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
          {/* Top Navigation Bar */}
          <header className="top-bar">
              <div className="search-container">
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input type="text" className="search-input" placeholder="Search posts, companies, roles..." />
              </div>
              <div className="top-actions">
                  <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Dark Mode">
                      <i className={isDark ? "fa-regular fa-sun" : "fa-regular fa-moon"}></i>
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate('/write')}>
                      <i className="fa-solid fa-plus"></i> Write
                  </button>
                  <div
                    className="user-avatar"
                    onClick={() => navigate('/profile')}
                    style={{ cursor: 'pointer' }}
                    title={displayName}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        background: 'var(--primary-color)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '1rem',
                      }}>
                        {initials}
                      </div>
                    )}
                  </div>
              </div>
          </header>

          {/* Child pages will be rendered right here */}
          <Outlet />
      </main>
    </div>
  );
};

export default Layout;

