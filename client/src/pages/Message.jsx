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
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext.jsx";

export default function Message() {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState("groups");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedInstitutionChat, setSelectedInstitutionChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [departmentGroup, setDepartmentGroup] = useState(null);
  const [yearGroup, setYearGroup] = useState(null);
  const [institutionChats, setInstitutionChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingInstitutionChats, setLoadingInstitutionChats] = useState(true);
  const [userName, setUserName] = useState("");

  const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/12225/12225935.png";

  // Load current user's alumni info
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

  // Fetch institution chats
  useEffect(() => {
    if (!currentUser) return;

    const fetchInstitutionChats = async () => {
      try {
        const q = query(
          collection(db, "personalChats"),
          where("participantIds", "array-contains", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          console.log("Found personalChats:", snapshot.docs.length); // Debug log
          
          const chatPromises = snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            console.log("Chat data:", data); // Debug log
            
            const otherParticipantId = data.participantIds.find(id => id !== currentUser.uid);
            console.log("Other participant ID:", otherParticipantId); // Debug log
            
            // Try multiple approaches to identify institution
            let isInstitution = false;
            let institutionInfo = {
              id: otherParticipantId,
              name: "Institution",
              email: "",
              profilePicture: defaultProfilePicture,
            };

            // Method 1: Check institutions collection
            try {
              const institutionDoc = await getDoc(doc(db, "institutions", otherParticipantId));
              if (institutionDoc.exists()) {
                console.log("Found in institutions collection");
                isInstitution = true;
                institutionInfo.email = institutionDoc.data().email || "";
              }
            } catch (error) {
              console.log("Error checking institutions collection:", error);
            }

            // Method 2: Check if NOT in alumni collection (fallback)
            if (!isInstitution) {
              try {
                const alumniDoc = await getDoc(doc(db, "alumni", otherParticipantId));
                if (!alumniDoc.exists()) {
                  console.log("Not found in alumni collection, treating as institution");
                  isInstitution = true;
                }
              } catch (error) {
                console.log("Error checking alumni collection:", error);
              }
            }

            // Method 3: Check participantNames for institution indicators
            if (!isInstitution && data.participantNames) {
              const otherParticipantName = data.participantNames.find(name => 
                name !== userName && name !== currentUser.displayName && name !== currentUser.email
              );
              
              // If the other participant name is empty or indicates institution
              if (!otherParticipantName || otherParticipantName === "" || 
                  otherParticipantName.toLowerCase().includes("institution") ||
                  otherParticipantName.toLowerCase().includes("college") ||
                  otherParticipantName.toLowerCase().includes("admin")) {
                console.log("Identified as institution by name pattern");
                isInstitution = true;
              }
            }

            if (isInstitution) {
              console.log("Returning institution chat");
              return {
                id: docSnap.id,
                ...data,
                institutionInfo,
                type: "institution"
              };
            }
            
            return null;
          });

          const chats = (await Promise.all(chatPromises)).filter(chat => chat !== null);
          console.log("Institution chats found:", chats.length); // Debug log
          setInstitutionChats(chats);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching institution chats:", error);
      } finally {
        setLoadingInstitutionChats(false);
      }
    };

    fetchInstitutionChats();
  }, [currentUser, userName]);

  // Fetch realtime messages for selected group or institution chat
  useEffect(() => {
    let unsubscribe;

    if (selectedGroup) {
      // For group messages
      const q = query(
        collection(db, "groups", selectedGroup.id, "messages"),
        orderBy("timestamp", "asc")
      );

      unsubscribe = onSnapshot(q, (snap) => {
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
    } else if (selectedInstitutionChat) {
      // For institution chat messages
      const q = query(
        collection(db, "personalChats", selectedInstitutionChat.id, "messages"),
        orderBy("timestamp", "asc")
      );

      unsubscribe = onSnapshot(q, (snap) => {
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
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedGroup, selectedInstitutionChat, currentUser]);

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setSelectedInstitutionChat(null);
    setActiveView("chat");
  };

  const handleInstitutionChatClick = (chat) => {
    setSelectedInstitutionChat(chat);
    setSelectedGroup(null);
    setActiveView("chat");
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      if (selectedGroup) {
        // Send to group
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
      } else if (selectedInstitutionChat) {
        // Send to institution chat
        await addDoc(collection(db, "personalChats", selectedInstitutionChat.id, "messages"), {
          sender: userName,
          senderId: currentUser.uid,
          content: newMessage,
          timestamp: serverTimestamp(),
        });

        // Update conversation's last message
        await updateDoc(doc(db, "personalChats", selectedInstitutionChat.id), {
          lastMessage: newMessage,
          lastMessageTime: serverTimestamp(),
        });
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
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
    setSelectedInstitutionChat(null);
    setMessages([]);
  };

  // Get current chat title
  const getCurrentChatTitle = () => {
    if (selectedGroup) {
      return selectedGroup.name;
    } else if (selectedInstitutionChat) {
      return selectedInstitutionChat.institutionInfo.name;
    }
    return "";
  };

  const getCurrentChatType = () => {
    if (selectedGroup) {
      return selectedGroup.type === "department" ? "Department" : "Batch";
    } else if (selectedInstitutionChat) {
      return "Institution";
    }
    return "";
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

  const groupCardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "0.75rem",
    padding: "1rem",
    marginBottom: "0.75rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const institutionChatCardStyle = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "0.75rem",
    padding: "1rem",
    marginBottom: "0.75rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

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

          {activeView === "chat" && (selectedGroup || selectedInstitutionChat) && (
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
                {getCurrentChatTitle()}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#dbeafe" }}>
                {getCurrentChatType()} {getCurrentChatType() === "Institution" ? "Chat" : "Group"}
              </p>
            </div>
          )}
        </div>

        {/* Groups List */}
        {activeView === "groups" && (
          <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
            {/* Institution Chats */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e3a8a", marginBottom: "0.75rem" }}>
              Institution Messages
            </h3>
            {loadingInstitutionChats ? (
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>Loading institution chats...</p>
            ) : institutionChats.length > 0 ? (
              institutionChats.map((chat) => (
                <div
                  key={chat.id}
                  style={institutionChatCardStyle}
                  onClick={() => handleInstitutionChatClick(chat)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <img
                    src={chat.institutionInfo.profilePicture || defaultProfilePicture}
                    alt="Institution"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e5e7eb",
                    }}
                    onError={(e) => { e.target.src = defaultProfilePicture; }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2563eb", marginBottom: "0.25rem", margin: 0 }}>
                      {chat.institutionInfo.name}
                    </h4>
                    {chat.lastMessage && (
                      <p style={{ 
                        fontSize: "0.9rem", 
                        color: "#6b7280", 
                        margin: "0.25rem 0 0 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {chat.lastMessage}
                      </p>
                    )}
                    <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: "0.25rem 0 0 0" }}>
                      Event discussions & announcements
                    </p>
                  </div>
                  <div style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    backgroundColor: "#10b981",
                    flexShrink: 0
                  }}></div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>No messages from institution</p>
            )}

            {/* Department Groups */}
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e3a8a", marginTop: "2rem", marginBottom: "0.75rem" }}>
              Department Groups
            </h3>
            {departmentGroup ? (
              <div
                key={departmentGroup.id}
                style={groupCardStyle}
                onClick={() => handleGroupClick(departmentGroup)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2563eb", marginBottom: "0.25rem" }}>
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
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e3a8a", margin: "1rem 0 0.75rem" }}>
              Year Groups
            </h3>
            {yearGroup ? (
              <div
                key={yearGroup.id}
                style={groupCardStyle}
                onClick={() => handleGroupClick(yearGroup)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <h4 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#2563eb", marginBottom: "0.25rem" }}>
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
                Select a group or institution chat to start messaging
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Messages Scroll Area */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1rem", backgroundColor: "#f8fafc" }}>
                {messages.length === 0 && (
                  <div style={{ 
                    textAlign: "center", 
                    color: "#6b7280", 
                    marginTop: "2rem" 
                  }}>
                    <p>
                      {selectedInstitutionChat 
                        ? "Start a conversation with the institution!"
                        : "No messages yet. Be the first to say something!"
                      }
                    </p>
                  </div>
                )}
                
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
                  placeholder={
                    selectedInstitutionChat 
                      ? "Reply to institution..." 
                      : "Type your message..."
                  }
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