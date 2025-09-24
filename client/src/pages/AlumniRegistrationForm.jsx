import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { doc, setDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AlumniRegistrationForm() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

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

  const createGroupsIfNotExist = async (user) => {
    if (!user?.department || !user?.batch) return;

    // 1️⃣ Department group
    const deptQ = query(
      collection(db, "communityGroups"),
      where("type", "==", "department"),
      where("department", "==", user.department)
    );
    const deptSnap = await getDocs(deptQ);
    if (deptSnap.empty) {
      await addDoc(collection(db, "communityGroups"), {
        name: `${user.department} Department`,
        type: "department",
        department: user.department,
        memberCount: 1,
        createdAt: new Date(),
      });
    }

    // 2️⃣ Year/Batch group
    const batchQ = query(
      collection(db, "communityGroups"),
      where("type", "==", "batch"),
      where("department", "==", user.department),
      where("batch", "==", user.batch)
    );
    const batchSnap = await getDocs(batchQ);
    if (batchSnap.empty) {
      await addDoc(collection(db, "communityGroups"), {
        name: `${user.department} - ${user.batch}`,
        type: "batch",
        department: user.department,
        batch: user.batch,
        memberCount: 1,
        createdAt: new Date(),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !currentUser) return;

    setLoading(true);
    try {
      // Save alumni data
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

      // ✅ Auto-create groups if not exist
      await createGroupsIfNotExist({
        department: formData.department,
        batch: formData.batch,
      });

      alert("Registration successful!");
      navigate("/userhome");
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ submit: err.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-form-wrapper">
        <div className="form-header">
          <div className="header-content">
            <h1 className="form-title">Alumni Registration</h1>
            <p className="form-subtitle">
              Complete your registration to join the alumni community
            </p>
          </div>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit} className="registration-form">
            {/* Full Name */}
            <div className="form-group full-width">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="form-input"
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Age and Batch */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Age <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="18"
                  max="100"
                  placeholder="Enter your age"
                  className="form-input"
                  disabled={loading}
                />
                {errors.age && <span className="error-message">{errors.age}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Batch <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  placeholder="e.g., 2022-2026"
                  className="form-input"
                  disabled={loading}
                />
                {errors.batch && <span className="error-message">{errors.batch}</span>}
              </div>
            </div>

            {/* Registration Number */}
            <div className="form-group full-width">
              <label className="form-label">
                Registration Number <span className="required">*</span>
              </label>
              <input
                type="text"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleInputChange}
                placeholder="Enter your registration number"
                className="form-input"
                disabled={loading}
              />
              {errors.registrationNo && <span className="error-message">{errors.registrationNo}</span>}
            </div>

            {/* Course and Department */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Course <span className="required">*</span>
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="">Select Course</option>
                  <option value="btech">B.Tech</option>
                  <option value="mca">MCA</option>
                </select>
                {errors.course && <span className="error-message">{errors.course}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Department {formData.course === "btech" && <span className="required">*</span>}
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={formData.course === "mca" || loading}
                  className="form-select"
                >
                  <option value="">
                    {formData.course === "mca" ? "Not applicable for MCA" : "Select Department"}
                  </option>
                  {formData.course === "btech" && (
                    <>
                      <option value="cse">Computer Science & Engineering</option>
                      <option value="ece">Electronics & Communication</option>
                      <option value="eee">Electrical & Electronics</option>
                      <option value="ad">Artificial Intelligence & Data Science</option>
                    </>
                  )}
                </select>
                {errors.department && <span className="error-message">{errors.department}</span>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-group full-width">
              <button
                type="submit"
                disabled={loading}
                className={`submit-button ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Processing Registration...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
              {errors.submit && (
                <div className="submit-error">{errors.submit}</div>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .registration-container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 2rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .registration-form-wrapper {
          width: 100%;
          max-width: 800px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header-content {
          background: white;
          padding: 2rem;
          border-radius: 16px 16px 0 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }

        .form-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0;
        }

        .form-card {
          background: white;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          border-top: none;
        }

        .registration-form {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-label {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .required {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .form-input,
        .form-select {
          padding: 0.875rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: white;
          color: #1f2937;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input:disabled,
        .form-select:disabled {
          background: #f9fafb;
          color: #6b7280;
          cursor: not-allowed;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
        }

        .submit-button {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .submit-button.loading {
          cursor: wait;
        }

        .submit-error {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.75rem;
          text-align: center;
          padding: 0.75rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .registration-container {
            padding: 1rem 0.5rem;
          }

          .form-title {
            font-size: 2rem;
          }

          .form-subtitle {
            font-size: 1rem;
          }

          .header-content {
            padding: 1.5rem;
          }

          .registration-form {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-group.full-width {
            grid-column: span 1;
          }
        }

        @media (max-width: 480px) {
          .form-title {
            font-size: 1.75rem;
          }

          .registration-form {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}