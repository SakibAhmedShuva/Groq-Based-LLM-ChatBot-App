// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- APP CONFIG ---
    const APP_NAME = "My AI Studio";
    const DEFAULT_MODEL_ID = "llama3-8b-8192";
    const DEFAULT_TEMPERATURE = 0.7;

    // --- DOM Elements ---
    const appLogo = document.getElementById('app-logo');
    const welcomeHeader = document.getElementById('welcome-header');

    const promptInput = document.getElementById('prompt-input');
    const systemPromptInput = document.getElementById('system-prompt-input');
    const runButton = document.getElementById('run-button');
    const chatOutput = document.getElementById('chat-output');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const modelSelect = document.getElementById('model-select');
    const modelInfoDiv = document.getElementById('model-info');
    const welcomeMessageContainer = document.querySelector('.welcome-message');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn'); // Get suggestion buttons

    // Buttons
    const newChatBtn = document.getElementById('new-chat-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    // Tool Toggles
    const toolStructuredOutputToggle = document.getElementById('tool-structured-output');
    const toolFunctionCallingToggle = document.getElementById('tool-function-calling');

    // Nav items
    const navChat = document.getElementById('nav-chat');
    const navStream = document.getElementById('nav-stream');
    const navSTT = document.getElementById('nav-stt');
    const navTTS = document.getElementById('nav-tts');
    const navHistory = document.getElementById('nav-history');


    const API_URL = '/chat';

    const modelsData = [ /* ... (your existing modelsData array - no change here) ... */
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
    ];

    const chatModels = modelsData.filter(model => model.group === "Chat");
    let selectedModelId = DEFAULT_MODEL_ID;

    let toolStates = { structuredOutput: false, functionCalling: false };

    function initializeApp() {
        if (appLogo) appLogo.textContent = APP_NAME;
        if (welcomeHeader) welcomeHeader.innerHTML = `Welcome to ${APP_NAME}`;
        // Footer text removed
        populateModelDropdown();
        resetSettings();
        loadToolStates();
        updateToolTogglesUI();
        promptInput.focus(); // Initial focus
    }

    function populateModelDropdown() { /* ... (no change) ... */
        if (!modelSelect) return;
        modelSelect.innerHTML = '';
        chatModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name || model.id;
            modelSelect.appendChild(option);
        });
        if (chatModels.length > 0) {
            modelSelect.value = selectedModelId;
            updateModelInfo(selectedModelId);
        }
    }
    function updateModelInfo(modelId) { /* ... (no change) ... */
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
    function updateTemperatureUI(value) { /* ... (no change) ... */
        temperatureSlider.value = value;
        temperatureValue.value = parseFloat(value).toFixed(1);
    }

    function handleNewChat() { /* ... (no change from previous version where welcome message was handled) ... */
        chatOutput.innerHTML = '';
        if (welcomeMessageContainer) {
            welcomeMessageContainer.style.display = 'flex';
            if (!welcomeHeader || !welcomeMessageContainer.contains(welcomeHeader)) {
                const h1 = document.createElement('h1');
                h1.id = 'welcome-header';
                h1.textContent = `Welcome to ${APP_NAME}`;
                welcomeMessageContainer.appendChild(h1);
            }
        }
        systemPromptInput.value = '';
        systemPromptInput.style.height = 'auto';
        promptInput.value = '';
        promptInput.style.height = 'auto';
        promptInput.focus(); // Focus after new chat
        console.log("New chat started.");
    }
    function resetSettings() { /* ... (no change, but promptInput.focus() added below) ... */
        selectedModelId = DEFAULT_MODEL_ID;
        if (modelSelect) {
            modelSelect.value = selectedModelId;
            updateModelInfo(selectedModelId);
        }
        updateTemperatureUI(DEFAULT_TEMPERATURE);
        promptInput.focus(); // Focus after reset
        console.log("Settings reset to defaults.");
    }

    [promptInput, systemPromptInput].forEach(textarea => { /* ... (no change) ... */
         if (textarea) {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            });
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
    });
    
    temperatureSlider.addEventListener('input', (e) => updateTemperatureUI(e.target.value));
    temperatureValue.addEventListener('input', (e) => { /* ... (no change) ... */
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = DEFAULT_TEMPERATURE;
        if (val < 0) val = 0; if (val > 1) val = 1;
        updateTemperatureUI(val);
    });

    if (modelSelect) { /* ... (no change) ... */
        modelSelect.addEventListener('change', (event) => {
            selectedModelId = event.target.value;
            updateModelInfo(selectedModelId);
        });
    }

    function saveToolStates() { /* ... (no change) ... */
        localStorage.setItem('toolStates', JSON.stringify(toolStates));
    }
    function loadToolStates() { /* ... (no change) ... */
        const saved = localStorage.getItem('toolStates');
        if (saved) {
            toolStates = JSON.parse(saved);
        }
    }
    function updateToolTogglesUI() { /* ... (no change) ... */
        if(toolStructuredOutputToggle) toolStructuredOutputToggle.checked = toolStates.structuredOutput;
        if(toolFunctionCallingToggle) toolFunctionCallingToggle.checked = toolStates.functionCalling;
    }
    if(toolStructuredOutputToggle) { /* ... (no change) ... */
        toolStructuredOutputToggle.addEventListener('change', (e) => {
            toolStates.structuredOutput = e.target.checked;
            saveToolStates();
            console.log("Structured Output:", toolStates.structuredOutput);
        });
    }
    if(toolFunctionCallingToggle) { /* ... (no change) ... */
        toolFunctionCallingToggle.addEventListener('change', (e) => {
            toolStates.functionCalling = e.target.checked;
            saveToolStates();
            console.log("Function Calling:", toolStates.functionCalling);
        });
    }

    const addMessageToChat = (text, sender, type = 'text') => { /* ... (no change) ... */
        if (welcomeMessageContainer && welcomeMessageContainer.style.display !== 'none') {
            welcomeMessageContainer.style.display = 'none';
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        if (type === 'error') messageDiv.classList.add('error');
        else if (type === 'loading') messageDiv.classList.add('loading');
        messageDiv.textContent = text; // Using textContent for security
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
        return messageDiv;
    };

    const handleRunPrompt = async () => {
        const userPromptText = promptInput.value.trim();
        const systemPromptText = systemPromptInput.value.trim();
        const currentTemperature = parseFloat(temperatureSlider.value);

        if (!userPromptText) {
            promptInput.focus(); // If empty, just focus
            return;
        }

        addMessageToChat(userPromptText, 'user');
        promptInput.value = '';
        promptInput.style.height = 'auto'; // Reset height for placeholder
        runButton.disabled = true;

        const loadingMessage = addMessageToChat('AI is thinking...', 'ai', 'loading');

        const payload = {
            prompt: userPromptText,
            system_prompt: systemPromptText,
            temperature: currentTemperature,
            model_id: selectedModelId,
        };
        console.log("Sending payload:", payload);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (chatOutput.contains(loadingMessage)) {
                chatOutput.removeChild(loadingMessage);
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Server error." }));
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
            promptInput.focus(); // <<< FOCUS CURSOR HERE
        }
    };

    if (newChatBtn) newChatBtn.addEventListener('click', handleNewChat);
    if (resetSettingsBtn) resetSettingsBtn.addEventListener('click', resetSettings);
    if (runButton) runButton.addEventListener('click', handleRunPrompt);
    
    promptInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { // <<< ENTER SENDS (allow Shift+Enter for newline)
            event.preventDefault(); // Prevent default newline behavior
            handleRunPrompt();
        }
    });

    // Suggestion Buttons
    suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
            promptInput.value = button.textContent;
            promptInput.style.height = 'auto'; // Reset height
            promptInput.style.height = (promptInput.scrollHeight) + 'px'; // Adjust height
            promptInput.focus();
            handleRunPrompt(); // <<< SEND PROMPT ON SUGGESTION CLICK
        });
    });

    // Placeholder Nav Clicks
    function handleNavClick(navItem) {
        // Deactivate others, activate clicked one (visual only for now)
        document.querySelectorAll('.left-sidebar nav li.active').forEach(li => li.classList.remove('active'));
        navItem.classList.add('active');
        
        let featureName = navItem.textContent.replace(/<small>.*<\/small>/i, '').trim();

        if (navItem.id === 'nav-chat') {
            // If it's the chat view, maybe do nothing or ensure chat specific UI is shown
            // For now, all views are the same single chat interface
            console.log("Chat view selected (already active).");
            return;
        }
        
        alert(`The "${featureName}" interface would load here. (Coming Soon)`);
        // In a real multi-view app, you'd hide/show different content sections
        // For now, we'll just new-chat to clear context for the "new view"
        // handleNewChat(); 
    }

    [navChat, navStream, navSTT, navTTS, navHistory].forEach(navItem => {
        if (navItem) {
            navItem.addEventListener('click', () => handleNavClick(navItem));
        }
    });

    initializeApp();
});