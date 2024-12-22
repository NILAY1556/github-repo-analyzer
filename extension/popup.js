console.log("Popup script loaded!");

document.addEventListener("DOMContentLoaded", () => {
    const repoDetailsDiv = document.getElementById("repo-details");
    const analyzeButton = document.getElementById("analyze-button");
    const chatButton = document.getElementById("chat-button");
    const analysisArea = document.getElementById("analysis-area");
    const analysisOutput = document.getElementById("analysis-output");
    const chatArea = document.getElementById("chat-area");
    const chatHistory = document.getElementById("chat-history");
    const chatInput = document.getElementById("chat-input");
    const sendChatButton = document.getElementById("send-chat-button");

    let repoContextForChat = ""; // We'll store relevant context here for chat

    // Event listener for "Analyze Repo" button
    analyzeButton.addEventListener("click", async () => {
        analysisArea.style.display = "block";
        chatArea.style.display = "none";
        analysisOutput.textContent = "Analyzing repository...";
        const repoFullName = repoDetailsDiv.querySelector('h3')?.textContent;
        const analysis = await analyzeRepository(repoFullName);
        analysisOutput.textContent = analysis;
    });

    // Event listener for "Chat with Repo" button
    chatButton.addEventListener("click", () => {
        chatArea.style.display = "block";
        analysisArea.style.display = "none";
        // Potentially fetch and prepare initial context here if needed
    });

    // Event listener for "Send" chat message
    sendChatButton.addEventListener("click", async () => {
        const message = chatInput.value.trim();
        if (message) {
            const repoFullName = repoDetailsDiv.querySelector('h3')?.textContent;
            appendMessage("user", message);
            chatInput.value = "";
            const response = await sendMessageToChatbot(message, repoFullName);
            appendMessage("assistant", response);
        }
    });

    async function analyzeRepository(repoFullName) {
        try {
            const response = await fetch("http://localhost:8000/analyze_repo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo_full_name: repoFullName }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Backend Error: ${response.status} - ${errorData.detail}`);
            }
            const data = await response.json();
            return data.analysis;
        } catch (error) {
            console.error("Error analyzing repository:", error);
            return "Error during repository analysis.";
        }
    }

    async function sendMessageToChatbot(message, repoFullName) {
        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message, repo_full_name: repoFullName }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Backend Error: ${response.status} - ${errorData.detail}`);
            }
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Error sending message to chatbot:", error);
            return "Error communicating with the chatbot.";
        }
    }

    function appendMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = `${sender}: ${message}`;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
    }

    // Existing listener for repo details
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "repoDetails") {
            console.log("Received repo details:", message.payload);
            displayRepoDetails(message.payload);
        }
    });

    function displayRepoDetails(details) {
        repoDetailsDiv.innerHTML = `<h3>${details.full_name}</h3><p>${details.description || "No description provided."}</p>`;
    }
});





// console.log("Popup script loaded!");

// document.addEventListener("DOMContentLoaded", () => {
//   const analysisResultsDiv = document.getElementById("analysis-results");

//   // Listen for repo details
//   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "repoDetails") {
//       console.log("Received repo details:", message.payload);
//       displayRepoDetails(message.payload);
//     } else if (message.action === "repoFileStructure") {
//       console.log("Received repo file structure:", message.payload);
//       displayFileStructure(message.payload);
//     }
//   });

//   // Function to display repository details in the popup
//   function displayRepoDetails(details) {
//     analysisResultsDiv.innerHTML = `
//       <h3>${details.full_name}</h3>
//       <p>${details.description || "No description provided."}</p>
//       <p><strong>Stars:</strong> ${details.stargazers_count}</p>
//       <p><strong>Forks:</strong> ${details.forks_count}</p>
//       <p><strong>Language:</strong> ${details.language || "Not specified"}</p>
//       <h4>File Structure:</h4>
//       <ul id="file-list"></ul>
//     `;
//   }

//   // Function to display the file structure
//   function displayFileStructure(fileStructure) {
//     const fileListUl = document.getElementById("file-list");
//     fileListUl.innerHTML = ""; // Clear previous list

//     // Limit the number of files displayed for brevity
//     const maxFilesToShow = 10;
//     const filesToShow = fileStructure.slice(0, maxFilesToShow);

//     filesToShow.forEach((item) => {
//       const listItem = document.createElement("li");
//       listItem.textContent = item.path;
//       fileListUl.appendChild(listItem);
//     });

//     if (fileStructure.length > maxFilesToShow) {
//       const moreItem = document.createElement("li");
//       moreItem.textContent = `... and ${
//         fileStructure.length - maxFilesToShow
//       } more files.`;
//       fileListUl.appendChild(moreItem);
//     }
//   }
// });
