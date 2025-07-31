import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { IoMdImages } from "react-icons/io";
import { MdNavigateBefore } from "react-icons/md";
import { TbSend2 } from "react-icons/tb";
import defaultProfileImg from "../../assets/images/profile.jpg";
import { useAuth } from "../../provider/authcontext";
import { getCsrfToken } from "../../provider/csrf";
import "../style/ChatWidget.css";

export default function ChatWidget() {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { user, isLoggedIn } = useAuth();
  const userId = user?._id;

  const getProfilePicture = (user) => {
    if (user?.profilePicture) {
      return user.profilePicture.startsWith("http")
        ? user.profilePicture
        : `http://localhost:2005${user.profilePicture}`;
    }
    return defaultProfileImg;
  };

  const getOtherUser = (room) => {
    return room.participants?.find((p) => p._id !== userId);
  };

  const fetchChatRooms = async () => {
    if (!isLoggedIn || !userId) return;

    setLoading(true);
    try {
      const res = await axios.get(`/api/chat`, { withCredentials: true });
      setChatRooms(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching chat rooms:", err);
      setError("Failed to load chat rooms.");
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const openChatRoom = async (roomId) => {
    if (!userId) return;

    try {
      setSelectedRoomId(roomId);
      setLoading(true);
      const res = await axios.get(`/api/chat/${roomId}`, { withCredentials: true });
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && images.length === 0 || !userId) return;

    const firstMsg = messages.find((m) => m.senderId?._id || m.receiverId?._id);
    const receiverId =
      firstMsg?.senderId?._id?.toString() === userId
        ? firstMsg?.receiverId?._id
        : firstMsg?.senderId?._id;

    if (!receiverId) {
      setError("Unable to determine recipient.");
      return;
    }

    const formData = new FormData();
    formData.append("text", text);
    images.forEach((img) => formData.append("attachments", img));

    try {
      setLoading(true);
      const csrfToken = await getCsrfToken();

      const res = await axios.post(`/api/chat/${selectedRoomId}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data", "CSRF-Token": csrfToken
        }
      });

      setMessages((prev) => [...prev, res.data]);
      setText("");
      setImages([]);
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setError("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, [userId, isLoggedIn]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!isLoggedIn || !userId) {
    return (
      <div className="chat-widget">
        <div className="chat-header">🔒 Authentication Required</div>
        <div style={{ padding: "20px", textAlign: "center", fontSize: "14px", color: "#666" }}>
          Please log in to access chat features.
        </div>
      </div>
    );
  }

  const currentRoom = chatRooms.find((r) => r._id === selectedRoomId);
  return (
    <div className="chat-widget">
      {/* Header */}
      <div className="chat-header" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px'
      }}>
        {selectedRoomId && (
          <button
            onClick={() => setSelectedRoomId(null)}
            className="chat-back-button"
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              padding: '0',
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
              minWidth: '24px',
              height: '24px'
            }}
          >
            <MdNavigateBefore />
          </button>
        )}
        <span style={{
          fontSize: '16px',
          fontWeight: '500',
          lineHeight: '1'
        }}>
          {selectedRoomId ? (currentRoom?.title || "Project") : "Messages"}
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '8px 12px',
          fontSize: '12px',
          borderBottom: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {!selectedRoomId ? (
        <div className="chat-room-list">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#4D5A4A' }}>
              Loading chat rooms...
            </p>
          ) : chatRooms.length === 0 ? (
            <p className="text-sm text-gray-500">No chat rooms found.</p>
          ) : (
            chatRooms.map((room) => {
              const otherUser = getOtherUser(room);
              return (
                <div
                  key={room._id}
                  onClick={() => openChatRoom(room._id)}
                  className="chat-room-card"
                  style={{
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <div className="flex items-center">
                    <img
                      src={getProfilePicture(otherUser)}
                      alt={otherUser?.name || "User Avatar"}
                      onError={(e) => {
                        e.target.src = defaultProfileImg;
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginRight: '12px'
                      }}
                    />
                    <span>{room.project?.title || otherUser?.name || "Untitled Project"}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="flex flex-col flex-1" style={{ minHeight: 0 }}>
          {/* Content container: messages + input */}
          <div className="chat-content-container" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div className="chat-messages" style={{ flex: 1, overflowY: "auto" }}>
              {loading && messages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#4D5A4A'
                }}>
                  Loading messages...
                </div>
              ) : (
                messages.map((msg) => {
                  const senderId = msg.senderId?._id || msg.senderId;
                  const isSender = senderId?.toString() === userId;
                  const hasText = msg.text && msg.text.trim();
                  const hasAttachments = msg.attachments && msg.attachments.length > 0;
                  const isImageOnly = !hasText && hasAttachments;

                  return (
                    <div
                      key={msg._id}
                      className={`chat-message ${isSender ? "sender" : "receiver"} ${isImageOnly ? "image-only" : ""}`}
                      style={isImageOnly ? {
                        background: 'none',
                        padding: '4px',
                        margin: isSender ? '4px 0 4px auto' : '4px auto 4px 0',
                        maxWidth: 'fit-content'
                      } : {}}
                    >
                      {hasText && <div>{msg.text}</div>}
                      {msg.attachments?.map((imgUrl, idx) => (
                        <div key={idx} className="chat-image-wrapper">
                          <img
                            src={`https://localhost:2005${imgUrl}`}
                            alt="attachment"
                            className="chat-image"
                            style={isImageOnly ? {
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            } : {}}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="chat-input-container">
              {images.length > 0 && (
                <div className="selected-image-preview">
                  {images.map((img, idx) => (
                    <div key={idx} className="thumbnail-container">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`preview-${idx}`}
                        className="chat-preview-thumbnail"
                      />
                      <button
                        className="remove-thumbnail"
                        onClick={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        disabled={loading}
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                          fontSize: '12px',
                          position: 'absolute',
                          top: '2px',
                          right: '2px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="chat-input">
                <button
                  type="button"
                  className="upload-icon"
                  onClick={() => document.getElementById("image-upload").click()}
                  disabled={loading}
                  style={{
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: '#4D5A4A',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px'
                  }}
                >
                  <IoMdImages />
                </button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setImages((prev) => [...prev, ...Array.from(e.target.files)])
                  }
                  style={{ display: "none" }}
                  disabled={loading}
                />

                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || (!text.trim() && images.length === 0)}
                  style={{
                    opacity: loading || (!text.trim() && images.length === 0) ? 0.6 : 1,
                    cursor: loading || (!text.trim() && images.length === 0) ? 'not-allowed' : 'pointer',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: '#4D5A4A',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px'
                  }}
                >
                  {loading ? '⏳' : <TbSend2 />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}