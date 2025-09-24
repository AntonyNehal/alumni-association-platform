import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Clock, Code, X, Upload } from 'lucide-react';
import axios from 'axios';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';

const JobPortal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [applications, setApplications] = useState({});
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [alumniName, setAlumniName] = useState('');
  const [alumniEmail, setAlumniEmail] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const jobsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setJobListings(jobsData);

        const apps = {};
        for (let job of jobsData) {
          const qApps = query(collection(db, "jobApplications"), where("jobId", "==", job.id));
          const snapApps = await getDocs(qApps);
          apps[job.id] = snapApps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        setApplications(apps);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch job listings.");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);

    // Prefill name and email if user is logged in
    if (currentUser) {
      setAlumniName(currentUser.displayName || '');
      setAlumniEmail(currentUser.email || '');
    } else {
      setAlumniName('');
      setAlumniEmail('');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    setResumeFile(null);
    setAlumniName('');
    setAlumniEmail('');
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmitApplication = async () => {
    if (!resumeFile) {
      alert('Please upload a file');
      return;
    }
    if (!alumniName || !alumniEmail) {
      alert('Please enter your name and email');
      return;
    }

    try {
      setUploading(true);

      // Upload resume to Cloudinary
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("upload_preset", "alumni-association");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dikfkmd10/image/upload",
        formData
      );
      const fileUrl = res.data.secure_url;

      // Add application with user info
      const applicationData = {
        userId: currentUser?.uid || null,
        alumniName,
        alumniEmail,
        jobId: selectedJob.id,
        jobName: selectedJob.jobName,
        fileUrl,
        appliedAt: serverTimestamp()
      };

      await addDoc(collection(db, "jobApplications"), applicationData);

      alert('Application submitted successfully!');
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Failed to submit application');
    } finally {
      setUploading(false);
    }
  };

  const styles = {
    container: { padding: "2rem", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" },
    header: { textAlign: "center", marginBottom: "2rem" },
    portalTitle: { fontSize: "2rem", fontWeight: "bold" },
    main: { maxWidth: "1000px", margin: "0 auto" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.5rem" },
    card: { backgroundColor: "white", borderRadius: "1rem", padding: "1.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", transition: "all 0.2s" },
    jobTitle: { fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" },
    jobDetails: { marginBottom: "1rem" },
    jobDetail: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" },
    icon: { minWidth: "20px" },
    skillsContainer: { display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" },
    skills: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
    skill: { backgroundColor: "#e0e7ff", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.85rem" },
    applyButton: { backgroundColor: "#3b82f6", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" },
    modal: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modalContent: { backgroundColor: "white", borderRadius: "1rem", width: "90%", maxWidth: "400px", padding: "1.5rem", position: "relative" },
    modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
    modalTitle: { fontSize: "1.25rem", fontWeight: "bold" },
    closeButton: { background: "none", border: "none", cursor: "pointer" },
    formGroup: { marginBottom: "1rem" },
    input: { width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #d1d5db", marginBottom: "0.5rem" },
    fileInput: { width: "100%", marginBottom: "0.5rem" },
    fileHelp: { fontSize: "0.75rem", color: "#6b7280" },
    modalFooter: { display: "flex", justifyContent: "flex-end", gap: "0.5rem" },
    cancelButton: { padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #d1d5db", cursor: "pointer" },
    submitButton: { padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", backgroundColor: "#3b82f6", color: "white", cursor: "pointer" }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.portalTitle}>Alumni Job Portal</h1>
      </header>

      <main style={styles.main}>
        {loadingJobs ? (
          <p>Loading jobs...</p>
        ) : (
          <div style={styles.grid}>
            {jobListings.map(job => (
              <div key={job.id} style={styles.card}>
                <h4 style={styles.jobTitle}>{job.jobName}</h4>
                <div style={styles.jobDetails}>
                  <div style={styles.jobDetail}>
                    <DollarSign size={20} color="#16a34a" style={styles.icon} /> <span>{job.salary || "N/A"}</span>
                  </div>
                  <div style={styles.jobDetail}>
                    <Clock size={20} color="#2563eb" style={styles.icon} /> <span>{job.experience}</span>
                  </div>
                  <div style={styles.jobDetail}>
                    <MapPin size={20} color="#dc2626" style={styles.icon} /> <span>{job.location}</span>
                  </div>
                  <div style={styles.skillsContainer}>
                    <Code size={20} color="#7c3aed" style={styles.icon} />
                    <div style={styles.skills}>
                      {job.skills?.map((skill, idx) => <span key={idx} style={styles.skill}>{skill}</span>)}
                    </div>
                  </div>
                </div>
                <button style={styles.applyButton} onClick={() => handleApplyClick(job)}>Apply</button>
                {applications[job.id]?.length > 0 && <p>{applications[job.id].length} application(s) received</p>}
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && selectedJob && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Apply for {selectedJob.jobName}</h3>
              <button style={styles.closeButton} onClick={handleCloseModal}><X size={24} /></button>
            </div>

            <div style={styles.formGroup}>
              <input
                type="text"
                placeholder="Full Name"
                style={styles.input}
                value={alumniName}
                onChange={(e) => setAlumniName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email Address"
                style={styles.input}
                value={alumniEmail}
                onChange={(e) => setAlumniEmail(e.target.value)}
              />
              <label style={styles.label}><Upload size={16} style={{ marginRight: 8 }} /> Upload Resume</label>
              <input type="file" onChange={handleFileChange} accept=".jpeg,.jpg,.png,.pdf" style={styles.fileInput} />
              <p style={styles.fileHelp}>Accepted formats: JPEG, PNG, PDF</p>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={handleCloseModal}>Close</button>
              <button style={styles.submitButton} onClick={handleSubmitApplication} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPortal;
