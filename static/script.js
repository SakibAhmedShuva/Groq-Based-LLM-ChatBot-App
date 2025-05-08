// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const systemPromptInput = document.getElementById('system-prompt-input');
    const runButton = document.getElementById('run-button');
    const chatOutput = document.getElementById('chat-output');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    const welcomeMessage = document.querySelector('.welcome-message');
    const modelSelect = document.getElementById('model-select'); // Get model select dropdown
    const modelInfoDiv = document.getElementById('model-info');   // Get model info display div

    const API_URL = '/chat';

    // --- MODEL DATA ---
    const modelsData = [
        // Chat Models (prioritize these for the dropdown)
        { id: "llama3-8b-8192", group: "Chat", name: "Llama 3 (8B)", rpm: 30, rpd: 14400, tpm: 6000, tpd: "500,000" },
        { id: "llama3-70b-8192", group: "Chat", name: "Llama 3 (70B)", rpm: 30, rpd: 14400, tpm: 6000, tpd: "500,000" },
        { id: "gemma2-9b-it", group: "Chat", name: "Gemma 2 (9B Instruct)", rpm: 30, rpd: 14400, tpm: 15000, tpd: "500,000" },
        { id: "llama-3.1-8b-instant", group: "Chat", name: "Llama 3.1 (8B Instant)", rpm: 30, rpd: 14400, tpm: 6000, tpd: "500,000" },
        { id: "llama-3.3-70b-versatile", group: "Chat", name: "Llama 3.3 (70B Versatile)", rpm: 30, rpd: 1000, tpm: 12000, tpd: "100,000" },
        { id: "allam-2-7b", group: "Chat", name: "Allam-2 (7B)", rpm: 30, rpd: 7000, tpm: 6000, tpd: "(No limit)" },
        { id: "compound-beta", group: "Chat", name: "Compound Beta", rpm: 15, rpd: 200, tpm: 70000, tpd: "(No limit)" },
        { id: "compound-beta-mini", group: "Chat", name: "Compound Beta Mini", rpm: 15, rpd: 200, tpm: 70000, tpd: "(No limit)" },
        { id: "deepseek-r1-distill-llama-70b", group: "Chat", name: "DeepSeek R1 Distill Llama (70B)", rpm: 30, rpd: 1000, tpm: 6000, tpd: "(No limit)" },
        { id: "llama-guard-3-8b", group: "Chat", name: "Llama Guard 3 (8B)", rpm: 30, rpd: 14400, tpm: 15000, tpd: "500,000" },
        { id: "meta-llama/llama-4-maverick-17b-128e-instruct", group: "Chat", name: "Llama 4 Maverick (17B Instruct)", rpm: 30, rpd: 1000, tpm: 6000, tpd: "(No limit)" },
        { id: "meta-llama/llama-4-scout-17b-16e-instruct", group: "Chat", name: "Llama 4 Scout (17B Instruct)", rpm: 30, rpd: 1000, tpm: 30000, tpd: "(No limit)" },
        { id: "mistral-saba-24b", group: "Chat", name: "Mistral Saba (24B)", rpm: 30, rpd: 1000, tpm: 6000, tpd: "500,000" },
        { id: "qwen-qwq-32b", group: "Chat", name: "Qwen QWQ (32B)", rpm: 30, rpd: 1000, tpm: 6000, tpd: "(No limit)" },
        // Speech To Text Models (Not for this primary chat dropdown but kept for completeness if needed elsewhere)
        // { id: "distil-whisper-large-v3-en", group: "STT", name: "Distil Whisper Large v3 (EN)", rpm: 20, rpd: 2000, tpm: 7200, tpd: "28,800" },
        // { id: "whisper-large-v3", group: "STT", name: "Whisper Large v3", rpm: 20, rpd: 2000, tpm: 7200, tpd: "28,800" },
        // { id: "whisper-large-v3-turbo", group: "STT", name: "Whisper Large v3 Turbo", rpm: 20, rpd: 2000, tpm: 7200, tpd: "28,800" },
        // Text To Speech Models
        // { id: "playai-tts", group: "TTS", name: "PlayAI TTS", rpm: 10, rpd: 100, tpm: 1200, tpd: "3,600" },
        // { id: "playai-tts-arabic", group: "TTS", name: "PlayAI TTS (Arabic)", rpm: 10, rpd: 100, tpm: 1200, tpd: "3,600" }
    ];

    const chatModels = modelsData.filter(model => model.group === "Chat");
    let selectedModelId = chatModels.length > 0 ? chatModels[0].id : "llama3-8b-8192"; // Default to first chat model or a known good one

    function populateModelDropdown() {
        if (!modelSelect) return;
        modelSelect.innerHTML = ''; // Clear existing options
        chatModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name || model.id; // Use 'name' if available, else 'id'
            modelSelect.appendChild(option);
        });
        // Set default selection and trigger info update
        if (chatModels.length > 0) {
            modelSelect.value = selectedModelId;
            updateModelInfo(selectedModelId);
        }
    }

    function updateModelInfo(modelId) {
        if (!modelInfoDiv) return;
        const model = modelsData.find(m => m.id === modelId);
        if (model) {
            modelInfoDiv.innerHTML = `
                RPM: ${model.rpm} | RPD: ${model.rpd} <br>
                TPM: ${model.tpm} | TPD: ${model.tpd}
            `;
        } else {
            modelInfoDiv.textContent = 'Model information not available.';
        }
    }

    if (modelSelect) {
        modelSelect.addEventListener('change', (event) => {
            selectedModelId = event.target.value;
            updateModelInfo(selectedModelId);
        });
    }
    // --- END MODEL HANDLING ---

    // Auto-resize textareas
    [promptInput, systemPromptInput].forEach(textarea => {
        // ... (auto-resize logic - no change) ...
        if (textarea) {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            });
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
    });
    
    // Sync temperature slider
    // ... (temperature logic - no change) ...
    temperatureSlider.addEventListener('input', (e) => {
        temperatureValue.value = e.target.value;
    });
    temperatureValue.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0.7;
        if (val < 0) val = 0;
        if (val > 1) val = 1;
        temperatureSlider.value = val;
        temperatureValue.value = val.toFixed(1);
    });

    const addMessageToChat = (text, sender, type = 'text') => {
        // ... (addMessageToChat logic - no change) ...
        if (welcomeMessage && welcomeMessage.style.display !== 'none') {
            welcomeMessage.style.display = 'none';
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        if (type === 'error') {
            messageDiv.classList.add('error');
        } else if (type === 'loading') {
            messageDiv.classList.add('loading');
        }
        messageDiv.textContent = text;
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
        return messageDiv;
    };

    const handleRunPrompt = async () => {
        const userPromptText = promptInput.value.trim();
        const systemPromptText = systemPromptInput.value.trim();
        const currentTemperature = parseFloat(temperatureSlider.value);

        if (!userPromptText) return;

        addMessageToChat(userPromptText, 'user');
        promptInput.value = '';
        promptInput.style.height = 'auto';
        runButton.disabled = true;

        const loadingMessage = addMessageToChat('AI is thinking...', 'ai', 'loading');

        const payload = {
            prompt: userPromptText,
            system_prompt: systemPromptText,
            temperature: currentTemperature,
            model_id: selectedModelId // <<< ADDED: Send selected model ID
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            // ... (rest of try-catch-finally - no change, except for model_id in payload) ...
            if (chatOutput.contains(loadingMessage)) {
                chatOutput.removeChild(loadingMessage);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "The server returned an error, but the error message could not be parsed." }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            addMessageToChat(data.response, 'ai');

        } catch (error) {
            console.error('Error:', error);
            if (loadingMessage && chatOutput.contains(loadingMessage)) {
                 chatOutput.removeChild(loadingMessage);
            }
            addMessageToChat(`Error: ${error.message}`, 'ai', 'error');
        } finally {
            runButton.disabled = false;
        }
    };

    runButton.addEventListener('click', handleRunPrompt);
    promptInput.addEventListener('keydown', (event) => {
        // ... (keydown logic - no change) ...
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            handleRunPrompt();
        }
    });
    suggestionButtons.forEach(button => {
        // ... (suggestion button logic - no change) ...
        button.addEventListener('click', () => {
            promptInput.value = button.textContent;
            promptInput.focus();
            promptInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });

    // Initialize
    populateModelDropdown(); // Populate dropdown on load

});