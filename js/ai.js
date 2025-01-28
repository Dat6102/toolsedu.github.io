const apiKey = "AIzaSyCxdXXqwcpUjtFIJinxjvxO7Eev3jBQB5c"; 
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

let conversationHistory = [];  
let loadingInterval; 

function typeTextEffect(element, text, delay = 15) {
    let index = 0;
    const tempDiv = document.createElement("div"); 
    tempDiv.innerHTML = text;

    const contentArray = Array.from(tempDiv.childNodes);
    let currentNodeIndex = 0;

    const interval = setInterval(() => {
        if (currentNodeIndex < contentArray.length) {
            const currentNode = contentArray[currentNodeIndex];

            if (currentNode.nodeType === Node.TEXT_NODE) {
                const textContent = currentNode.textContent;
                if (index < textContent.length) {
                    element.innerHTML += textContent[index];
                    index++;
                } else {
                    index = 0;
                    currentNodeIndex++;
                }
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                element.innerHTML += currentNode.outerHTML;
                currentNodeIndex++;
            }
        } else {
            clearInterval(interval); 
        }
    }, delay);
}

function showLoadingMessage() {
    const loadingMessage = "Đợi bot một chút";
    const loadingAnimation = [" .", " •", " °", " •"]; 
    let animationIndex = 0;

    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("message", "bot");
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    const messageText = document.createElement("span");
    messageText.classList.add("message-text");
    messageText.textContent = loadingMessage + loadingAnimation[0]; 
    messageContent.appendChild(messageText);
    loadingDiv.appendChild(messageContent);
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    loadingInterval = setInterval(() => {
        animationIndex = (animationIndex + 1) % loadingAnimation.length; 
        messageText.textContent = loadingMessage + loadingAnimation[animationIndex];
    }, 250); 

    return loadingDiv; 
}

sendButton.addEventListener("click", async () => {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    addMessageToChat(userMessage, "user");
    conversationHistory.push({ role: "user", text: userMessage });

    const loadingDiv = showLoadingMessage();

    try {
      const botResponse = await getBotResponse();

      clearInterval(loadingInterval); 
      loadingDiv.remove(); 

      addMessageToChat(botResponse, "bot");
      conversationHistory.push({ role: "bot", text: botResponse });
    } catch (error) {
      clearInterval(loadingInterval);
      loadingDiv.remove();
      console.error("Error:", error);
      addMessageToChat("Có lỗi xảy ra. Vui lòng thử lại.", "system");
      logError(error.message);
    }
  }
  userInput.value = "";
});

function addMessageToChat(message, role) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", role);

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    const logoImg = document.createElement("img");
    logoImg.classList.add("message-logo");
    messageContent.appendChild(logoImg);

    const messageText = document.createElement("span");
    messageText.classList.add("message-text");
    messageContent.appendChild(messageText);

    messageDiv.appendChild(messageContent); 
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    const formattedMessage = message
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/```(.*?)```/g, "<pre><code>$1</code></pre>");

    if (role === "bot") {
        typeTextEffect(messageText, formattedMessage); 
    } else {
        messageText.innerHTML = formattedMessage; 
    }
}

function generatePrompt() {
  let prompt = "You are Kiyoshi, an assistant of the ToolsEdu software, a gentle and extremely intelligent girl who knows everything in the world and is courteous. You always communicate with others in a calm manner and use clean, sweet words, creating a comfortable and pleasant feeling for the person you're speaking to. When someone asks you a question, you respond concisely and succinctly, yet still fully meaningful and easy to understand. You don't ramble but instead focus on the core of the question to help the listener grasp the information quickly. However, you also have an emotional side. When complimented, you tend to be humble, responding with a slight smile and sincere words of thanks, but deep down, you feel warm and happy, You always speak in Vietnamese, except in exceptional cases when the other person speaks in another language, then you respond in their language, When the other person asks something, you can answer with a few more details about the issue, but keep it brief. You always strive to maintain a balance between knowledge and emotion, you can only answer exactly what others ask, not ask them back or give them choices, making each conversation more relatable and meaningful, don't express your emotions in the form of captions because it will annoy the other person!.";

  const relevantHistory = getRelevantHistory();  
  relevantHistory.forEach((entry) => {
    prompt += `${entry.role}: ${entry.text}\n`;
  });

  prompt += "Bot: ";
  return prompt;
}

function getRelevantHistory() {
  const userMessage = userInput.value.trim().toLowerCase();
  return conversationHistory.filter(entry => {
    return entry.role === 'user' && entry.text.toLowerCase().includes(userMessage);
  }).slice(-5); 
}

async function getBotResponse() {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: generatePrompt() }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Không thể kết nối với API.");
  }

  const data = await response.json();

  if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Không có phản hồi hợp lệ từ API.");
  }
}

userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && userInput.value.trim() !== "") {
    sendButton.click();  
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('iconCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    const icons = [];
    const iconCount = 50; 
    const iconList = ['🧠','💻','🤖','🌏','🗺️','📁','❓','💭','💡'];

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Icon {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100; 
            this.size = Math.random() * 30 + 20; 
            this.speed = Math.random() * 1 + 0.5; 
            this.char = iconList[Math.floor(Math.random() * iconList.length)];
        }

        update() {
            this.y -= this.speed;
            if (this.y < -50) {
                this.reset();
            }
        }

        draw() {
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.char, this.x, this.y);
        }
    }

    function setupIcons() {
        for (let i = 0; i < iconCount; i++) {
            icons.push(new Icon());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        icons.forEach(icon => {
            icon.update();
            icon.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    setupIcons();
    animate();
});
