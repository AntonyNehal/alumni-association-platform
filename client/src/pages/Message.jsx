import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext.jsx";

export default function Message() {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState("groups");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [departmentGroup, setDepartmentGroup] = useState(null);
  const [yearGroup, setYearGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [userName, setUserName] = useState(""); // ✅ store user's name

  // ✅ Load current user's alumni info
  useEffect(() => {
    if (!currentUser) return;
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, "alumni", currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();

          // Save user's name for chat
          setUserName(data.name || currentUser.displayName || "Unknown User");

          // Department group
          if (data.department) {
            setDepartmentGroup({
              id: `dept-${data.department}`,
              name: data.department,
              type: "department",
            });
          }

          // Year (department + batch) group
          if (data.department && data.batch) {
            setYearGroup({
              id: `batch-${data.department}-${data.batch}`,
              name: `${data.department} - ${data.batch}`,
              type: "year",
            });
          }
        }
      } catch (err) {
        console.error("Error fetching alumni:", err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchUserData();
  }, [currentUser]);

  // ✅ Fetch realtime messages for selected group
  useEffect(() => {
    if (!selectedGroup) return;

    const q = query(
      collection(db, "groups", selectedGroup.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          isOwn: currentUser && data.senderId === currentUser.uid,
        };
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedGroup, currentUser]);

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setActiveView("chat");
  };

  // ✅ Always use user's name instead of email
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup || !currentUser) return;

   const userDoc = await getDoc(doc(db, "alumni", currentUser.uid));
let senderName = currentUser.email; // fallback

if (userDoc.exists()) {
  senderName = userDoc.data().name || currentUser.email;
}

await addDoc(collection(db, "groups", selectedGroup.id, "messages"), {
  sender: senderName,
  senderId: currentUser.uid,
  content: newMessage,
  timestamp: serverTimestamp(),
});


    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const backToGroups = () => {
    setActiveView("groups");
    setSelectedGroup(null);
    setMessages([]);
  };

  // ===== Styles =====
  const containerStyle = { minHeight: "100vh", backgroundColor: "#f8fafc", paddingTop: "4rem", display: "flex" };
  const sidebarStyle = { width: "350px", backgroundColor: "white", borderRight: "1px solid #e5e7eb", height: "calc(100vh - 4rem)", overflow: "hidden", display: "flex", flexDirection: "column" };
  const chatAreaStyle = { flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f8fafc" };
  const headerStyle = { padding: "1.5rem", borderBottom: "1px solid #e5e7eb", backgroundColor: "white" };
  const messageStyle = (isOwn) => ({
    maxWidth: "70%",
    margin: "0.5rem",
    marginLeft: isOwn ? "auto" : "1rem",
    marginRight: isOwn ? "1rem" : "auto",
    padding: "0.75rem 1rem",
    borderRadius: isOwn ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
    backgroundColor: isOwn ? "#3b82f6" : "white",
    color: isOwn ? "white" : "#374151",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  });
  const inputStyle = { flex: 1, padding: "1rem", border: "2px solid #e5e7eb", borderRadius: "1.5rem", fontSize: "1rem", outline: "none", backgroundColor: "white" };
  const sendButtonStyle = { backgroundColor: "#3b82f6", color: "white", padding: "1rem 1.5rem", borderRadius: "1.5rem", border: "none", cursor: "pointer", fontWeight: "600", marginLeft: "0.5rem", transition: "all 0.3s ease" };

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        {/* Sidebar Header */}
        <div
          style={{
            ...headerStyle,
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "white",
            textAlign: "center",
            borderBottom: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            Alumni Community
          </h2>

          {activeView === "chat" && selectedGroup && (
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={backToGroups}
                style={{
                  backgroundColor: "white",
                  color: "#2563eb",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
              >
                ← Back to Groups
              </button>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "white", marginTop: "0.75rem" }}>
                {selectedGroup.name}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#dbeafe" }}>
                {selectedGroup.type === "department" ? "Department" : "Batch"} Group
              </p>
            </div>
          )}
        </div>

        {/* Groups List */}
        {activeView === "groups" && (
          <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
            {/* Department Groups */}
            <h3 style={{ fontSize: "2rem", fontWeight: "600", color: "#1e3a8a", marginBottom: "0.75rem" }}>
              Department Groups
            </h3>
            {departmentGroup ? (
              <div
                key={departmentGroup.id}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onClick={() => handleGroupClick(departmentGroup)}
              >
                <h4 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#2563eb", marginBottom: "0.25rem" }}>
                  {departmentGroup.name}
                </h4>
                <p style={{ fontSize: "1rem", color: "#6b7280", margin: 0 }}>
                  Department Group
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>No department group found</p>
            )}

            {/* Year Groups */}
            <h3 style={{ fontSize: "2rem", fontWeight: "600", color: "#1e3a8a", margin: "1rem 0 0.75rem" }}>
              Year Groups
            </h3>
            {yearGroup ? (
              <div
                key={yearGroup.id}
                style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                onClick={() => handleGroupClick(yearGroup)}
              >
                <h4 style={{ fontSize: "1.4rem", fontWeight: "600", color: "#2563eb", marginBottom: "0.25rem" }}>
                  {yearGroup.name}
                </h4>
                <p style={{ fontSize: "1rem", color: "#6b7280", margin: 0 }}>
                  Year Group
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>No year group found</p>
            )}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div style={chatAreaStyle}>
        {activeView === "groups" ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#6b7280" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Welcome to Alumni Community
              </h2>
              <p style={{ fontSize: "1rem" }}>
                Select a group to start messaging with your fellow alumni
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Messages Scroll Area */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1rem", backgroundColor: "#f8fafc" }}>
                {messages.map((message) => (
                  <div key={message.id} style={messageStyle(message.isOwn)}>
                    {!message.isOwn && (
                      <div style={{ fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.25rem", color: "#6b7280" }}>
                        {message.sender}
                      </div>
                    )}
                    <div style={{ marginBottom: "0.25rem" }}>{message.content}</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7, textAlign: "right" }}>
                      {message.timestamp?.toDate
                        ? message.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <div style={{ padding: "1rem 1.5rem", backgroundColor: "white", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", position: "sticky", bottom: 0 }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  style={inputStyle}
                />
                <button
                  onClick={handleSendMessage}
                  style={sendButtonStyle}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
