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
          <div class="header-button-container">
              <button class="header-button">SET WORKING DIRECTORY</button>
              <button class="header-button">SET API KEY</button>
              <button class="header-button">SAVE CONTEXT</button>
              <button class="header-button">LOAD CONTEXT</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div id="left">
            <textarea class="text-field" placeholder="/files/for/context:              IE: '/dir/.../file.filetype' OR PUT FILE PATHS IN '.pk-context'. PARAKEET CONSIDERS ANY '.md' FILES AS CONTEXT. YOU CAN ALSO WRITE '*.filetype' TO USE ALL '.filetype' AS CONTEXT. FULL CONTEXT (FILE READING) IS ONLY PROCESSED UPON [CONTEXTUALIZE]."></textarea>
            <textarea class="text-field" placeholder="/files/to/ignore:               IE: '/dir/.../file.filetype' OR PUT FILE PATHS IN         '.pk-ignore'. '.env' FILES ARE IGNORED BY DEFAULT.  YOU CAN 1. WRITE '*.filetype' TO IGNORE ALL '.filetype' FILES. 2. USE '/directory/*' TO IGNORE ALL FILES IN '/directory'. (THESE CAN BE USEFUL TO SPEED RESPONSES UP)."></textarea>
        </div>
        <div id="right">
            <div className="buttons">
              <button>CONTEXTUALIZE</button>
              <button>CLEAR CHANGE LOG</button>
              <button onClick={handleUpdateMemory}>UPDATE CONTEXT FROM CHANGE LOG</button>
            </div>
            <ChatWindow />
        </div>
      </main>
    </div>
  );
}

export default App;
