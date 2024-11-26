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

  const handleClear = async () => {
        fetch("http://localhost:5000/clear", {
        method: "GET",
      });
  }

  const populateConsole = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-change-log", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          document.getElementById("console").textContent = data.text || "COLD START OR PASSED TO MODEL";
          document.getElementById("console").scrollTop =  document.getElementById("console").scrollHeight;
        } else {
          console.error("Failed to fetch data:", response.status);
          document.getElementById("console").textContent = "Error loading data.";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("console").textContent = "Error fetching data.";
      }
    };

    // Call the function
    setInterval(populateConsole, 5000);



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
          <div>
            Context is a two part system allowing Parakeet to be automatically up to date on a file system.
          </div>
          <div>
            1. Files in '.pk-context' are automatically scanned (in their entirety) by Parakeet on a per-prompt basis.
          </div>
          <div>
          2. Parakeet scans updates, creations, and deletions of all files within the project directory.
          It logs these changes. This log can be fed to the model via [UPDATE CONTEXT FROM CHANGE LOG]
            or, can be cleared via [CLEAR CHANGE LOG]
          </div>
          <p>IGNORE FILES: (.pk-ignore)</p>
          <textarea
            id="ignore"
            value={ignoreContent}
            readOnly
          />
          <div>
          The Ignore system (.pk-ignore) is like .gitignore, excluding sensitive or unimportant data from the model. Files listed are scanned for changes but never fed into the model, reducing clutter and protecting sensitive information.
          </div>
        </div>
        <div id="right">
          <div className="buttons">
            <button onClick={handleClear}>CLEAR CHANGE LOG</button>
            <button onClick={handleUpdateMemory}>UPDATE CONTEXT FROM CHANGE LOG</button>
          </div>
          <ChatWindow />
        </div>
      </main>
      <div id="bottom">
        <div id="console"></div>
      </div>
    </div>
  );
}

export default App;
