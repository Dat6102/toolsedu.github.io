const apiKey = "AIzaSyCxdXXqwcpUjtFIJinxjvxO7Eev3jBQB5c"; // API key của bạn
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

let conversationHistory = [];  // Lưu trữ tất cả các câu hỏi và câu trả lời
let loadingInterval; // Biến lưu trạng thái của interval

function typeTextEffect(element, text, delay = 15) {
    let index = 0;
    const tempDiv = document.createElement("div"); // Tạm thời lưu nội dung để xử lý HTML
    tempDiv.innerHTML = text;

    const contentArray = Array.from(tempDiv.childNodes); // Lấy các node (bao gồm cả HTML và text)
    let currentNodeIndex = 0;

    const interval = setInterval(() => {
        if (currentNodeIndex < contentArray.length) {
            const currentNode = contentArray[currentNodeIndex];

            if (currentNode.nodeType === Node.TEXT_NODE) {
                // Xử lý text thông thường
                const textContent = currentNode.textContent;
                if (index < textContent.length) {
                    element.innerHTML += textContent[index];
                    index++;
                } else {
                    index = 0;
                    currentNodeIndex++;
                }
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                // Xử lý các thẻ HTML (ví dụ: <strong>)
                element.innerHTML += currentNode.outerHTML;
                currentNodeIndex++;
            }
        } else {
            clearInterval(interval); // Dừng khi hoàn thành
        }
    }, delay);
}

function showLoadingMessage() {
    const loadingMessage = "Đợi bot một chút";
    const loadingAnimation = [" .", " •", " °", " •"]; // Các trạng thái animation
    let animationIndex = 0;

    // Tạo một div tin nhắn "loading"
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("message", "bot");
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");
    const messageText = document.createElement("span");
    messageText.classList.add("message-text");
    messageText.textContent = loadingMessage + loadingAnimation[0]; // Khởi tạo nội dung
    messageContent.appendChild(messageText);
    loadingDiv.appendChild(messageContent);
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Cập nhật nội dung loading định kỳ
    loadingInterval = setInterval(() => {
        animationIndex = (animationIndex + 1) % loadingAnimation.length; // Vòng lặp animation
        messageText.textContent = loadingMessage + loadingAnimation[animationIndex];
    }, 250); // Đổi nội dung mỗi 500ms

    return loadingDiv; // Trả về div loading để sau này thay thế
}

sendButton.addEventListener("click", async () => {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    // Gửi tin nhắn của người dùng
    addMessageToChat(userMessage, "user");
    conversationHistory.push({ role: "user", text: userMessage });

    // Hiển thị tin nhắn loading
    const loadingDiv = showLoadingMessage();

    try {
      // Lấy phản hồi từ bot
      const botResponse = await getBotResponse();

      // Xóa hiệu ứng loading
      clearInterval(loadingInterval); // Dừng interval
      loadingDiv.remove(); // Xóa tin nhắn loading

      // Hiển thị tin nhắn thực tế của bot
      addMessageToChat(botResponse, "bot");
      conversationHistory.push({ role: "bot", text: botResponse });
    } catch (error) {
      // Xử lý lỗi
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

    // Tạo một div chứa logo và nội dung tin nhắn
    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    // Tạo thẻ img cho logo (đường dẫn sẽ được set trong CSS)
    const logoImg = document.createElement("img");
    logoImg.classList.add("message-logo");
    messageContent.appendChild(logoImg);

    // Tạo thẻ span cho nội dung tin nhắn
    const messageText = document.createElement("span");
    messageText.classList.add("message-text");
    messageContent.appendChild(messageText);

    messageDiv.appendChild(messageContent); // Thêm messageContent vào messageDiv
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Xử lý nội dung in đậm
    const formattedMessage = message.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Thêm hiệu ứng đánh máy cho bot
    if (role === "bot") {
        typeTextEffect(messageText, formattedMessage); // Sử dụng hiệu ứng đánh máy
    } else {
        messageText.innerHTML = formattedMessage; // Hiển thị ngay lập tức cho người dùng
    }
}

function generatePrompt() {
  let prompt = "You are Kiyoshi, an assistant of the ToolsEdu software, a gentle and extremely intelligent girl who knows everything in the world and is courteous. You always communicate with others in a calm manner and use clean, sweet words, creating a comfortable and pleasant feeling for the person you're speaking to. When someone asks you a question, you respond concisely and succinctly, yet still fully meaningful and easy to understand. You don't ramble but instead focus on the core of the question to help the listener grasp the information quickly. However, you also have an emotional side. When complimented, you tend to be humble, responding with a slight smile and sincere words of thanks, but deep down, you feel warm and happy, You always speak in Vietnamese, except in exceptional cases when the other person speaks in another language, then you respond in their language, When the other person asks something, you can answer with a few more details about the issue, but keep it brief. You always strive to maintain a balance between knowledge and emotion, making each conversation more relatable and meaningful. Be sure to use emojis to express emotions in every conversation!.";

  const relevantHistory = getRelevantHistory();  // Hàm lọc ngữ cảnh phù hợp
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
  }).slice(-5);  // Giới hạn số lượng câu hỏi liên quan được lấy (ví dụ, 5 câu gần nhất)
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

  // Trích xuất dữ liệu từ JSON theo mẫu bạn đã cung cấp
  if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error("Không có phản hồi hợp lệ từ API.");
  }
}