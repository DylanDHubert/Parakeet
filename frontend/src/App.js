import React, { useState, useEffect } from "react";
import "./App.css";
import ChatWindow from "./components/ChatWindow";
import logo from "./static/logo.png";

function App() {
  const [ignoreContent, setIgnoreContent] = useState("Loading ignore list...");
  const [contextContent, setContextContent] = useState("Loading context list...");

    const fetchIgnoreFiles = async () => {
      try {
        const response = await fetch("http://localhost:5000/ignore", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setIgnoreContent(data.ignore_list.join("\n") || ".pk-ignore excludes sensitive or unnecessary data from Parakeet. Files listed are monitored for changes but never included in the model, minimizing clutter and safeguarding secrets.\n\nCreate a '.pk-ignore' file in the root directory and add files.");
        } else {
          console.error("Failed to fetch ignore files:", response.status);
          setIgnoreContent("Error loading ignore files.");
        }
      } catch (error) {
        console.error("Error fetching ignore files:", error);
        setIgnoreContent("Error fetching ignore files.");
      }
    };

    useEffect(() => {
      const intervalId = setInterval(fetchIgnoreFiles, 5000);
      return () => clearInterval(intervalId); // CLEANUP
    }, []); // EMPTY DEPENDENCY ARRAY

    const fetchContextFiles = async () => {
      try {
        const response = await fetch("http://localhost:5000/context", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setContextContent(
            data.context_list.join("\n") || "Context for Parakeet ensures automatic synchronization:\n\n1. Files in .pk-context are fully scanned by Parakeet per prompt.\n\n2. Project directory changes (updates, creations, deletions) are logged.\n\nCreate a '.pk-context' file in the root directory and add context files."
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

    useEffect(() => {
      const intervalId = setInterval(fetchContextFiles, 5000);
      return () => clearInterval(intervalId); // CLEANUP
    }, []); // EMPTY DEPENDENCY ARRAY

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

  const HandleClearLog = async () => {
        fetch("http://localhost:5000/clear-change-log", {
        method: "GET",
      });
      refreshPage();
   };

  const HandleClearChat = async () => {
        fetch("http://localhost:5000/clear-chat-log", {
        method: "GET",
      });
      refreshPage();
  };

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
          document.getElementById("console").textContent = "ERROR LOADING DATA.";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById("console").textContent = "ERROR FETCHING DATA.";
      }
    };

    // Call the function
    useEffect(() => {
      const intervalId = setInterval(populateConsole, 5000);
      return () => clearInterval(intervalId); // CLEANUP
    }, []); // EMPTY DEPENDENCY ARRAY


  const populateAPIKey = async () => {
        try {
            const response = await fetch("http://localhost:5000/api-key", {
                method: "GET",
            });
            if (response.ok) {
                const data = await response.json();
                document.getElementById("apikey").textContent = data.text || "CREATE FILE '.pk-key' AND PASTE GOOGLE GEMINI API KEY";
            }
            else {
                console.error("Failed to fetch data:", response.status);
                document.getElementById("apikey").textContent = "ERROR LOADING API KEY";
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            document.getElementById("console").textContent = "ERROR FETCHING DATA.";
        }
  };
  useEffect(() => {
      const intervalId = setInterval(populateAPIKey, 5000);
      return () => clearInterval(intervalId); // CLEANUP
    }, []);

  const refreshPage = async () => {
        try {
            populateAPIKey();
            populateConsole();
            fetchContextFiles();
            fetchIgnoreFiles();
        } catch { }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <img src={logo} alt="Parakeet Logo" className="logo" />
          <div className="header-text">
            <h1>Parakeet!</h1>
            <p>Auto–Synchronized Coding Assistant</p>
            <p id="version"><strong>0.2.0 ALPHA</strong></p>
          </div>
          <div className="header-button-container">
            <p><strong>API KEY:</strong></p>
            <p id="apikey"></p>
            <button id="refresh" onClick={refreshPage}>REFRESH ↻ PAGE</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div id="left">
          <p>CONTEXT FILES:</p>
          <textarea
            id="context"
            value={contextContent}
            readOnly
          />
          <p>IGNORE FILES:</p>
          <textarea
            id="ignore"
            value={ignoreContent}
            readOnly
          />
        </div>
        <div id="right">
          <div className="buttons">
            <button onClick={HandleClearChat}>CLEAR CHAT LOG</button>
            <button onClick={HandleClearLog}>CLEAR CHANGE LOG</button>
            <button onClick={handleUpdateMemory}>UPDATE CONTEXT FROM CHANGE LOG</button>
          </div>
          <ChatWindow id="chat-window"/>
        </div>
      </main>
      <div id="bottom">
        <div id="console"></div>
      </div>
    </div>
  );
}

export default App;
