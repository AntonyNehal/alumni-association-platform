// src/pages/UserHomePage.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from "react-router-dom";
export default function UserHome() {
  const [announcements, setAnnouncements] = useState([]);
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Announcements / Events
        const annSnap = await getDocs(collection(db, 'announcements'));
        const annData = annSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnnouncements(annData);

        // Fetch Donations
        const donSnap = await getDocs(collection(db, 'donations'));
        const donData = donSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonations(donData);
      } catch (err) {
        console.error('Error fetching data from Firebase:', err);
      }
    };

    fetchData();
  }, []);

  const handleDonate = (donation) => {
    setSelectedDonation(donation);
    setDonationAmount('');
  };

  const processDonation = () => {
    if (!donationAmount || donationAmount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }
    // In a real app, integrate payment and update Firestore
    alert(`Thank you for donating ₹${donationAmount} to "${selectedDonation.title}"!`);
    setSelectedDonation(null);
    setDonationAmount('');
  };

  const closeModal = () => {
    setSelectedDonation(null);
    setDonationAmount('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // === Styles ===
  const containerStyle = { minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: '5rem' };
  const headerStyle = { background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', padding: '3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' };
  const headerDecorStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)`, zIndex: 1 };
  const sectionStyle = { padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' };
  const sectionTitleStyle = { fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem', background: 'linear-gradient(45deg, #1e40af, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' };
  const cardStyle = { backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease', border: '1px solid #e5e7eb', height: '100%' };
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '4rem' };
  const imageStyle = { width: '100%', height: '600px',objectFit: 'cover', backgroundColor: '#f3f4f6' };
  const cardContentStyle = { padding: '1.5rem' };
  const donationCardStyle = { ...cardStyle, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' };
  const buttonStyle = { background: 'linear-gradient(45deg, #3b82f6, #1e40af)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.3s ease', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const donateButtonStyle = { ...buttonStyle, background: 'linear-gradient(45deg, #10b981, #059669)', width: '100%', marginTop: '1rem' };
  const inputStyle = { width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem', marginBottom: '1rem', boxSizing: 'border-box' };
  const modalStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflow: 'auto' };
 const [activeTab, setActiveTab] = useState("messages");

  const tabButtonStyle = (isActive) => ({
    padding: "0.75rem 1.5rem",
    margin: "0 0.5rem",
    border: "none",
    borderRadius: "8px",
    backgroundColor: isActive ? "#2563eb" : "#e5e7eb",
    color: isActive ? "#fff" : "#374151",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  });
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerDecorStyle}></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Welcome Back, Alumni!</h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.9 }}>Stay connected with CEC</p>
        </div>
      </div>
      <div style={{ textAlign: "center", margin: "2rem" }}>
  <button
    style={tabButtonStyle(activeTab === "messages")}
    onClick={() => navigate("/message")}
  >
    Message
  </button>
  <button
    style={tabButtonStyle(activeTab === "profile")}
    onClick={() => setActiveTab("profile")}
  >
    Profile
  </button>
</div>


      {/* Events & Announcements */}
      <div style={sectionStyle}>
  <h2 style={sectionTitleStyle}>Latest Events & Announcements</h2>
  <div style={gridStyle}>
    {announcements.map((announcement) => (
      <div key={announcement.id} style={cardStyle}>
        {announcement.image && (
          <img
            src={announcement.image}
            alt={announcement.eventName || announcement.title}
            style={imageStyle}
            onError={(e) => {
              e.target.src =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDUwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
            }}
          />
        )}
        <div style={cardContentStyle}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            {announcement.eventName || announcement.title}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            {announcement.description}
          </p>
          {announcement.date && (
            <p style={{ color: '#374151', fontSize: '0.85rem' }}>📅 {formatDate(announcement.date)}</p>
          )}
          {announcement.time && (
            <p style={{ color: '#374151', fontSize: '0.85rem' }}>⏰ {announcement.time}</p>
          )}
          {announcement.venue && (
            <p style={{ color: '#374151', fontSize: '0.85rem' }}>📍 {announcement.venue}</p>
          )}
          <button style={buttonStyle}>Register for Event</button>
        </div>
      </div>
    ))}
  </div>
</div>


      {/* Donations */}
      <div style={{ ...sectionStyle, backgroundColor: '#f8fafc', paddingTop: '3rem' }}>
        <h2 style={sectionTitleStyle}>Support Our Initiatives</h2>
        <div style={gridStyle}>
          {donations.map(donation => (
            <div key={donation.id} style={donationCardStyle}>
              <div style={cardContentStyle}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>{donation.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>{donation.description}</p>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ width: '100%', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${(donation.currentAmount / donation.targetAmount) * 100}%`, height: '100%', background: 'linear-gradient(45deg, #10b981, #059669)', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    <span>{((donation.currentAmount / donation.targetAmount) * 100).toFixed(1)}% completed</span>
                    <span>Deadline: {donation.deadline && new Date(donation.deadline).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                {donation.isActive && <button style={donateButtonStyle} onClick={() => handleDonate(donation)}>Donate Now</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Donation Modal */}
      {selectedDonation && (
        <div style={modalStyle} onClick={closeModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Donate to: {selectedDonation.title}</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{selectedDonation.description}</p>
            <input type="number" placeholder="Enter amount" min="1" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button style={{ ...donateButtonStyle, marginTop: 0 }} onClick={processDonation}>Confirm Donation</button>
              <button style={{ ...buttonStyle, background: '#6b7280', width: '100%' }} onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
