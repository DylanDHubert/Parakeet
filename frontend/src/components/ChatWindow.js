import React, { useState, useEffect } from "react";

const ChatWindow = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  // FETCH GLOBAL CHAT LOG FROM SERVER
  const fetchChatLog = async () => {
    try {
      const response = await fetch("http://localhost:5000/chat-log");
      const data = await response.json();
      setChatLog(data); // UPDATE CHAT LOG STATE
    } catch (error) {
      console.error("Error fetching chat log:", error);
    }
  };

  // SEND MESSAGE TO SERVER
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      // REFRESH CHAT LOG AFTER SENDING A MESSAGE
      await fetchChatLog();
    } catch (error) {
      console.error("Error communicating with the server:", error);
    }

    setMessage(""); // CLEAR INPUT BOX
  };

  // FETCH CHAT LOG ON INITIAL RENDER
  useEffect(() => {
    fetchChatLog();
  }, []);

  // AUTO SCROLL TO BOTTOM WHEN CHAT LOG UPDATES
  useEffect(() => {
    const chatLogDiv = document.getElementById("chat-log");
    if (chatLogDiv) {
      chatLogDiv.scrollTop = chatLogDiv.scrollHeight;
    }
  }, [chatLog]);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div
        id="chat-log"
        style={{
          height: "400px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {chatLog.map((entry, index) => (
          <div
            key={index}
            style={{
              textAlign: entry.role === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <b>{entry.role === "user" ? "You" : "Assistant"}:</b>{" "}
            <span>{entry.parts}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        style={{
          width: "80%",
          padding: "10px",
          marginRight: "10px",
          border: "1px solid #ccc",
          borderRadius: "0px",
        }}
      />
      <button
        onClick={sendMessage}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "0px",
        }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatWindow;
