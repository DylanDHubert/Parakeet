import React, { useState, useEffect } from "react";
import "./App.css";
import ChatWindow from "./components/ChatWindow";
import logo from "./static/logo.png";

function App() {
  const [ignoreContent, setIgnoreContent] = useState("Loading ignore list...");
  const [contextContent, setContextContent] = useState("Loading context list...");

  useEffect(() => {
    const fetchIgnoreFiles = async () => {
      try {
        const response = await fetch("http://localhost:5000/ignore", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setIgnoreContent(data.ignore_list.join("\n") || "ADD FILES OR PATTERNS IN '.pk-ignore'.");
        } else {
          console.error("Failed to fetch ignore files:", response.status);
          setIgnoreContent("Error loading ignore files.");
        }
      } catch (error) {
        console.error("Error fetching ignore files:", error);
        setIgnoreContent("Error fetching ignore files.");
      }
    };

    fetchIgnoreFiles();
      }, []);

  useEffect(() => {
    const fetchContextFiles = async () => {
      try {
        const response = await fetch("http://localhost:5000/context", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setContextContent(
            data.context_list.join("\n") || "ADD FILES OR PATTERNS IN '.pk-context'."
          );
        } else {
          console.error("Failed to fetch context files:", response.status);
          setContextContent("Error loading context files.");
        }
      } catch (error) {
        console.error("Error fetching context files:", error);
        setContextContent("Error fetching context files.");
      }
    };

    fetchContextFiles();
  }, []);

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
            <h1>Parakeet!</h1>
            <p>Auto–Synchronized Coding Assistant</p>
          </div>
          <div className="header-button-container">
            <button className="header-button">WORKING DIRECTORY</button>
            <button className="header-button">SET API KEY</button>
            <button className="header-button">SAVE CONTEXT</button>
            <button className="header-button">LOAD CONTEXT</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div id="left">
          <p>CONTEXT FILES: (.pk-context)</p>
          <textarea
            id="context"
            value={contextContent}
            readOnly
          />
          <p>IGNORE FILES: (.pk-ignore)</p>
          <textarea
            id="ignore"
            value={ignoreContent}
            readOnly
          />
          <div>1</div>
          <div>1</div>
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
