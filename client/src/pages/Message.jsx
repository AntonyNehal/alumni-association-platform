import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase"; // make sure your firebase.js exports db

export default function Message() {
  const [activeView, setActiveView] = useState("groups"); // 'groups' or 'chat'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [departmentGroups, setDepartmentGroups] = useState([]);
  const [yearGroups, setYearGroups] = useState([]);
  const [messages, setMessages] = useState([]);

  // ✅ Fetch groups (departments + years) from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "communityGroups"), (snap) => {
      const groups = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setDepartmentGroups(groups.filter((g) => g.type === "department"));
      setYearGroups(groups.filter((g) => g.type === "year" || g.type === "batch"));
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch realtime messages for selected group
  useEffect(() => {
    if (!selectedGroup) return;

    const q = query(
      collection(db, "communityGroups", selectedGroup.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isOwn: doc.data().sender === "You", // replace with logged-in user check later
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedGroup]);

  // Styles (unchanged)
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    paddingTop: "4rem",
    display: "flex",
  };

  const sidebarStyle = {
    width: "350px",
    backgroundColor: "white",
    borderRight: "1px solid #e5e7eb",
    height: "calc(100vh - 4rem)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const chatAreaStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f8fafc",
  };

  const headerStyle = {
    padding: "1.5rem",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "white",
  };

  const tabButtonStyle = (isActive) => ({
    padding: "0.75rem 1.5rem",
    backgroundColor: isActive ? "#3b82f6" : "transparent",
    color: isActive ? "white" : "#6b7280",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.875rem",
    margin: "0 0.25rem",
    transition: "all 0.3s ease",
  });

  const groupItemStyle = {
    padding: "1rem",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "white",
  };

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

  const inputStyle = {
    flex: 1,
    padding: "1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "1.5rem",
    fontSize: "1rem",
    outline: "none",
    backgroundColor: "white",
  };

  const sendButtonStyle = {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "1rem 1.5rem",
    borderRadius: "1.5rem",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    marginLeft: "0.5rem",
    transition: "all 0.3s ease",
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setActiveView("chat");
  };

  // ✅ Send message to Firestore
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup) return;

    await addDoc(
      collection(db, "communityGroups", selectedGroup.id, "messages"),
      {
        sender: "You", // replace later with currentUser
        content: newMessage,
        timestamp: serverTimestamp(),
      }
    );

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const backToGroups = () => {
    setActiveView("groups");
    setSelectedGroup(null);
  };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Alumni Community
          </h2>

          {activeView === "groups" && (
            <div style={{ display: "flex", marginBottom: "1rem" }}>
              <button style={tabButtonStyle(true)}>Department Groups</button>
              <button style={tabButtonStyle(false)}>Year Groups</button>
            </div>
          )}

          {activeView === "chat" && selectedGroup && (
            <div>
              <button
                onClick={backToGroups}
                style={{
                  backgroundColor: "#e5e7eb",
                  color: "#374151",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "1rem",
                }}
              >
                ← Back to Groups
              </button>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#374151" }}>
                {selectedGroup.name}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                {selectedGroup.memberCount} members
              </p>
            </div>
          )}
        </div>

        {/* Groups List */}
        {activeView === "groups" && (
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ padding: "0 1.5rem", marginBottom: "1rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Department Groups
              </h3>
            </div>

            {departmentGroups.map((group) => (
              <div
                key={group.id}
                style={groupItemStyle}
                onClick={() => handleGroupClick(group)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          color: "#374151",
                          margin: 0,
                        }}
                      >
                        {group.name}
                      </h4>
                      {group.unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            padding: "0.125rem 0.375rem",
                            borderRadius: "0.75rem",
                            minWidth: "1.25rem",
                            textAlign: "center",
                          }}
                        >
                          {group.unreadCount}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        margin: 0,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {group.memberCount} members
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0 }}>
                      {group.lastMessage}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    {group.lastMessageTime}
                  </span>
                </div>
              </div>
            ))}

            <div style={{ padding: "0 1.5rem", margin: "1.5rem 0 1rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Year Groups
              </h3>
            </div>

            {yearGroups.map((group) => (
              <div
                key={group.id}
                style={groupItemStyle}
                onClick={() => handleGroupClick(group)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          color: "#374151",
                          margin: 0,
                        }}
                      >
                        {group.name}
                      </h4>
                      {group.unreadCount > 0 && (
                        <span
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            padding: "0.125rem 0.375rem",
                            borderRadius: "0.75rem",
                            minWidth: "1.25rem",
                            textAlign: "center",
                          }}
                        >
                          {group.unreadCount}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        margin: 0,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {group.memberCount} members
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0 }}>
                      {group.lastMessage}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    {group.lastMessageTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div style={chatAreaStyle}>
        {activeView === "groups" ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#6b7280",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                }}
              >
                Welcome to Alumni Community
              </h2>
              <p style={{ fontSize: "1rem" }}>
                Select a group to start messaging with your fellow alumni
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: "1rem 1.5rem",
                backgroundColor: "white",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "#374151",
                    margin: 0,
                  }}
                >
                  {selectedGroup?.name}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
                  {selectedGroup?.memberCount} members •{" "}
                  {selectedGroup?.type === "department" ? "Department" : "Batch"} Group
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: "1rem 0",
                backgroundColor: "#f8fafc",
              }}
            >
              {messages.map((message) => (
                <div key={message.id} style={messageStyle(message.isOwn)}>
                  {!message.isOwn && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                        color: "#6b7280",
                      }}
                    >
                      {message.sender}
                    </div>
                  )}
                  <div style={{ marginBottom: "0.25rem" }}>{message.content}</div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      opacity: 0.7,
                      textAlign: "right",
                    }}
                  >
                    {message.timestamp?.toDate
                      ? message.timestamp.toDate().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div
              style={{
                padding: "1rem 1.5rem",
                backgroundColor: "white",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
              }}
            >
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
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#3b82f6";
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
