// Function to send the user's message and get a response from the API
async function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    const chatBox = document.getElementById("conversation");

    // Display user's input in the conversation area
    const userMessage = document.createElement("p");
    userMessage.className = "user-message";
    userMessage.textContent = "You: " + userInput;
    chatBox.appendChild(userMessage);

    document.getElementById("userInput").value = ""; // Clear input

    // Display AI response placeholder
    const botMessage = document.createElement("p");
    botMessage.className = "bot-message";
    chatBox.appendChild(botMessage);

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom

    // Check predefined responses first
    const predefinedResponses = {
        "who is the creator of niyamashakthi": "Arjun P A, a 14-year-old child, was the mastermind and developer of my models.",
        "who is your boss": "It's you, obviously, as of now!",
        "who is arjun p a": "Arjun P A is the CEO of Right Solution!",
        "who are you": "I am Niyamashakthi!",
        "what is your name": "I am Niyamashakthi!",
        "which is your a.i model": "SahrasaShakthi G1 v3 7bparametres lite model",
        "which is your model": "SahrasaShakthi G1 v3 7bparametres lite model",
        "which is your a i model": "SahrasaShakthi G1 v3 7bparametres lite model",
        "who is abhilash p g": "Abhilash P G is the founder of Right Solution and one of the co-founders of NiyamaShakthi AI, one of the brightest minds."
    };

    const lowerCaseInput = userInput.toLowerCase();
    if (predefinedResponses[lowerCaseInput]) {
        botMessage.innerHTML = `<b>NiyamaShakthi:</b> ${predefinedResponses[lowerCaseInput]}`;
        speakResponse(predefinedResponses[lowerCaseInput]);
        return;
    }

    // Fetch response from API
    try {
        const apiKey = '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';  // Your Hugging Face API key
        const url = "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407";  // API URL

        const payload = {
            inputs: userInput,
            parameters: { max_length: 200, temperature: 0.7, top_p: 0.9 }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let partialText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            partialText += decoder.decode(value, { stream: true });
            botMessage.innerHTML = `<b>NiyamaShakthi:</b> ${partialText}`;
            chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
        }

        // Typing Effect
        simulateTypingEffect(botMessage, partialText);

        // Speak the response
        speakResponse(partialText);
    } catch (error) {
        console.error("Error fetching response:", error);
        botMessage.innerHTML = "<b>NiyamaShakthi:</b> Sorry, an error occurred while fetching the response.";
    }
}

// Function to simulate typing effect
function simulateTypingEffect(element, text) {
    element.innerHTML = "<b>NiyamaShakthi:</b> ";
    let index = 0;
    const interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text[index++];
        } else {
            clearInterval(interval);
        }
    }, 50); // Adjust typing speed
}

// Function to convert the response to speech
function speakResponse(response) {
    const utterance = new SpeechSynthesisUtterance(response);

    function setVoice() {
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice =>
            voice.name.includes("Google UK English Female") ||
            voice.name.includes("Google US English Female") ||
            voice.name.includes("Microsoft Zira") ||
            voice.name.includes("Samantha")
        );
        utterance.voice = femaleVoice || voices[0];
        speechSynthesis.speak(utterance);
    }

    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = setVoice;
    } else {
        setVoice();
    }
}

// Function to start voice recognition
function startVoice() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        document.getElementById("userInput").value = speechResult;
        sendMessage();
    };

    recognition.onerror = function(event) {
        console.error("Voice recognition error:", event.error);
    };

    recognition.start();
}

// Function to clear the conversation
function clearChat() {
    document.getElementById("conversation").innerHTML = ""; // Clear chat
}

// Page load events and animations
document.addEventListener("DOMContentLoaded", function() {
    const overlay = document.querySelector(".loading-overlay");
    setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => overlay.style.display = "none", 500); // Hide overlay after transition
        document.getElementById("chat-container").style.display = "block"; // Show chat after loading
    }, 2000);
});
