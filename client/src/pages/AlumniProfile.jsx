import React, { useState, useEffect } from 'react';
import { User, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const AlumniProfile = () => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileId, setProfileId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    profilePicture: null,
    workPosition: 'none',
    workingDomain: '',
    experience: '0',
    location: 'none',
    hostingInterest: 'no'
  });

  const [originalFormData, setOriginalFormData] = useState({});

  const engineeringDomains = [
    'Artificial Intelligence & Machine Learning', 'Cybersecurity', 'Data Science & Analytics', 'Software Development',
    'Web Development', 'Mobile App Development', 'Cloud Computing', 'DevOps', 'Blockchain Technology', 'IoT',
    'Robotics & Automation', 'Computer Networks', 'Database Management', 'Game Development', 'UI/UX Design',
    'Digital Marketing', 'Product Management', 'Quality Assurance', 'System Architecture', 'Research & Development',
    'Academia & Teaching', 'Consulting', 'Entrepreneurship', 'Other'
  ];

  useEffect(() => {
    if (currentUser) fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'alumniProfiles', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({ ...formData, ...data });
        setOriginalFormData({ ...data });
        setProfileId(docSnap.id);
      } else {
        // set name from Firebase Auth or empty
        setFormData(prev => ({ ...prev, name: currentUser.displayName || '' }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      null, 
      (error) => console.error(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(prev => ({ ...prev, profilePicture: downloadURL }));
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.workPosition.trim() || !formData.workingDomain || !formData.location.trim()) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'alumniProfiles', currentUser.uid);
      const dataToSave = { ...formData, uid: currentUser.uid, email: currentUser.email };
      if (profileId) {
        await updateDoc(docRef, dataToSave);
        alert('Profile updated successfully!');
      } else {
        await setDoc(docRef, dataToSave);
        setProfileId(currentUser.uid);
        alert('Profile created successfully!');
      }
      setOriginalFormData({ ...formData });
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    }
    setIsSubmitting(false);
  };

  // ===== Styles =====
  const heroSectionStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)",
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
      radial-gradient(circle at 20% 80%, rgba(0,0,0,0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0,0,0,0.03) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(0,0,0,0.02) 0%, transparent 50%)
    `,
    zIndex: 1,
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
    border: "1px solid rgba(0,0,0,0.1)",
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
    cursor: "pointer",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "0.75rem",
    border: "1px solid rgba(0,0,0,0.2)",
    background: "rgba(0,0,0,0.05)",
    color: "black",
    marginBottom: "1rem",
  };

  return (
    <div style={heroSectionStyle}>
      <div style={backgroundDecoStyle}></div>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{ position: "relative", marginRight: "1.5rem" }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", border: "2px solid black" }}>
              {formData.profilePicture ? (
                <img src={formData.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", backgroundColor: "#00000011", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <User size={40} color="black" />
                </div>
              )}
              <label style={{
                position: "absolute",
                bottom: "-10px",
                right: "-10px",
                background: "#3b82f6",
                borderRadius: "50%",
                padding: "0.5rem",
                cursor: "pointer",
              }}>
                <Upload size={16} color="white" />
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </label>
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: profileId ? "black" : "#3b82f6" }}>
              {profileId ? "Alumni Profile" : "Create Alumni Profile"}
            </h1>
            <p style={{ color: "black", marginTop: "0.5rem" }}>Your profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            name="workPosition"
            placeholder="Work Position (default: none)"
            value={formData.workPosition}
            onChange={(e) => handleInputChange("workPosition", e.target.value)}
            style={inputStyle}
          />
          <select
            name="workingDomain"
            value={formData.workingDomain}
            onChange={e => handleInputChange("workingDomain", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select Domain</option>
            {engineeringDomains.map(domain => <option key={domain} value={domain}>{domain}</option>)}
          </select>
          <input
            type="text"
            name="location"
            placeholder="Location (default: none)"
            value={formData.location}
            onChange={e => handleInputChange("location", e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            name="hostingInterest"
            placeholder="Hosting Interest (yes/no, default: no)"
            value={formData.hostingInterest}
            onChange={e => handleInputChange("hostingInterest", e.target.value)}
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            {isSubmitting ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlumniProfile;
