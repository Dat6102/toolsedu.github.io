async function translateText(text, targetLanguage) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.responseData.translatedText;
}

async function lookupWord() {
    const searchInput = document.getElementById("searchInput").value.trim();
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = "";

    if (searchInput === "") {
        resultDiv.innerHTML = "<p>Vui lòng nhập từ cần tra cứu!</p>";
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

            // Chỉ hiển thị một định nghĩa và ví dụ cho mỗi loại từ
            for (const meaning of meanings) {
                const partOfSpeech = meaning.partOfSpeech;
                const definitions = meaning.definitions;
                const vietnamesepartOfSpeech = await translateText(partOfSpeech, 'vi');

                resultHTML += `<p><strong>Loại từ:</strong> ${partOfSpeech} : ${vietnamesepartOfSpeech}</p>`;

                if (definitions.length > 0) {
                    const firstDefinition = definitions[0]; // Chỉ lấy định nghĩa đầu tiên
                    if (firstDefinition.example) {
                        resultHTML += `<p><strong>Ví dụ:</strong> ${firstDefinition.example}</p>`;
                    }

                    // Dịch định nghĩa sang tiếng Việt
                    const englishDefinition = firstDefinition.definition; // Lấy định nghĩa tiếng Anh
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
        console.error('Error:', error);
        resultDiv.innerHTML = "<p>Đã xảy ra lỗi. Vui lòng thử lại sau.</p>";
    }
}