import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const ChatWindow = () => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);

  const fetchChatLog = async () => {
    try {
      const response = await fetch("http://localhost:5000/chat-log");
      const data = await response.json();
      const filteredData = data.filter(
        (entry) => !(entry.role === "user" && entry.parts.endsWith("<FOR FRONTEND: DO NOT DISPLAY>"))
      );
      setChatLog(filteredData);
    } catch (error) {
      console.error("Error fetching chat log:", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      await fetchChatLog();
    } catch (error) {
      console.error("Error communicating with the server:", error);
    }
    setMessage("");
  };

  useEffect(() => {
    fetchChatLog();
  }, []);

  useEffect(() => {
    const chatLogDiv = document.getElementById("chat-log");
    if (chatLogDiv) {
      chatLogDiv.scrollTop = chatLogDiv.scrollHeight;
    }
  }, [chatLog]);

  return (
    <div style={{ maxWidth: "100vw", margin: "0 auto", padding: "20px" }}>
      <div
        id="chat-log"
        style={{
          height: "50vh",
          overflowY: "scroll",
          border: "1px solid",
          borderRadius: "4px",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        {chatLog.map((entry, index) => (
          <div
            key={index}
            style={{
              textAlign: entry.role === "user" ? "right" : "left",
              margin: "5px 5px",
            }}
          >
            <b>{entry.role === "user" ? "You" : "Assistant"}:</b>{" "}
            <ReactMarkdown>{entry.parts}</ReactMarkdown>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="TYPE YOUR MESSAGE HERE... (RESPONSE CAN BE SLOW)"
        style={{
          width: "75%",
          padding: "10px",
          marginRight: "20px",
          border: "1px solid",
          borderRadius: "4px",
          fontFamily: "courier new, monospace",
          fontSize: "15px",
        }}
      />
      <button
        onClick={sendMessage}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        SEND
      </button>
    </div>
  );
};

export default ChatWindow;
