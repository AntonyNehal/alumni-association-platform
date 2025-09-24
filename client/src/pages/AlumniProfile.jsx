import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import axios from "axios";

const AlumniProfile = () => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    profilePicture: null,
    workPosition: "",
    workingDomain: "",
    experience: "0",
    location: "",
    hostingInterest: "no",
  });

  const defaultProfilePicture =
    "https://cdn-icons-png.flaticon.com/512/12225/12225935.png";

  const engineeringDomains = [
    "Artificial Intelligence & Machine Learning",
    "Cybersecurity",
    "Data Science & Analytics",
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "Cloud Computing",
    "DevOps",
    "Blockchain Technology",
    "IoT",
    "Robotics & Automation",
    "Computer Networks",
    "Database Management",
    "Game Development",
    "UI/UX Design",
    "Digital Marketing",
    "Product Management",
    "Quality Assurance",
    "System Architecture",
    "Research & Development",
    "Academia & Teaching",
    "Consulting",
    "Entrepreneurship",
    "Other",
  ];

  useEffect(() => {
    if (!currentUser) return;

    const fetchProfile = async () => {
      try {
        const alumniDocRef = doc(db, "alumni", currentUser.uid);
        const alumniDocSnap = await getDoc(alumniDocRef);

        if (alumniDocSnap.exists()) {
          const alumniData = alumniDocSnap.data();
          setFormData((prev) => ({
            ...prev,
            name: alumniData.name || currentUser.displayName || "",
          }));
        }

        const profileDocRef = doc(db, "alumniProfiles", currentUser.uid);
        const profileDocSnap = await getDoc(profileDocRef);

        if (profileDocSnap.exists()) {
          const profileData = profileDocSnap.data();
          setFormData((prev) => ({
            ...prev,
            profilePicture: profileData.profilePicture || null,
            workPosition: profileData.workPosition || "",
            workingDomain: profileData.workingDomain || "",
            experience: profileData.experience || "0",
            location: profileData.location || "",
            hostingInterest: profileData.hostingInterest || "no",
          }));
          setProfileId(currentUser.uid);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);

    const cloudName = "dikfkmd10"; // Your Cloudinary cloud name
    const unsignedPreset = "alumni-association"; // Your unsigned preset

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", unsignedPreset);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formDataUpload
      );

      const imageUrl = res.data.secure_url;

      // Update local state first
      const updatedFormData = { ...formData, profilePicture: imageUrl };
      setFormData(updatedFormData);
      
      // Save to Firestore with all current form data including the new image URL
      const docRef = doc(db, "alumniProfiles", currentUser.uid);
      const dataToSave = { 
        ...updatedFormData, 
        uid: currentUser.uid, 
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      };

      console.log("Saving image upload data:", dataToSave); // Debug log

      if (profileId) {
        await updateDoc(docRef, dataToSave);
      } else {
        await setDoc(docRef, dataToSave);
        setProfileId(currentUser.uid);
      }

      // Also update the alumni collection with the current name
      if (updatedFormData.name.trim()) {
        const alumniDocRef = doc(db, "alumni", currentUser.uid);
        await updateDoc(alumniDocRef, { 
          name: updatedFormData.name,
          updatedAt: new Date().toISOString()
        }).catch(() => {
          // If alumni document doesn't exist, create it
          setDoc(alumniDocRef, {
            name: updatedFormData.name,
            email: currentUser.email,
            uid: currentUser.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });
      }

      console.log("Profile picture uploaded and saved successfully:", imageUrl);
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.workPosition.trim() || !formData.workingDomain || !formData.location.trim()) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(db, "alumniProfiles", currentUser.uid);
      const dataToSave = { 
        ...formData, 
        uid: currentUser.uid, 
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      };

      console.log("Saving data:", dataToSave); // Debug log
      
      if (profileId) {
        await updateDoc(docRef, dataToSave);
        console.log("Profile updated successfully");
      } else {
        await setDoc(docRef, dataToSave);
        setProfileId(currentUser.uid);
        console.log("Profile created successfully");
      }

      // Also update the alumni collection with the new name
      const alumniDocRef = doc(db, "alumni", currentUser.uid);
      await updateDoc(alumniDocRef, { 
        name: formData.name,
        updatedAt: new Date().toISOString()
      }).catch(() => {
        // If alumni document doesn't exist, create it
        setDoc(alumniDocRef, {
          name: formData.name,
          email: currentUser.email,
          uid: currentUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile. Please try again.");
    }
    setIsSubmitting(false);
  };

  const heroSectionStyle = { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    minHeight: "100vh", 
    width: "100%", 
    background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)", 
    padding: "2rem", 
    position: "relative", 
    overflow: "hidden" 
  };
  
  const backgroundDecoStyle = { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: `radial-gradient(circle at 20% 80%, rgba(0,0,0,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,0,0,0.03) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(0,0,0,0.02) 0%, transparent 50%)`, 
    zIndex: 1 
  };
  
  const cardStyle = { 
    background: "rgba(255,255,255,0.8)", 
    backdropFilter: "blur(10px)", 
    borderRadius: "2rem", 
    padding: "4rem", 
    width: "100%", 
    maxWidth: "900px", 
    zIndex: 2, 
    color: "black", 
    boxShadow: "0 15px 40px rgba(0,0,0,0.2)", 
    border: "1px solid rgba(0,0,0,0.1)" 
  };
  
  const buttonStyle = { 
    background: "linear-gradient(90deg, #3b82f6 0%, #1e3a8a 100%)", 
    color: "white", 
    padding: "1rem 2rem", 
    borderRadius: "1rem", 
    fontWeight: "bold", 
    display: "flex", 
    alignItems: "center", 
    gap: "0.5rem", 
    border: "none", 
    cursor: "pointer" 
  };
  
  const inputStyle = { 
    width: "100%", 
    padding: "0.75rem", 
    borderRadius: "0.75rem", 
    border: "1px solid rgba(0,0,0,0.2)", 
    background: "rgba(0,0,0,0.05)", 
    color: "black", 
    marginBottom: "1rem" 
  };
  
  const labelClass = "block text-2xl font-semibold mb-2";

  return (
    <div style={heroSectionStyle}>
      <div style={backgroundDecoStyle}></div>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{ position: "relative", marginRight: "1.5rem" }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", border: "2px solid black" }}>
              <img
                src={formData.profilePicture || defaultProfilePicture}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.src = defaultProfilePicture; }}
              />
            </div>
            <label style={{ 
              position: "absolute", 
              bottom: "-10px", 
              right: "-10px", 
              background: isUploading ? "#6b7280" : "#3b82f6", 
              borderRadius: "50%", 
              padding: "0.5rem", 
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.7 : 1
            }}>
              <Upload size={16} color="white" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: "none" }} 
                disabled={isUploading}
              />
            </label>
            {isUploading && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.7)",
                borderRadius: "50%",
                padding: "0.5rem",
                color: "white",
                fontSize: "0.75rem"
              }}>
                Uploading...
              </div>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
              {formData.name ? `${formData.name}'s Profile` : "Alumni Profile"}
            </h1>
            <p style={{ color: "black", marginTop: "0.5rem" }}>Your profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label className={labelClass}>Full Name</label>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={formData.name} 
              onChange={(e) => handleInputChange("name", e.target.value)} 
              style={inputStyle} 
            />
          </div>
          <div>
            <label className={labelClass}>Work Position</label>
            <input 
              type="text" 
              placeholder="Work Position" 
              value={formData.workPosition} 
              onChange={(e) => handleInputChange("workPosition", e.target.value)} 
              style={inputStyle} 
            />
          </div>
          <div>
            <label className={labelClass}>Working Domain</label>
            <select 
              value={formData.workingDomain} 
              onChange={(e) => handleInputChange("workingDomain", e.target.value)} 
              style={inputStyle}
            >
              <option value="">Select Domain</option>
              {engineeringDomains.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input 
              type="text" 
              placeholder="Location" 
              value={formData.location} 
              onChange={(e) => handleInputChange("location", e.target.value)} 
              style={inputStyle} 
            />
          </div>
          <div>
            <label className={labelClass}>Years of Experience</label>
            <select
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
              style={inputStyle}
            >
              <option value="0">0 years</option>
              <option value="1">1 year</option>
              <option value="2">2 years</option>
              <option value="3">3 years</option>
              <option value="4">4 years</option>
              <option value="5">5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="11-15">11-15 years</option>
              <option value="16-20">16-20 years</option>
              <option value="20+">20+ years</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Interested in Hosting Events in College</label>
            <select
              value={formData.hostingInterest}
              onChange={(e) => handleInputChange("hostingInterest", e.target.value)}
              style={inputStyle}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <button 
            type="submit" 
            style={{
              ...buttonStyle,
              opacity: isSubmitting || isUploading ? 0.7 : 1,
              cursor: isSubmitting || isUploading ? "not-allowed" : "pointer"
            }}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlumniProfile;