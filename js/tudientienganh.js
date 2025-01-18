let loadingInterval; // Biến lưu interval để dừng hoạt ảnh sau này

async function lookupWord() {
    const searchInput = document.getElementById("searchInput").value.trim();
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = ""; // Xóa nội dung cũ

    // Hiển thị thông báo "Đang xử lý dữ liệu" với hoạt ảnh
    const loadingDiv = showLoadingMessage(resultDiv);

    if (searchInput === "") {
        resultDiv.innerHTML = "<p>Vui lòng nhập từ cần tra cứu!</p>";
        clearLoading(loadingDiv); // Dừng hoạt ảnh và xóa thông báo
        return;
    }

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(searchInput)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data)) {
            const wordData = data[0];
            const meanings = wordData.meanings;
            const vietnamesewordData = await translateText(wordData.word, 'vi');
            let resultHTML = `<h2>Kết quả:</h2>`;
            resultHTML += `<p><strong>Từ:</strong> ${wordData.word} : ${vietnamesewordData}</p>`;
            resultHTML += `<p><strong>Phiên âm:</strong> ${wordData.phonetic || 'Không có'}</p>`;

            for (const meaning of meanings) {
                const partOfSpeech = meaning.partOfSpeech;
                const definitions = meaning.definitions;
                const vietnamesepartOfSpeech = await translateText(partOfSpeech, 'vi');

                resultHTML += `<p><strong>Loại từ:</strong> ${partOfSpeech} : ${vietnamesepartOfSpeech}</p>`;

                if (definitions.length > 0) {
                    const firstDefinition = definitions[0];
                    if (firstDefinition.example) {
                        resultHTML += `<p><strong>Ví dụ:</strong> ${firstDefinition.example}</p>`;
                    }

                    const englishDefinition = firstDefinition.definition;
                    if (englishDefinition) {
                        const vietnameseDefinition = await translateText(englishDefinition, 'vi');
                        resultHTML += `<p><strong>Định nghĩa:</strong> ${vietnameseDefinition}</p>`;
                    }
                }
            }

            resultDiv.innerHTML = resultHTML;
        } else {
            resultDiv.innerHTML = "<p>Không tìm thấy từ này!</p>";
        }
    } catch (error) {
        console.error("Error:", error);
        resultDiv.innerHTML = "<p>Đã xảy ra lỗi. Vui lòng thử lại sau.</p>";
    } finally {
        clearLoading(loadingDiv); // Dừng hoạt ảnh và xóa thông báo
    }
}

function showLoadingMessage(container) {
    const loadingMessage = "Đang xử lý dữ liệu";
    const loadingAnimation = [" .", " •", " °", " •"]; // Các trạng thái hoạt ảnh
    let animationIndex = 0;

    // Tạo và hiển thị thông báo loading
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("loading");
    loadingDiv.textContent = loadingMessage + loadingAnimation[0]; // Khởi tạo nội dung
    container.appendChild(loadingDiv);

    // Cập nhật nội dung loading định kỳ
    loadingInterval = setInterval(() => {
        animationIndex = (animationIndex + 1) % loadingAnimation.length;
        loadingDiv.textContent = loadingMessage + loadingAnimation[animationIndex];
    }, 250); // Đổi trạng thái hoạt ảnh mỗi 250ms

    return loadingDiv; // Trả về div loading để sau này thay thế hoặc xóa
}

function clearLoading(loadingDiv) {
    clearInterval(loadingInterval); // Dừng hoạt ảnh
    if (loadingDiv && loadingDiv.parentNode) {
        loadingDiv.parentNode.removeChild(loadingDiv); // Xóa thông báo loading
    }
}

async function translateText(text, targetLanguage) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.responseData.translatedText;
}