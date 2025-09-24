import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { auth } from '../firebase.js';
import { signOut } from 'firebase/auth';

export default function WorkingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser } = useAuth(); // get logged-in user
  const navigate = useNavigate();

  const navStyle = {
    background: 'linear-gradient(to right, #1e40af, #1e3a8a)',
    color: 'white',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: 50
  };

  const containerStyle = { maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' };
  const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' };
  const logoSectionStyle = { display: 'flex', alignItems: 'center', gap: '1rem' };
  const logoStyle = { width: '3rem', height: '3rem', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  const buttonStyle = { backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer', fontSize: '0.875rem' };
  const menuButtonStyle = { backgroundColor: 'transparent', color: 'white', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '2rem' };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div>
      <nav style={navStyle} className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg fixed w-full top-0 z-50">
        <div style={containerStyle} className="max-w-7xl mx-auto px-4">
          <div style={headerStyle} className="flex justify-between items-center h-16">
            {/* Left Section - Logo */}
            <div style={logoSectionStyle} className="flex items-center space-x-4">
              <div style={logoStyle} className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <img 
                  src="/ceclogo.png" 
                  alt="College Logo" 
                  style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold leading-tight" style={{fontSize: '1.125rem', fontWeight: 'bold', lineHeight: '0.2'}}>
                  College of Engineering Cherthala
                  <p className="text-sm text-blue-200 leading-tight">Alumni Association</p>
                </h1>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4 gap-3">
              {!currentUser ? (
                <>
                  <a href="/signup" style={buttonStyle} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium text-sm">REGISTER</a>
                  <a href="/signin" style={buttonStyle} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium text-sm">LOGIN</a>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/profile')} style={{...buttonStyle, borderRadius: '50%', padding: '0.5rem 0.6rem', fontSize: '1.25rem'}}>👤</button>
                  <button onClick={handleLogout} style={buttonStyle}>LOGOUT</button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={menuButtonStyle}
                className="lg:hidden text-white hover:text-blue-200 focus:outline-none mr-8"
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
            <div className="lg:hidden border-t border-blue-700 py-4">
              <div className="flex flex-col space-y-3">
                <a href="#about" style={{color: 'white', padding: '0.5rem 0', display: 'block'}} className="text-white hover:text-blue-200 py-2" onClick={() => setIsMenuOpen(false)}>About Us</a>
                <a href="#membership" style={{color: 'white', padding: '0.5rem 0', display: 'block'}} className="text-white hover:text-blue-200 py-2" onClick={() => setIsMenuOpen(false)}>Get Membership & Involve</a>
                <a href="#achievers" style={{color: 'white', padding: '0.5rem 0', display: 'block'}} className="text-white hover:text-blue-200 py-2" onClick={() => setIsMenuOpen(false)}>Alumni Achievers</a>
                <a href="#services" style={{color: 'white', padding: '0.5rem 0', display: 'block'}} className="text-white hover:text-blue-200 py-2" onClick={() => setIsMenuOpen(false)}>Student Services</a>
                <a href="#newsroom" style={{color: 'white', padding: '0.5rem 0', display: 'block'}} className="text-white hover:text-blue-200 py-2" onClick={() => setIsMenuOpen(false)}>Newsroom</a>
                <a href="/" style={{color: 'white', padding: '0.5rem 0', display: 'block'}} className="text-white hover:text-blue-200 py-2" onClick={() => setIsMenuOpen(false)}>Home</a>
                {currentUser && (
                  <div className="border-t border-blue-700 pt-3 mt-3">
                    <button onClick={handleLogout} className="text-white hover:text-blue-200 py-2 w-full text-left">LOGOUT</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
