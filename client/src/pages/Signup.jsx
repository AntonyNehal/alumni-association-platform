import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase.js";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  // Email/Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const role = email.endsWith("@cectl.ac.in") ? "institution" : "student";

      // Save to Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          role: role,
          createdAt: new Date(),
        },
        { merge: true }
      );

      // Redirect based on role
      navigate(role === "institution" ? "/cechome" : "/alumniform");

      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const role = user.email.endsWith("@cectl.ac.in") ? "institution" : "student";

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          role: role,
          createdAt: new Date(),
        },
        { merge: true }
      );

      navigate(role === "institution" ? "/cechome" : "/alumniform");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="bubble bubble-1"></div>
        <div className="bubble bubble-2"></div>
        <div className="bubble bubble-3"></div>
        <div className="bubble bubble-4"></div>
        <div className="bubble bubble-5"></div>
        <div className="bubble bubble-6"></div>
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      {/* Main Content */}
      <div className="signup-card">
        <div className="card-header">
          <h1 className="signup-title">
            <span className="title-gradient">Create Account</span>
          </h1>
          <p className="signup-subtitle">Join our alumni community today</p>
        </div>

        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
                disabled={isLoading || isGoogleLoading}
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                disabled={isLoading || isGoogleLoading}
              />
              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <circle cx="12" cy="16" r="1"></circle>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">or continue with</span>
        </div>

        <button
          onClick={handleGoogleSignup}
          className={`google-button ${isGoogleLoading ? 'loading' : ''}`}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <div className="spinner"></div>
              Signing up...
            </>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {currentUser && (
          <div className="logged-in-status">
            <div className="status-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            Logged in as: {currentUser.email}
          </div>
        )}

        <div className="signup-footer">
          <p>Already have an account? <a href="/login" className="login-link">Sign In</a></p>
        </div>
      </div>

      <style jsx>{`
        .signup-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .background-animation {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .bubble-1 {
          width: 80px;
          height: 80px;
          left: 10%;
          animation-delay: 0s;
        }

        .bubble-2 {
          width: 120px;
          height: 120px;
          right: 10%;
          top: 20%;
          animation-delay: 2s;
        }

        .bubble-3 {
          width: 60px;
          height: 60px;
          left: 20%;
          bottom: 20%;
          animation-delay: 4s;
        }

        .bubble-4 {
          width: 100px;
          height: 100px;
          right: 20%;
          bottom: 10%;
          animation-delay: 1s;
        }

        .bubble-5 {
          width: 40px;
          height: 40px;
          left: 50%;
          top: 10%;
          animation-delay: 3s;
        }

        .bubble-6 {
          width: 90px;
          height: 90px;
          right: 40%;
          top: 60%;
          animation-delay: 5s;
        }

        .floating-shape {
          position: absolute;
          background: rgba(255, 255, 255, 0.05);
          animation: rotate 20s linear infinite;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          left: -100px;
          top: -100px;
          border-radius: 30%;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          right: -75px;
          bottom: -75px;
          border-radius: 40%;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          left: 30%;
          top: 70%;
          border-radius: 20%;
          animation-delay: 10s;
        }

        .signup-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 10;
          animation: slideUp 0.8s ease-out;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .signup-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .title-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s ease-in-out infinite;
        }

        .signup-subtitle {
          color: #6b7280;
          font-size: 1rem;
          margin: 0;
        }

        .signup-form {
          margin-bottom: 1.5rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #ffffff;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          transition: color 0.3s ease;
        }

        .form-input:focus + .input-icon {
          color: #3b82f6;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          animation: shake 0.5s ease-in-out;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
        }

        .submit-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .submit-button.loading {
          cursor: wait;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .divider-text {
          margin: 0 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .google-button {
          width: 100%;
          padding: 1rem;
          background: white;
          color: #374151;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .google-button:hover:not(:disabled) {
          border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .google-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .google-icon {
          flex-shrink: 0;
        }

        .logged-in-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-icon {
          display: flex;
          align-items: center;
        }

        .signup-footer {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .login-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .login-link:hover {
          color: #1e40af;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .signup-container {
            padding: 1rem;
          }
          
          .signup-card {
            padding: 2rem;
            margin: 1rem 0;
          }
          
          .signup-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}