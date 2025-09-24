import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase.js";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // import context

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { currentUser } = useAuth(); // get currentUser from context

  const heroSectionStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)",
    padding: "0 2.5rem",
    position: "relative",
    overflow: "hidden",
  };

  const backgroundDecoStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
    `,
    zIndex: 1,
  };

  const cardStyle = {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(15px)",
    borderRadius: "1.5rem",
    padding: "3rem",
    width: "100%",
    maxWidth: "450px",
    zIndex: 2,
    color: "white",
  };

  const buttonStyle = {
    padding: "0.75rem 2rem",
    cursor: "pointer",
  };

  // Function to redirect based on role
  const redirectBasedOnRole = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const role = userSnap.data().role;
        navigate(role === "institution" ? "/clghome" : "/userhome");
      } else {
        navigate("/userhome"); // fallback
      }
    } catch (err) {
      console.error(err);
      navigate("/userhome");
    }
  };

  // Email/Password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      await redirectBasedOnRole(userCred.user.uid);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await redirectBasedOnRole(result.user.uid);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={heroSectionStyle}>
      <div style={backgroundDecoStyle}></div>
      <div style={cardStyle}>
        <h2 className="text-center text-3xl font-bold mb-6">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-white text-black text-base"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-white text-black text-base"
            required
          />
          <button
            type="submit"
            style={buttonStyle}
            className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold text-lg"
          >
            LOGIN
          </button>
        </form>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleGoogleLogin}
            style={buttonStyle}
            className="bg-red-500 hover:bg-red-400 text-white py-3 px-6 rounded-lg font-semibold text-lg"
          >
            Login with Google
          </button>
        </div>

        {error && <p className="text-red-300 mt-4 text-center">{error}</p>}
        {currentUser && (
          <p className="mt-2 text-green-300 text-center">
            Logged in as: {currentUser.email}
          </p>
        )}
      </div>
    </div>
  );
}
