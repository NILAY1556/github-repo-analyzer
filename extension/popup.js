console.log("Popup script loaded!");

document.addEventListener("DOMContentLoaded", () => {
    const repoDetailsDiv = document.getElementById("repo-details");
    const modelSelect = document.getElementById("model-select");
    const analyzeButton = document.getElementById("analyze-button");
    const chatButton = document.getElementById("chat-button");
    const analysisArea = document.getElementById("analysis-area");
    const analysisOutput = document.getElementById("analysis-output");
    const chatArea = document.getElementById("chat-area");
    const chatHistory = document.getElementById("chat-history");
    const chatInput = document.getElementById("chat-input");
    const sendChatButton = document.getElementById("send-chat-button");

    let repoContextForChat = "";

    // Event listener for "Analyze Repo" button
    analyzeButton.addEventListener("click", async () => {
        analysisArea.style.display = "block";
        chatArea.style.display = "none";
        analysisOutput.textContent = "Analyzing repository...";
        const repoFullName = repoDetailsDiv.querySelector('h3')?.textContent;
        const selectedModel = modelSelect.value;
        const analysis = await analyzeRepository(repoFullName, selectedModel);
        analysisOutput.textContent = analysis;
    });

    // Event listener for "Chat with Repo" button
    chatButton.addEventListener("click", () => {
        chatArea.style.display = "block";
        analysisArea.style.display = "none";
    });

    // Event listener for "Send" chat message
    sendChatButton.addEventListener("click", async () => {
        const message = chatInput.value.trim();
        if (message) {
            const repoFullName = repoDetailsDiv.querySelector('h3')?.textContent;
            const selectedModel = modelSelect.value;
            appendMessage("user", message);
            chatInput.value = "";
            const response = await sendMessageToChatbot(message, repoFullName, selectedModel);
            appendMessage("assistant", response);
        }
    });

    async function analyzeRepository(repoFullName, selectedModel) {
        try {
            const response = await fetch("http://localhost:8000/analyze_repo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo_full_name: repoFullName, selected_model: selectedModel }),
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

    async function sendMessageToChatbot(message, repoFullName, selectedModel) {
        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message, repo_full_name: repoFullName, selected_model: selectedModel }),
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
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

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