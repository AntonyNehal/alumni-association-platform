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
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export default function PersonalChat() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeView, setActiveView] = useState("conversations");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const [isInstitution, setIsInstitution] = useState(false);

  const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/12225/12225935.png";

  // Check if current user is institution and get user info
  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      try {
        // Check if user is institution (you can modify this logic based on your auth setup)
        const institutionDoc = await getDoc(doc(db, "institutions", currentUser.uid));
        if (institutionDoc.exists()) {
          setIsInstitution(true);
          setCurrentUserName("Institution");
        } else {
          // Check if user is alumni
          const alumniDoc = await getDoc(doc(db, "alumni", currentUser.uid));
          if (alumniDoc.exists()) {
            const data = alumniDoc.data();
            setCurrentUserName(data.name || currentUser.displayName || "Unknown User");
            setIsInstitution(false);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Handle navigation from institutional dashboard with alumni info
  useEffect(() => {
    if (location.state?.alumni) {
      const alumni = location.state.alumni;
      // Create or find conversation with this alumni
      const conversationId = createConversationId(currentUser.uid, alumni.id);
      const conversation = {
        id: conversationId,
        participantIds: [currentUser.uid, alumni.id],
        participantNames: [currentUserName, alumni.name],
        lastMessage: "",
        lastMessageTime: new Date(),
        otherParticipant: {
          id: alumni.id,
          name: alumni.name,
          email: alumni.email,
          profilePicture: alumni.profilePicture,
          workPosition: alumni.workPosition,
          workingDomain: alumni.workingDomain,
        }
      };
      setSelectedConversation(conversation);
      setActiveView("chat");
    }
  }, [location.state, currentUserName]);

  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const q = query(
          collection(db, "personalChats"),
          where("participantIds", "array-contains", currentUser.uid),
          orderBy("lastMessageTime", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const conversationPromises = snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const otherParticipantId = data.participantIds.find(id => id !== currentUser.uid);
            
            // Get other participant's info
            let otherParticipant = { name: "Unknown User", email: "", profilePicture: defaultProfilePicture };
            
            // Try alumni collection first
            const alumniDoc = await getDoc(doc(db, "alumni", otherParticipantId));
            if (alumniDoc.exists()) {
              const alumniData = alumniDoc.data();
              otherParticipant = {
                id: otherParticipantId,
                name: alumniData.name || "Unknown Alumni",
                email: alumniData.email || "",
                profilePicture: alumniData.profilePicture || defaultProfilePicture,
                workPosition: alumniData.workPosition,
                workingDomain: alumniData.workingDomain,
              };
            } else {
              // Try institutions collection
              const institutionDoc = await getDoc(doc(db, "institutions", otherParticipantId));
              if (institutionDoc.exists()) {
                otherParticipant = {
                  id: otherParticipantId,
                  name: "Institution",
                  email: institutionDoc.data().email || "",
                  profilePicture: defaultProfilePicture,
                };
              }
            }

            return {
              id: docSnap.id,
              ...data,
              otherParticipant,
            };
          });

          const conversationsData = await Promise.all(conversationPromises);
          setConversations(conversationsData);
          setFilteredConversations(conversationsData);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  // Filter conversations based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.otherParticipant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.otherParticipant.workingDomain && conv.otherParticipant.workingDomain.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const q = query(
      collection(db, "personalChats", selectedConversation.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => {
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
  }, [selectedConversation, currentUser]);

  // Create conversation ID (consistent ordering)
  const createConversationId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("_");
  };

  // Handle conversation click
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setActiveView("chat");
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      // Add message to conversation
      await addDoc(collection(db, "personalChats", selectedConversation.id, "messages"), {
        sender: currentUserName,
        senderId: currentUser.uid,
        content: newMessage,
        timestamp: serverTimestamp(),
      });

      // Update conversation's last message
      const conversationRef = doc(db, "personalChats", selectedConversation.id);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        // Create new conversation document
        await addDoc(collection(db, "personalChats"), {
          id: selectedConversation.id,
          participantIds: selectedConversation.participantIds,
          participantNames: selectedConversation.participantNames,
          lastMessage: newMessage,
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      } else {
        // Update existing conversation
        await updateDoc(conversationRef, {
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

  const backToConversations = () => {
    setActiveView("conversations");
    setSelectedConversation(null);
    setMessages([]);
  };

  // Styles
  const containerStyle = { 
    minHeight: "100vh", 
    backgroundColor: "#f8fafc", 
    paddingTop: "4rem", 
    display: "flex" 
  };
  
  const sidebarStyle = { 
    width: "350px", 
    backgroundColor: "white", 
    borderRight: "1px solid #e5e7eb", 
    height: "calc(100vh - 4rem)", 
    overflow: "hidden", 
    display: "flex", 
    flexDirection: "column" 
  };
  
  const chatAreaStyle = { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    backgroundColor: "#f8fafc" 
  };
  
  const headerStyle = { 
    padding: "1.5rem", 
    borderBottom: "1px solid #e5e7eb", 
    backgroundColor: "white" 
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
    backgroundColor: "white" 
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
    transition: "all 0.3s ease" 
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
            Personal Messages
          </h2>

          {activeView === "chat" && selectedConversation && (
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={backToConversations}
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
              >
                ← Back to Conversations
              </button>
            </div>
          )}

          {activeView === "conversations" && (
            <button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: "white",
                color: "#2563eb",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                marginTop: "0.5rem",
              }}
            >
              ← Back to Dashboard
            </button>
          )}
        </div>

        {/* Conversations List */}
        {activeView === "conversations" && (
          <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e5e7eb",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                marginBottom: "1rem",
                outline: "none",
              }}
            />

            {loadingConversations && (
              <p style={{ textAlign: "center", color: "#6b7280" }}>Loading conversations...</p>
            )}

            {!loadingConversations && filteredConversations.length === 0 && (
              <p style={{ textAlign: "center", color: "#6b7280" }}>
                No conversations found. Start a conversation from the dashboard.
              </p>
            )}

            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                style={{
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
                }}
                onClick={() => handleConversationClick(conversation)}
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
                  src={conversation.otherParticipant.profilePicture || defaultProfilePicture}
                  alt={conversation.otherParticipant.name}
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
                  <h4 style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: "600", 
                    color: "#2563eb", 
                    marginBottom: "0.25rem",
                    margin: 0
                  }}>
                    {conversation.otherParticipant.name}
                  </h4>
                  {conversation.otherParticipant.workPosition && (
                    <p style={{ 
                      fontSize: "0.85rem", 
                      color: "#6b7280", 
                      margin: "0.25rem 0" 
                    }}>
                      {conversation.otherParticipant.workPosition}
                    </p>
                  )}
                  {conversation.lastMessage && (
                    <p style={{ 
                      fontSize: "0.9rem", 
                      color: "#9ca3af", 
                      margin: "0.25rem 0 0 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {conversation.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Header in Sidebar */}
        {activeView === "chat" && selectedConversation && (
          <div style={{ 
            padding: "1rem", 
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f8fafc" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <img
                src={selectedConversation.otherParticipant.profilePicture || defaultProfilePicture}
                alt={selectedConversation.otherParticipant.name}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #e5e7eb",
                }}
                onError={(e) => { e.target.src = defaultProfilePicture; }}
              />
              <div>
                <h3 style={{ 
                  fontSize: "1.2rem", 
                  fontWeight: "600", 
                  color: "#2563eb", 
                  margin: "0 0 0.25rem 0" 
                }}>
                  {selectedConversation.otherParticipant.name}
                </h3>
                {selectedConversation.otherParticipant.workPosition && (
                  <p style={{ 
                    fontSize: "0.9rem", 
                    color: "#6b7280", 
                    margin: 0 
                  }}>
                    {selectedConversation.otherParticipant.workPosition}
                  </p>
                )}
                {selectedConversation.otherParticipant.workingDomain && (
                  <p style={{ 
                    fontSize: "0.85rem", 
                    color: "#9ca3af", 
                    margin: "0.25rem 0 0 0" 
                  }}>
                    {selectedConversation.otherParticipant.workingDomain}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div style={chatAreaStyle}>
        {activeView === "conversations" ? (
          <div style={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            flexDirection: "column", 
            color: "#6b7280" 
          }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Welcome to Personal Messages
              </h2>
              <p style={{ fontSize: "1rem" }}>
                {isInstitution 
                  ? "Select a conversation to chat with alumni or start a new conversation from the dashboard"
                  : "Select a conversation to start chatting"
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Messages Scroll Area */}
              <div style={{ 
                flex: 1, 
                overflowY: "auto", 
                padding: "1rem", 
                backgroundColor: "#f8fafc" 
              }}>
                {messages.length === 0 && (
                  <div style={{ 
                    textAlign: "center", 
                    color: "#6b7280", 
                    marginTop: "2rem" 
                  }}>
                    <p>Start a conversation by sending a message!</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} style={messageStyle(message.isOwn)}>
                    {!message.isOwn && (
                      <div style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: "600", 
                        marginBottom: "0.25rem", 
                        color: message.isOwn ? "rgba(255,255,255,0.8)" : "#6b7280" 
                      }}>
                        {message.sender}
                      </div>
                    )}
                    <div style={{ marginBottom: "0.25rem" }}>{message.content}</div>
                    <div style={{ 
                      fontSize: "0.75rem", 
                      opacity: 0.7, 
                      textAlign: "right" 
                    }}>
                      {message.timestamp?.toDate
                        ? message.timestamp.toDate().toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })
                        : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <div style={{ 
                padding: "1rem 1.5rem", 
                backgroundColor: "white", 
                borderTop: "1px solid #e5e7eb", 
                display: "flex", 
                alignItems: "center", 
                position: "sticky", 
                bottom: 0 
              }}>
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