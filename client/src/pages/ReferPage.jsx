import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function ReferPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("post");
  
  // Form state
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Job listings state
  const [myJobOpenings, setMyJobOpenings] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Fetch user's job openings - simplified approach
  useEffect(() => {
    if (currentUser && activeTab === "manage") {
      fetchMyJobOpenings();
    }
  }, [currentUser, activeTab]);

  const fetchMyJobOpenings = async () => {
    if (!currentUser?.email) {
      console.log("No current user email available");
      setMyJobOpenings([]);
      return;
    }

    setLoadingJobs(true);
    
    try {
      // Get ALL job openings first (no where clause)
      const allJobsQuery = query(
        collection(db, "jobOpenings"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(allJobsQuery);
      const allJobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Debug logging
      console.log("=== DEBUG INFO ===");
      console.log("Current user email:", currentUser.email);
      console.log("Total jobs in database:", allJobs.length);
      console.log("All jobs:", allJobs.map(job => ({ 
        title: job.title, 
        postedBy: job.postedBy,
        id: job.id 
      })));

      // Filter client-side with exact match
      const userJobs = allJobs.filter(job => {
        const match = job.postedBy === currentUser.email;
        console.log(`Job "${job.title}" posted by "${job.postedBy}" - Match: ${match}`);
        return match;
      });

      console.log("User's jobs found:", userJobs.length);
      console.log("User's jobs:", userJobs);

      setMyJobOpenings(userJobs);
      
    } catch (error) {
      console.error("Error fetching job openings:", error);
      alert("Error loading your jobs. Please refresh the page.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.email) {
      alert("You must be logged in to post a job.");
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        description: description.trim(),
        experience: experience.trim(),
        postedBy: currentUser.email, // Use exact email
        postedByName: currentUser.displayName || currentUser.email || "Anonymous User",
        createdAt: serverTimestamp(),
        isActive: true,
      };

      console.log("Posting job with data:", jobData);

      await addDoc(collection(db, "jobOpenings"), jobData);

      alert("Job Opening Posted Successfully!");
      
      // Clear form
      setTitle("");
      setCompany("");
      setLocation("");
      setDescription("");
      setExperience("");
      
      // If we're on manage tab, refresh the list
      if (activeTab === "manage") {
        // Small delay to ensure Firestore has updated
        setTimeout(() => {
          fetchMyJobOpenings();
        }, 1000);
      }
    } catch (error) {
      console.error("Error posting job opening:", error);
      alert("Error posting job. Please try again.");
    }

    setLoading(false);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job opening?")) {
      try {
        await deleteDoc(doc(db, "jobOpenings", jobId));
        alert("Job opening deleted successfully!");
        fetchMyJobOpenings(); // Refresh the list
      } catch (error) {
        console.error("Error deleting job opening:", error);
        alert("Error deleting job. Please try again.");
      }
    }
  };

  // Add a manual refresh button for debugging
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchMyJobOpenings();
  };

  // Styles
  const containerStyle = {
    padding: "3rem",
    maxWidth: "900px",
    margin: "auto",
    minHeight: "100vh",
    backgroundColor: "#f8fafc"
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "3rem"
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
    transition: "all 0.3s ease"
  });

  const formStyle = {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  };

  const inputStyle = {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "2px solid #e5e7eb",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s ease"
  };

  const buttonStyle = {
    background: "linear-gradient(45deg, #3b82f6, #2563eb)",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease"
  };

  const jobCardStyle = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    margin: "1rem 0",
    border: "1px solid #e5e7eb"
  };

  const deleteButtonStyle = {
    backgroundColor: "#ef4444",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "1rem"
  };

  const refreshButtonStyle = {
    backgroundColor: "#10b981",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    marginLeft: "1rem"
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem", color: "#1f2937" }}>
          Job Referrals
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>
          Help fellow alumni by posting job opportunities or manage your existing listings
        </p>
        
        {/* Debug info */}
        <div style={{ 
          marginTop: "1rem", 
          padding: "0.5rem", 
          backgroundColor: "#f0f0f0", 
          borderRadius: "0.5rem",
          fontSize: "0.9rem",
          color: "#666"
        }}>
          Current User: {currentUser?.email || "Not logged in"} 
          
        </div>
      </div>

      {/* Tabs */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <button 
          style={tabButtonStyle(activeTab === "post")} 
          onClick={() => setActiveTab("post")}
        >
          Post Job Opening
        </button>
        <button 
          style={tabButtonStyle(activeTab === "manage")} 
          onClick={() => setActiveTab("manage")}
        >
          Manage My Jobs ({myJobOpenings.length})
        </button>
      </div>

      {/* Post Job Tab */}
      {activeTab === "post" && (
        <div style={formStyle}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", color: "#1f2937" }}>
            Post a New Job Opening
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Job Title (e.g., Senior Software Engineer)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
            
            <input
              type="text"
              placeholder="Company Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              style={inputStyle}
            />
            
            <input
              type="text"
              placeholder="Location (e.g., Bangalore, Remote, Hybrid)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              style={inputStyle}
            />
            
            <input
              type="text"
              placeholder="Experience Required (e.g., 2-4 years, Fresher)"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              style={inputStyle}
            />
            
            <textarea
              placeholder="Job Description - Include key responsibilities, required skills, qualifications, and any other relevant details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              required
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => !loading && (e.target.style.transform = "translateY(0)")}
            >
              {loading ? "Posting..." : "Post Job Opening"}
            </button>
          </form>
        </div>
      )}

      {/* Manage Jobs Tab */}
      {activeTab === "manage" && (
        <div>
          <div style={{ ...formStyle, padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1f2937", margin: 0 }}>
                My Job Openings
              </h2>
              <button
                onClick={handleRefresh}
                style={refreshButtonStyle}
                title="Refresh job listings"
              >
                Refresh
              </button>
            </div>
            <p style={{ color: "#6b7280", margin: 0 }}>
              Manage the job openings you've posted. You can view details and delete listings as needed.
            </p>
          </div>

          {loadingJobs ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
              <p>Loading your job openings...</p>
            </div>
          ) : myJobOpenings.length === 0 ? (
            <div style={{ ...jobCardStyle, textAlign: "center", color: "#6b7280" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>No job openings found</h3>
              <p>Click "Post Job Opening" tab to create your first job listing.</p>
              <p style={{ fontSize: "0.9rem", marginTop: "1rem", fontStyle: "italic" }}>
                If you recently posted a job and it's not showing up, click the "Refresh" button above or check the browser console for debug information.
              </p>
            </div>
          ) : (
            myJobOpenings.map((job) => (
              <div key={job.id} style={jobCardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.5rem" }}>
                      {job.title}
                    </h3>
                    <p style={{ fontSize: "1.1rem", color: "#3b82f6", fontWeight: "600", marginBottom: "0.25rem" }}>
                      {job.company}
                    </p>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                        📍 {job.location || "Location not specified"}
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                        💼 {job.experience}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af", textAlign: "right" }}>
                    Posted: {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : "Recently"}
                  </div>
                </div>
                
                <div style={{ marginBottom: "1rem" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem", color: "#374151" }}>
                    Description:
                  </h4>
                  <p style={{ 
                    color: "#6b7280", 
                    lineHeight: "1.5",
                    backgroundColor: "#f9fafb",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #e5e7eb"
                  }}>
                    {job.description || "No description provided"}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                    Posted by: {job.postedByName || job.postedBy}
                  </div>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                  >
                    Delete Job
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}