// // src/pages/InstitutionalDashboard.jsx
// import React, { useState, useEffect } from "react";
// import { db, storage } from "../firebase.js";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   deleteDoc,
//   doc,
//   updateDoc,
//   query,
//   orderBy,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// export default function InstitutionalDashboard() {
//   const [activeTab, setActiveTab] = useState("announcements");

//   const [announcements, setAnnouncements] = useState([]);
//   const [donations, setDonations] = useState([]);

//   const [newAnnouncement, setNewAnnouncement] = useState({
//     eventName: "",
//     description: "",
//     date: "",
//     time: "",
//     venue: "",
//     guests: "",
//     image: null,
//   });

//   const [newDonation, setNewDonation] = useState({
//     title: "",
//     description: "",
//     targetAmount: "",
//     deadline: "",
//   });

//   const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
//   const [loadingDonations, setLoadingDonations] = useState(false);

//   // --- Styles ---
//   const containerStyle = {
//     minHeight: "100vh",
//     backgroundColor: "#f8fafc",
//     paddingTop: "5rem",
//   };
//   const headerStyle = {
//     background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
//     color: "white",
//     padding: "2rem",
//     borderRadius: "1rem",
//     margin: "2rem",
//     textAlign: "center",
//   };
//   const tabButtonStyle = (isActive) => ({
//     padding: "1rem 2rem",
//     backgroundColor: isActive ? "#3b82f6" : "#e5e7eb",
//     color: isActive ? "white" : "#374151",
//     border: "none",
//     borderRadius: "0.5rem",
//     cursor: "pointer",
//     fontWeight: "600",
//     margin: "0 0.5rem",
//   });
//   const cardStyle = {
//     backgroundColor: "white",
//     borderRadius: "1rem",
//     padding: "1.5rem",
//     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//     margin: "1rem",
//     border: "1px solid #e5e7eb",
//   };
//   const inputStyle = {
//     width: "100%",
//     padding: "0.75rem",
//     border: "2px solid #e5e7eb",
//     borderRadius: "0.5rem",
//     fontSize: "1rem",
//     marginBottom: "1rem",
//   };
//   const buttonStyle = {
//     backgroundColor: "#3b82f6",
//     color: "white",
//     padding: "0.75rem 1.5rem",
//     border: "none",
//     borderRadius: "0.5rem",
//     cursor: "pointer",
//     fontWeight: "600",
//   };
//   const deleteButtonStyle = {
//     backgroundColor: "#ef4444",
//     color: "white",
//     padding: "0.5rem 1rem",
//     border: "none",
//     borderRadius: "0.375rem",
//     cursor: "pointer",
//   };

//   // --- Firestore fetch ---
//   useEffect(() => {
//     fetchAnnouncements();
//     fetchDonations();
//   }, []);

//   async function fetchAnnouncements() {
//     setLoadingAnnouncements(true);
//     try {
//       const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
//       const snap = await getDocs(q);
//       setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
//     } finally {
//       setLoadingAnnouncements(false);
//     }
//   }

//   async function fetchDonations() {
//     setLoadingDonations(true);
//     try {
//       const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
//       const snap = await getDocs(q);
//       setDonations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
//     } finally {
//       setLoadingDonations(false);
//     }
//   }

//   // --- Create announcement ---
//   const handleAnnouncementSubmit = async (e) => {
//     e.preventDefault();
//     if (!newAnnouncement.eventName || !newAnnouncement.date || !newAnnouncement.time || !newAnnouncement.venue) {
//       alert("Fill required fields");
//       return;
//     }

//     let imageUrl = "";
//     if (newAnnouncement.image) {
//       const file = newAnnouncement.image;
//       const imageRef = ref(storage, `announcements/${Date.now()}_${file.name}`);
//       await uploadBytes(imageRef, file);
//       imageUrl = await getDownloadURL(imageRef);
//     }

//     await addDoc(collection(db, "announcements"), {
//       ...newAnnouncement,
//       image: imageUrl,
//       createdAt: new Date().toISOString(),
//     });

//     setNewAnnouncement({
//       eventName: "",
//       description: "",
//       date: "",
//       time: "",
//       venue: "",
//       guests: "",
//       image: null,
//     });
//     fetchAnnouncements();
//   };

//   // --- Create donation ---
//   const handleDonationSubmit = async (e) => {
//     e.preventDefault();
//     if (!newDonation.title || !newDonation.description || !newDonation.targetAmount || !newDonation.deadline) {
//       alert("Fill all donation fields");
//       return;
//     }
//     await addDoc(collection(db, "donations"), {
//       ...newDonation,
//       targetAmount: parseFloat(newDonation.targetAmount),
//       currentAmount: 0,
//       isActive: true,
//       createdAt: new Date().toISOString(),
//     });
//     setNewDonation({ title: "", description: "", targetAmount: "", deadline: "" });
//     fetchDonations();
//   };

//   const deleteAnnouncement = async (id) => {
//     await deleteDoc(doc(db, "announcements", id));
//     fetchAnnouncements();
//   };
//   const deleteDonation = async (id) => {
//     await deleteDoc(doc(db, "donations", id));
//     fetchDonations();
//   };
//   const toggleDonationStatus = async (id, current) => {
//     await updateDoc(doc(db, "donations", id), { isActive: !current });
//     fetchDonations();
//   };

//   // --- UI ---
//   return (
//     <div style={containerStyle}>
//       <div style={headerStyle}>
//         <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Institutional Dashboard</h1>
//         <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>Manage Events & Donations</p>
//       </div>

//       <div style={{ textAlign: "center", margin: "2rem" }}>
//         <button style={tabButtonStyle(activeTab === "announcements")} onClick={() => setActiveTab("announcements")}>
//           Event Announcements
//         </button>
//         <button style={tabButtonStyle(activeTab === "donations")} onClick={() => setActiveTab("donations")}>
//           Donation Campaigns
//         </button>
//       </div>

//       <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
//         {activeTab === "announcements" && (
//           <div>
//             <div style={cardStyle}>
//               <h2>Create New Event Announcement</h2>
//               <form onSubmit={handleAnnouncementSubmit}>
//                 <input
//                   type="text"
//                   placeholder="Event Name"
//                   style={inputStyle}
//                   value={newAnnouncement.eventName}
//                   onChange={(e) => setNewAnnouncement({ ...newAnnouncement, eventName: e.target.value })}
//                 />
//                 <input
//                   type="date"
//                   style={inputStyle}
//                   value={newAnnouncement.date}
//                   onChange={(e) => setNewAnnouncement({ ...newAnnouncement, date: e.target.value })}
//                 />
//                 <input
//                   type="time"
//                   style={inputStyle}
//                   value={newAnnouncement.time}
//                   onChange={(e) => setNewAnnouncement({ ...newAnnouncement, time: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Venue"
//                   style={inputStyle}
//                   value={newAnnouncement.venue}
//                   onChange={(e) => setNewAnnouncement({ ...newAnnouncement, venue: e.target.value })}
//                 />
//                 <textarea
//                   placeholder="Description"
//                   style={inputStyle}
//                   value={newAnnouncement.description}
//                   onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Guests"
//                   style={inputStyle}
//                   value={newAnnouncement.guests}
//                   onChange={(e) => setNewAnnouncement({ ...newAnnouncement, guests: e.target.value })}
//                 />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image: e.target.files[0] })}
//                 />
//                 <button type="submit" style={buttonStyle}>
//                   {loadingAnnouncements ? "Creating..." : "Create Announcement"}
//                 </button>
//               </form>
//             </div>

//             <h2>Current Announcements ({announcements.length})</h2>
//             {loadingAnnouncements && <p>Loading...</p>}
//             {announcements.map((a) => (
//               <div key={a.id} style={cardStyle}>
//                 <h3>{a.eventName}</h3>
//                 <p>{a.description}</p>
//                 <p>
//                   {a.date} {a.time} @ {a.venue}
//                 </p>
//                 {a.image && <img src={a.image} alt={a.eventName} style={{ width: "200px" }} />}
//                 <button style={deleteButtonStyle} onClick={() => deleteAnnouncement(a.id)}>
//                   Delete
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}

//         {activeTab === "donations" && (
//           <div>
//             <div style={cardStyle}>
//               <h2>Create Donation Campaign</h2>
//               <form onSubmit={handleDonationSubmit}>
//                 <input
//                   type="text"
//                   placeholder="Title"
//                   style={inputStyle}
//                   value={newDonation.title}
//                   onChange={(e) => setNewDonation({ ...newDonation, title: e.target.value })}
//                 />
//                 <textarea
//                   placeholder="Description"
//                   style={inputStyle}
//                   value={newDonation.description}
//                   onChange={(e) => setNewDonation({ ...newDonation, description: e.target.value })}
//                 />
//                 <input
//                   type="number"
//                   placeholder="Target Amount"
//                   style={inputStyle}
//                   value={newDonation.targetAmount}
//                   onChange={(e) => setNewDonation({ ...newDonation, targetAmount: e.target.value })}
//                 />
//                 <input
//                   type="date"
//                   style={inputStyle}
//                   value={newDonation.deadline}
//                   onChange={(e) => setNewDonation({ ...newDonation, deadline: e.target.value })}
//                 />
//                 <button type="submit" style={buttonStyle}>
//                   {loadingDonations ? "Creating..." : "Create Campaign"}
//                 </button>
//               </form>
//             </div>

//             <h2>Current Campaigns ({donations.length})</h2>
//             {donations.map((d) => (
//               <div key={d.id} style={cardStyle}>
//                 <h3>{d.title}</h3>
//                 <p>{d.description}</p>
//                 <p>
//                   ₹{d.currentAmount} / ₹{d.targetAmount} — Deadline {d.deadline}
//                 </p>
//                 <button
//                   style={buttonStyle}
//                   onClick={() => toggleDonationStatus(d.id, d.isActive)}
//                 >
//                   {d.isActive ? "Deactivate" : "Activate"}
//                 </button>
//                 <button style={deleteButtonStyle} onClick={() => deleteDonation(d.id)}>
//                   Delete
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// src/pages/InstitutionalDashboard.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase.js";
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
} from "firebase/firestore";
import axios from "axios";

export default function InstitutionalDashboard() {
  const [activeTab, setActiveTab] = useState("announcements");

  const [announcements, setAnnouncements] = useState([]);
  const [donations, setDonations] = useState([]);

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

  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- Firestore fetch ---
  useEffect(() => {
    fetchAnnouncements();
    fetchDonations();
  }, []);

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

  // --- Upload to Cloudinary and create announcement ---
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
        formData.append("upload_preset", "alumni-association"); // your unsigned preset

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

  // --- Create donation ---
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

  // --- Styles (same as your original) ---
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
  const buttonStyle = { backgroundColor: "#3b82f6", color: "white", padding: "0.75rem 1.5rem", border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600" };
  const deleteButtonStyle = { backgroundColor: "#ef4444", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "0.375rem", cursor: "pointer" };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Institutional Dashboard</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>Manage Events & Donations</p>
      </div>

      <div style={{ textAlign: "center", margin: "2rem" }}>
        <button style={tabButtonStyle(activeTab === "announcements")} onClick={() => setActiveTab("announcements")}>
          Event Announcements
        </button>
        <button style={tabButtonStyle(activeTab === "donations")} onClick={() => setActiveTab("donations")}>
          Donation Campaigns
        </button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {activeTab === "announcements" && (
          <div>
            <div style={cardStyle}>
              <h2>Create New Event Announcement</h2>
              <form onSubmit={handleAnnouncementSubmit}>
                <input type="text" placeholder="Event Name" style={inputStyle} value={newAnnouncement.eventName} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, eventName: e.target.value })} />
                <input type="date" style={inputStyle} value={newAnnouncement.date} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, date: e.target.value })} />
                <input type="time" style={inputStyle} value={newAnnouncement.time} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, time: e.target.value })} />
                <input type="text" placeholder="Venue" style={inputStyle} value={newAnnouncement.venue} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, venue: e.target.value })} />
                <textarea placeholder="Description" style={inputStyle} value={newAnnouncement.description} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })} />
                <input type="text" placeholder="Guests" style={inputStyle} value={newAnnouncement.guests} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, guests: e.target.value })} />
                <input type="file" accept="image/*" onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image: e.target.files[0] })} />
                <button type="submit" style={buttonStyle} disabled={uploadingImage}>
                  {uploadingImage ? "Uploading..." : "Create Announcement"}
                </button>
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

        {activeTab === "donations" && (
          <div>
            <div style={cardStyle}>
              <h2>Create Donation Campaign</h2>
              <form onSubmit={handleDonationSubmit}>
                <input type="text" placeholder="Title" style={inputStyle} value={newDonation.title} onChange={(e) => setNewDonation({ ...newDonation, title: e.target.value })} />
                <textarea placeholder="Description" style={inputStyle} value={newDonation.description} onChange={(e) => setNewDonation({ ...newDonation, description: e.target.value })} />
                <input type="number" placeholder="Target Amount" style={inputStyle} value={newDonation.targetAmount} onChange={(e) => setNewDonation({ ...newDonation, targetAmount: e.target.value })} />
                <input type="date" style={inputStyle} value={newDonation.deadline} onChange={(e) => setNewDonation({ ...newDonation, deadline: e.target.value })} />
                <button type="submit" style={buttonStyle}>
                  {loadingDonations ? "Creating..." : "Create Campaign"}
                </button>
              </form>
            </div>

            <h2>Current Campaigns ({donations.length})</h2>
            {donations.map((d) => (
              <div key={d.id} style={cardStyle}>
                <h3>{d.title}</h3>
                <p>{d.description}</p>
                <p>₹{d.currentAmount} / ₹{d.targetAmount} — Deadline {d.deadline}</p>
                <button style={buttonStyle} onClick={() => toggleDonationStatus(d.id, d.isActive)}>
                  {d.isActive ? "Deactivate" : "Activate"}
                </button>
                <button style={deleteButtonStyle} onClick={() => deleteDonation(d.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
