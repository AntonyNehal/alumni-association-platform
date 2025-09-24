import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase.js";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // import the context

export default function Signup() {
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
    backdropFilter: "blur(10px)",
    borderRadius: "1rem",
    padding: "2rem",
    width: "100%",
    maxWidth: "400px",
    zIndex: 2,
    color: "white",
  };

  // Email/Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
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
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
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
    }
  };

  return (
    <div style={heroSectionStyle}>
      <div style={backgroundDecoStyle}></div>
      <div style={cardStyle}>
        <h2 className="text-center text-2xl font-bold mb-4">Sign Up</h2>
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded bg-white text-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-white text-black"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleSignup}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold"
          >
            Sign Up with Google
          </button>
        </div>
        {error && <p className="text-red-300 mt-3">{error}</p>}
        {currentUser && (
          <p className="mt-2 text-green-300 text-center">
            Logged in as: {currentUser.email}
          </p>
        )}
      </div>
    </div>
  );
}
