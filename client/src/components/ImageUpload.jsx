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

      // Update local state
      setFormData((prev) => ({ ...prev, profilePicture: imageUrl }));

      // Save to Firestore
      const docRef = doc(db, "alumniProfiles", currentUser.uid);
      const dataToSave = { ...formData, profilePicture: imageUrl, uid: currentUser.uid, email: currentUser.email };

      if (profileId) {
        await updateDoc(docRef, dataToSave);
      } else {
        await setDoc(docRef, dataToSave);
        setProfileId(currentUser.uid);
      }

      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image. Try again.");
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
      const dataToSave = { ...formData, uid: currentUser.uid, email: currentUser.email };
      if (profileId) {
        await updateDoc(docRef, dataToSave);
        alert("Profile updated successfully!");
      } else {
        await setDoc(docRef, dataToSave);
        setProfileId(currentUser.uid);
        alert("Profile created successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    }
    setIsSubmitting(false);
  };

  const heroSectionStyle = { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", width: "100%", background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)", padding: "2rem", position: "relative", overflow: "hidden" };
  const backgroundDecoStyle = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 20% 80%, rgba(0,0,0,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,0,0,0.03) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(0,0,0,0.02) 0%, transparent 50%)`, zIndex: 1 };
  const cardStyle = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(10px)", borderRadius: "2rem", padding: "4rem", width: "100%", maxWidth: "900px", zIndex: 2, color: "black", boxShadow: "0 15px 40px rgba(0,0,0,0.2)", border: "1px solid rgba(0,0,0,0.1)" };
  const buttonStyle = { background: "linear-gradient(90deg, #3b82f6 0%, #1e3a8a 100%)", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", border: "none", cursor: "pointer" };
  const inputStyle = { width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(0,0,0,0.2)", background: "rgba(0,0,0,0.05)", color: "black", marginBottom: "1rem" };
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
            <label style={{ position: "absolute", bottom: "-10px", right: "-10px", background: "#3b82f6", borderRadius: "50%", padding: "0.5rem", cursor: "pointer" }}>
              <Upload size={16} color="white" />
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
            </label>
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
            <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>Work Position</label>
            <input type="text" placeholder="Work Position" value={formData.workPosition} onChange={(e) => handleInputChange("workPosition", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>Working Domain</label>
            <select value={formData.workingDomain} onChange={(e) => handleInputChange("workingDomain", e.target.value)} style={inputStyle}>
              <option value="">Select Domain</option>
              {engineeringDomains.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" placeholder="Location" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass}>Interested in Hosting Events in College</label>
            <input type="text" placeholder="Hosting Interest (yes/no)" value={formData.hostingInterest} onChange={(e) => handleInputChange("hostingInterest", e.target.value)} style={inputStyle} />
          </div>
          <button type="submit" style={buttonStyle}>{isSubmitting ? "Updating..." : "Update Profile"}</button>
        </form>
      </div>
    </div>
  );
};

export default AlumniProfile;
