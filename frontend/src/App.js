import React from "react";
import "./App.css";
import ChatWindow from "./components/ChatWindow";
import logo from "./static/logo.png";

function App() {
  const handleUpdateMemory = async () => {
    try {
      const response = await fetch("http://localhost:5000/scan", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Server response:", data);
        alert("Memory updated successfully!");
      } else {
        console.error("Failed to update memory. Server responded with:", response.status);
        alert("Failed to update memory.");
      }
    } catch (error) {
      console.error("Error communicating with server:", error);
      alert("An error occurred while updating memory.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <img src={logo} alt="Parakeet Logo" className="logo" />
          <div className="header-text">
            <h1>"Parakeet"</h1>
            <p>Auto–Synchronized Coding Assistant</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div id="left">
            <div>top</div>
            <div>bottom</div>
        </div>
        <div id="right">
            <div className="buttons">
              <button>CLEAR LOG</button>
              <button onClick={handleUpdateMemory}>UPDATE MEMORY FROM LOG</button>
            </div>
            <ChatWindow />
        </div>
      </main>
    </div>
  );
}

export default App;
