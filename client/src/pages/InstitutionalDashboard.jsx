import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore";
import axios from "axios";

export default function InstitutionalDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("announcements");

  const [announcements, setAnnouncements] = useState([]);
  const [donations, setDonations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({}); // jobId -> array of applications

  const [newAnnouncement, setNewAnnouncement] = useState({
    eventName: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    guests: "",
    image: null,
  });

  const [newDonation, setNewDonation] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: "",
  });

  const [newJob, setNewJob] = useState({
    jobName: "",
    salary: "",
    experience: "",
    location: "",
    skills: [""],
  });

  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- Fetch all data ---
  useEffect(() => {
    fetchAnnouncements();
    fetchDonations();
    fetchJobs();
  }, []);

  // --- Fetch Announcements ---
  async function fetchAnnouncements() {
    setLoadingAnnouncements(true);
    try {
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoadingAnnouncements(false);
    }
  }

  // --- Fetch Donations ---
  async function fetchDonations() {
    setLoadingDonations(true);
    try {
      const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setDonations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoadingDonations(false);
    }
  }

  // --- Fetch Jobs and Applications ---
  async function fetchJobs() {
    setLoadingJobs(true);
    try {
      const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const jobsData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setJobs(jobsData);

      // Fetch applications for each job
      const apps = {};
      for (let job of jobsData) {
        const qApps = query(collection(db, "jobApplications"), where("jobId", "==", job.id));
        const snapApps = await getDocs(qApps);
        apps[job.id] = snapApps.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
      setApplications(apps);
    } finally {
      setLoadingJobs(false);
    }
  }

  // --- Add Announcement ---
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.eventName || !newAnnouncement.date || !newAnnouncement.time || !newAnnouncement.venue) {
      alert("Fill required fields");
      return;
    }

    let imageUrl = "";
    if (newAnnouncement.image) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("file", newAnnouncement.image);
        formData.append("upload_preset", "alumni-association");

        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/dikfkmd10/image/upload",
          formData
        );
        imageUrl = res.data.secure_url;
      } catch (err) {
        console.error(err);
        alert("Image upload failed!");
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    await addDoc(collection(db, "announcements"), {
      ...newAnnouncement,
      image: imageUrl,
      createdAt: serverTimestamp(),
    });

    setNewAnnouncement({
      eventName: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      guests: "",
      image: null,
    });
    fetchAnnouncements();
  };

  // --- Add Donation ---
  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    if (!newDonation.title || !newDonation.description || !newDonation.targetAmount || !newDonation.deadline) {
      alert("Fill all donation fields");
      return;
    }
    await addDoc(collection(db, "donations"), {
      ...newDonation,
      targetAmount: parseFloat(newDonation.targetAmount),
      currentAmount: 0,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    setNewDonation({ title: "", description: "", targetAmount: "", deadline: "" });
    fetchDonations();
  };

  // --- Add Job ---
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!newJob.jobName || !newJob.experience || !newJob.location) {
      alert("Fill required fields");
      return;
    }
    const filteredSkills = newJob.skills.filter((s) => s.trim() !== "");
    await addDoc(collection(db, "jobs"), {
      ...newJob,
      skills: filteredSkills,
      createdAt: serverTimestamp(),
    });
    setNewJob({
      jobName: "",
      salary: "",
      experience: "",
      location: "",
      skills: [""],
    });
    fetchJobs();
  };

  // --- Delete functions ---
  const deleteAnnouncement = async (id) => {
    await deleteDoc(doc(db, "announcements", id));
    fetchAnnouncements();
  };
  const deleteDonation = async (id) => {
    await deleteDoc(doc(db, "donations", id));
    fetchDonations();
  };
  const toggleDonationStatus = async (id, current) => {
    await updateDoc(doc(db, "donations", id), { isActive: !current });
    fetchDonations();
  };
  const deleteJob = async (id) => {
    await deleteDoc(doc(db, "jobs", id));
    fetchJobs();
  };

  // --- Handle Job Application ---
  const handleJobApply = async (job) => {
    if (!currentUser) return alert("Please login to apply.");
    const fileInput = document.getElementById(`resume-${job.id}`);
    if (!fileInput?.files[0]) return alert("Upload your resume first.");
    const resumeFile = fileInput.files[0];

    let resumeUrl = "";
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("upload_preset", "alumni-association");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dikfkmd10/image/upload",
        formData
      );
      resumeUrl = res.data.secure_url;
    } catch (err) {
      console.error(err);
      return alert("Resume upload failed!");
    }

    await addDoc(collection(db, "jobApplications"), {
      jobId: job.id,
      jobName: job.jobName,
      alumniName: currentUser.displayName || "Anonymous",
      alumniEmail: currentUser.email,
      resumeUrl,
      appliedAt: serverTimestamp(),
    });

    fetchJobs();
    alert("Application submitted!");
  };

  // --- Styles ---
  const containerStyle = { minHeight: "100vh", backgroundColor: "#f8fafc", paddingTop: "5rem" };
  const headerStyle = {
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    color: "white",
    padding: "2rem",
    borderRadius: "1rem",
    margin: "2rem",
    textAlign: "center",
  };
  const tabButtonStyle = (isActive) => ({
    padding: "1rem 2rem",
    backgroundColor: isActive ? "#3b82f6" : "#e5e7eb",
    color: isActive ? "white" : "#374151",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    margin: "0 0.5rem",
  });
  const cardStyle = { backgroundColor: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", margin: "1rem", border: "1px solid #e5e7eb" };
  const inputStyle = { width: "100%", padding: "0.75rem", border: "2px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "1rem", marginBottom: "1rem" };
  const textareaStyle = { width: "100%", padding: "0.75rem", border: "2px solid #e5e7eb", borderRadius: "0.5rem", fontSize: "1rem", marginBottom: "1rem", resize: "vertical" };
  const buttonStyle = { backgroundColor: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600", marginTop: "0.5rem" };
  const deleteButtonStyle = { backgroundColor: "#ef4444", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "0.375rem", cursor: "pointer", marginLeft: "1rem" };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Institutional Dashboard</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>Manage Events, Donations & Jobs</p>
      </div>

      {/* Tabs */}
      <div style={{ textAlign: "center", margin: "2rem" }}>
        <button style={tabButtonStyle(activeTab === "announcements")} onClick={() => setActiveTab("announcements")}>Event Announcements</button>
        <button style={tabButtonStyle(activeTab === "donations")} onClick={() => setActiveTab("donations")}>Donation Campaigns</button>
        <button style={tabButtonStyle(activeTab === "jobs")} onClick={() => setActiveTab("jobs")}>Job Opportunities</button>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div>
            <div style={cardStyle}>
              <h2>Create New Event Announcement</h2>
              <form onSubmit={handleAnnouncementSubmit}>
                <input type="text" placeholder="Event Name" style={inputStyle} value={newAnnouncement.eventName} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, eventName: e.target.value })} />
                <input type="date" style={inputStyle} value={newAnnouncement.date} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, date: e.target.value })} />
                <input type="time" style={inputStyle} value={newAnnouncement.time} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, time: e.target.value })} />
                <input type="text" placeholder="Venue" style={inputStyle} value={newAnnouncement.venue} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, venue: e.target.value })} />
                <textarea placeholder="Description" style={textareaStyle} value={newAnnouncement.description} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })} />
                <input type="text" placeholder="Guests" style={inputStyle} value={newAnnouncement.guests} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, guests: e.target.value })} />
                <input type="file" accept="image/*" onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image: e.target.files[0] })} />
                <button type="submit" style={buttonStyle} disabled={uploadingImage}>{uploadingImage ? "Uploading..." : "Create Announcement"}</button>
              </form>
            </div>

            <h2>Current Announcements ({announcements.length})</h2>
            {loadingAnnouncements && <p>Loading...</p>}
            {announcements.map((a) => (
              <div key={a.id} style={cardStyle}>
                <h3>{a.eventName}</h3>
                <p>{a.description}</p>
                <p>{a.date} {a.time} @ {a.venue}</p>
                {a.image && <img src={a.image} alt={a.eventName} style={{ width: "200px" }} />}
                <button style={deleteButtonStyle} onClick={() => deleteAnnouncement(a.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <div>
            <div style={cardStyle}>
              <h2>Create Donation Campaign</h2>
              <form onSubmit={handleDonationSubmit}>
                <input type="text" placeholder="Title" style={inputStyle} value={newDonation.title} onChange={(e) => setNewDonation({ ...newDonation, title: e.target.value })} />
                <textarea placeholder="Description" style={textareaStyle} value={newDonation.description} onChange={(e) => setNewDonation({ ...newDonation, description: e.target.value })} />
                <input type="number" placeholder="Target Amount" style={inputStyle} value={newDonation.targetAmount} onChange={(e) => setNewDonation({ ...newDonation, targetAmount: e.target.value })} />
                <input type="date" style={inputStyle} value={newDonation.deadline} onChange={(e) => setNewDonation({ ...newDonation, deadline: e.target.value })} />
                <button type="submit" style={buttonStyle}>{loadingDonations ? "Creating..." : "Create Campaign"}</button>
              </form>
            </div>

            <h2>Current Campaigns ({donations.length})</h2>
            {donations.map((d) => (
              <div key={d.id} style={cardStyle}>
                <h3>{d.title}</h3>
                <p>{d.description}</p>
                <p>Target: {d.targetAmount} | Current: {d.currentAmount}</p>
                <p>Deadline: {d.deadline}</p>
                <p>Status: {d.isActive ? "Active" : "Inactive"}</p>
                <button style={deleteButtonStyle} onClick={() => deleteDonation(d.id)}>Delete</button>
                <button style={{ ...deleteButtonStyle, backgroundColor: "#2563eb", marginLeft: "1rem" }} onClick={() => toggleDonationStatus(d.id, d.isActive)}>Toggle Status</button>
              </div>
            ))}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div>
            <div style={cardStyle}>
              <h2>Post a New Job</h2>
              <form onSubmit={handleJobSubmit}>
                <input type="text" placeholder="Job Name" style={inputStyle} value={newJob.jobName} onChange={(e) => setNewJob({ ...newJob, jobName: e.target.value })} />
                <input type="text" placeholder="Salary Range" style={inputStyle} value={newJob.salary} onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })} />
                <input type="text" placeholder="Experience Required" style={inputStyle} value={newJob.experience} onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })} />
                <input type="text" placeholder="Location" style={inputStyle} value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} />

                {/* Dynamic Skills */}
                <div style={{ marginBottom: "1rem" }}>
                  <label><b>Skills Required:</b></label>
                  {newJob.skills.map((skill, index) => (
                    <div key={index} style={{ display: "flex", marginBottom: "0.5rem" }}>
                      <input
                        type="text"
                        placeholder={`Skill ${index + 1}`}
                        value={skill}
                        onChange={(e) => {
                          const updatedSkills = [...newJob.skills];
                          updatedSkills[index] = e.target.value;
                          setNewJob({ ...newJob, skills: updatedSkills });
                        }}
                        style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}
                      />
                      {newJob.skills.length > 1 && (
                        <button type="button" onClick={() => {
                          const updatedSkills = newJob.skills.filter((_, i) => i !== index);
                          setNewJob({ ...newJob, skills: updatedSkills });
                        }} style={{ marginLeft: "0.5rem" }}>Remove</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewJob({ ...newJob, skills: [...newJob.skills, ""] })}>Add Skill</button>
                </div>

                <button type="submit" style={buttonStyle}>{loadingJobs ? "Posting..." : "Post Job"}</button>
              </form>
            </div>

            <h2>Current Jobs ({jobs.length})</h2>
            {jobs.map((j) => (
              <div key={j.id} style={cardStyle}>
                <h3>{j.jobName}</h3>
                <p><b>Location:</b> {j.location}</p>
                <p><b>Salary:</b> {j.salary}</p>
                <p><b>Experience:</b> {j.experience}</p>
                <p><b>Skills:</b> {j.skills && j.skills.length > 0 ? j.skills.join(", ") : "N/A"}</p>
                <button style={deleteButtonStyle} onClick={() => deleteJob(j.id)}>Delete Job</button>

                <h4>Applications ({applications[j.id]?.length || 0})</h4>
                {applications[j.id]?.map((app) => (
                  <div key={app.id} style={{ marginBottom: "0.5rem", padding: "0.5rem", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }}>
  <p><b>Name:</b> {app.alumniName}</p>
  <p><b>Email:</b> {app.alumniEmail}</p>
  <a href={app.fileUrl} target="_blank" rel="noreferrer">View Resume</a>
</div>

                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
