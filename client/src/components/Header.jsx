import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { auth, db } from '../firebase.js';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function WorkingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch user role when component mounts or currentUser changes
  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [currentUser]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomeNavigation = () => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Navigate based on user role
    if (userRole === 'institution') {
      navigate('/clghome');
    } else {
      navigate('/userhome');
    }
  };

  const handleProfileNavigation = () => {
    if (currentUser) {
      navigate('/alumniprofile');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-header">
          {/* Logo Section */}
          <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-wrapper">
              <img 
                src="/ceclogo.png" 
                alt="College Logo" 
                className="logo-image"
              />
            </div>
            <div className="logo-text">
              <h1 className="college-name">College of Engineering Cherthala</h1>
              <p className="association-name">Alumni Association</p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="nav-actions">
            {!currentUser ? (
              <div className="auth-buttons">
                <button 
                  onClick={() => navigate('/signin')} 
                  className="nav-button login-button"
                >
                  <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10,17 15,12 10,7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  Login
                </button>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="nav-button register-button"
                >
                  <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  Register
                </button>
              </div>
            ) : (
              <div className="user-actions">
                <button 
                  onClick={handleHomeNavigation}
                  className="nav-button home-button"
                  title="Home"
                >
                  <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9,22 9,12 15,12 15,22"></polyline>
                  </svg>
                  Home
                </button>
                {userRole !== "institution" && (
    <button 
      onClick={handleProfileNavigation}
      className="nav-button profile-button"
      title="Profile"
    >
      <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      Profile
    </button>
  )}
                <button 
                  onClick={handleLogout}
                  className={`nav-button logout-button ${loading ? 'loading' : ''}`}
                  disabled={loading}
                  title="Logout"
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16,17 21,12 16,7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  )}
                  {loading ? 'Signing out...' : 'Logout'}
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-button"
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {currentUser && (
                <>
                  <button 
                    onClick={() => {
                      handleHomeNavigation();
                      setIsMenuOpen(false);
                    }}
                    className="mobile-menu-item"
                  >
                    <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9,22 9,12 15,12 15,22"></polyline>
                    </svg>
                    Home
                  </button>
                  <button 
                    onClick={() => {
                      handleProfileNavigation();
                      setIsMenuOpen(false);
                    }}
                    className="mobile-menu-item"
                  >
                    <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Profile
                  </button>
                </>
              )}
              <a href="#about" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>About Us</a>
              <a href="#membership" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>Get Membership</a>
              <a href="#achievers" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>Alumni Achievers</a>
              <a href="#services" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>Student Services</a>
              <a href="#newsroom" className="mobile-menu-item" onClick={() => setIsMenuOpen(false)}>Newsroom</a>
              
              {!currentUser ? (
                <div className="mobile-auth-section">
                  <button 
                    onClick={() => {
                      navigate('/signin');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-auth-button login"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                    className="mobile-auth-button register"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="mobile-logout-section">
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="mobile-logout-button"
                    disabled={loading}
                  >
                    {loading ? 'Signing out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .navbar {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(10px);
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 4.5rem;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s ease;
        }

        .logo-section:hover {
          transform: scale(1.02);
        }

        .logo-wrapper {
          width: 3.5rem;
          height: 3.5rem;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .logo-image {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          object-fit: cover;
        }

        .logo-text {
          color: white;
        }

        .college-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .association-name {
          font-size: 0.875rem;
          color: #bfdbfe;
          margin: 0;
          font-weight: 400;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auth-buttons,
        .user-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          background: transparent;
          color: white;
        }

        .button-icon {
          width: 16px;
          height: 16px;
          stroke-width: 2;
        }

        .login-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        .register-button {
          background: #2563eb;
          color: white;
        }

        .register-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .home-button {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }

        .home-button:hover {
          background: rgba(34, 197, 94, 0.2);
          transform: translateY(-1px);
        }

        .profile-button {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #c4b5fd;
        }

        .profile-button:hover {
          background: rgba(168, 85, 247, 0.2);
          transform: translateY(-1px);
        }

        .logout-button {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .logout-button:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        .logout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .logout-button.loading {
          cursor: wait;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .mobile-menu-button {
          display: none;
          background: transparent;
          color: white;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-menu {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(30, 58, 138, 0.95);
          backdrop-filter: blur(10px);
        }

        .mobile-menu-content {
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          color: white;
          text-decoration: none;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 1rem;
          transition: color 0.2s ease;
        }

        .mobile-menu-item:hover {
          color: #bfdbfe;
        }

        .menu-icon {
          width: 20px;
          height: 20px;
          stroke-width: 2;
        }

        .mobile-auth-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-auth-button {
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-auth-button.login {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .mobile-auth-button.register {
          background: #2563eb;
          color: white;
        }

        .mobile-logout-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-logout-button {
          width: 100%;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-logout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1024px) {
          .nav-actions > .auth-buttons,
          .nav-actions > .user-actions {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }
        }

        @media (max-width: 768px) {
          .nav-container {
            padding: 0 0.75rem;
          }

          .nav-header {
            height: 4rem;
          }

          .logo-wrapper {
            width: 3rem;
            height: 3rem;
          }

          .logo-image {
            width: 2.5rem;
            height: 2.5rem;
          }

          .college-name {
            font-size: 1.125rem;
          }

          .association-name {
            font-size: 0.8125rem;
          }
        }

        @media (max-width: 640px) {
          .college-name {
            font-size: 1rem;
          }

          .association-name {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </nav>
  );
}