import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // import context

export default function AlumniRegistrationForm() {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // get logged-in user from context

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    batch: "",
    registrationNo: "",
    course: "",
    department: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!currentUser) navigate("/signup");
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "course" && value === "mca" ? { department: "" } : {}),
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.age) newErrors.age = "Age is required";
    else if (formData.age < 18 || formData.age > 100)
      newErrors.age = "Age must be between 18-100";
    if (!formData.batch.trim()) newErrors.batch = "Batch is required";
    if (!formData.registrationNo.trim())
      newErrors.registrationNo = "Registration number is required";
    if (!formData.course) newErrors.course = "Course is required";
    if (formData.course === "btech" && !formData.department)
      newErrors.department = "Department is required for B.Tech";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !currentUser) return;

    setLoading(true);
    try {
      // Save alumni data using currentUser UID
      await setDoc(doc(db, "alumni", currentUser.uid), {
        uid: currentUser.uid,
        name: formData.name,
        age: parseInt(formData.age),
        batch: formData.batch,
        registrationNo: formData.registrationNo,
        course: formData.course,
        department: formData.department || null,
        role: "alumni",
        createdAt: new Date(),
        isApproved: false,
      });

      alert("Registration successful! Your account is pending approval.");
      navigate("/userhome");
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ submit: err.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const heroSectionStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)",
    padding: "2rem",
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
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(20px)",
    borderRadius: "2rem",
    padding: "4rem",
    width: "100%",
    maxWidth: "900px",
    zIndex: 2,
    color: "white",
    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.2)",
  };

  const inputClass =
    "w-full p-5 text-lg rounded-xl border-2 border-white/30 bg-white/10 placeholder-white/60 text-white focus:outline-none focus:ring-4 focus:ring-blue-400 transition";

  const labelClass = "block text-lg font-semibold mb-2";

  return (
    <div style={heroSectionStyle}>
      <div style={backgroundDecoStyle}></div>
      <div style={cardStyle}>
        <h1 className="text-6xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent mb-6">
          Alumni Registration
        </h1>
        <p className="text-center text-white/80 text-xl mb-8">Join our alumni community</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="col-span-1 md:col-span-2">
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={inputClass}
            />
            {errors.name && <p className="text-red-400 text-base mt-1">{errors.name}</p>}
          </div>

          {/* Age */}
          <div>
            <label className={labelClass}>Age *</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="18"
              max="100"
              placeholder="Enter your age"
              className={inputClass}
            />
            {errors.age && <p className="text-red-400 text-base mt-1">{errors.age}</p>}
          </div>

          {/* Batch */}
          <div>
            <label className={labelClass}>Batch *</label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              placeholder="e.g., 2022-2026"
              className={inputClass}
            />
            {errors.batch && <p className="text-red-400 text-base mt-1">{errors.batch}</p>}
          </div>

          {/* Registration No */}
          <div>
            <label className={labelClass}>Registration Number *</label>
            <input
              type="text"
              name="registrationNo"
              value={formData.registrationNo}
              onChange={handleInputChange}
              placeholder="Enter registration number"
              className={inputClass}
            />
            {errors.registrationNo && <p className="text-red-400 text-base mt-1">{errors.registrationNo}</p>}
          </div>

          {/* Course */}
          <div>
            <label className={labelClass}>Course *</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className={inputClass}
            >
              <option value="" className="text-black">Select Course</option>
              <option value="btech" className="text-black">B.Tech</option>
              <option value="mca" className="text-black">MCA</option>
            </select>
            {errors.course && <p className="text-red-400 text-base mt-1">{errors.course}</p>}
          </div>

          {/* Department */}
          <div>
            <label className={labelClass}>
              Department {formData.course === "btech" && "*"}
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              disabled={formData.course === "mca"}
              className={inputClass}
            >
              <option value="">
                {formData.course === "mca" ? "Not applicable for MCA" : "Select Department"}
              </option>
              {formData.course === "btech" && (
                <>
                  <option value="cse" className="text-black">Computer Science & Engineering</option>
                  <option value="ece" className="text-black">Electronics & Communication</option>
                  <option value="eee" className="text-black">Electrical & Electronics</option>
                  <option value="ad" className="text-black">Artificial Intelligence & Data Science</option>
                </>
              )}
            </select>
            {errors.department && <p className="text-red-400 text-base mt-1">{errors.department}</p>}
          </div>

          {/* Submit */}
          <div className="col-span-1 md:col-span-2 mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 text-2xl rounded-2xl font-bold uppercase tracking-wider transition ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-300 hover:scale-105 shadow-2xl"
              }`}
            >
              {loading ? "Registering..." : "Register Now"}
            </button>
            {errors.submit && (
              <p className="text-red-400 text-center mt-3 text-lg">{errors.submit}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

