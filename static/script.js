// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- APP CONFIG ---
    const APP_NAME = "My AI Studio"; // Configure your app name here
    const DEFAULT_MODEL_ID = "llama3-8b-8192";
    const DEFAULT_TEMPERATURE = 0.7;
    const FOOTER_TEXT = "Powered by Groq. For experimentation and learning.";

    // --- DOM Elements ---
    const appLogo = document.getElementById('app-logo');
    const welcomeHeader = document.getElementById('welcome-header');
    const appFooterText = document.getElementById('app-footer-text');

    const promptInput = document.getElementById('prompt-input');
    const systemPromptInput = document.getElementById('system-prompt-input');
    const runButton = document.getElementById('run-button');
    const chatOutput = document.getElementById('chat-output');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const modelSelect = document.getElementById('model-select');
    const modelInfoDiv = document.getElementById('model-info');
    const welcomeMessageContainer = document.querySelector('.welcome-message'); // Target the container

    // Buttons
    const newChatBtn = document.getElementById('new-chat-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    // Tool Toggles
    const toolStructuredOutputToggle = document.getElementById('tool-structured-output');
    const toolFunctionCallingToggle = document.getElementById('tool-function-calling');

    // Other Nav items (for placeholders)
    const navStream = document.getElementById('nav-stream');
    const navVideoGen = document.getElementById('nav-video-gen');
    const navStarterApps = document.getElementById('nav-starter-apps');
    const navHistory = document.getElementById('nav-history');


    const API_URL = '/chat';

    // --- MODEL DATA ---
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

    // Tool states
    let toolStates = {
        structuredOutput: false,
        functionCalling: false
    };

    // --- Initialization ---
    function initializeApp() {
        if (appLogo) appLogo.textContent = APP_NAME;
        if (welcomeHeader) welcomeHeader.innerHTML = `Welcome to ${APP_NAME}`; // Use innerHTML if APP_NAME can have simple HTML
        if (appFooterText) appFooterText.textContent = FOOTER_TEXT;

        populateModelDropdown();
        resetSettings(); // Apply default settings on load
        loadToolStates(); // Load tool states from localStorage
        updateToolTogglesUI();
    }

    // --- UI Update Functions ---
    function populateModelDropdown() { /* ... (no change from previous) ... */
        if (!modelSelect) return;
        modelSelect.innerHTML = '';
        chatModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name || model.id;
            modelSelect.appendChild(option);
        });
        if (chatModels.length > 0) {
            modelSelect.value = selectedModelId; // Will be set by resetSettings or loaded state
            updateModelInfo(selectedModelId);
        }
    }

    function updateModelInfo(modelId) { /* ... (no change from previous) ... */
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
    
    function updateTemperatureUI(value) {
        temperatureSlider.value = value;
        temperatureValue.value = parseFloat(value).toFixed(1);
    }

    // --- Event Handlers ---
    function handleNewChat() {
        chatOutput.innerHTML = ''; // Clear previous messages
        if (welcomeMessageContainer) { // Show welcome message again
            welcomeMessageContainer.style.display = 'flex'; // Or 'block', 'grid' depending on its original display
             // Re-create or unhide the h1 inside welcomeMessageContainer if it was removed
            if (!welcomeHeader || !welcomeMessageContainer.contains(welcomeHeader)) {
                const h1 = document.createElement('h1');
                h1.id = 'welcome-header'; // Ensure it has the ID if recreated
                h1.textContent = `Welcome to ${APP_NAME}`;
                welcomeMessageContainer.appendChild(h1);
            }
        }
        systemPromptInput.value = '';
        systemPromptInput.style.height = 'auto'; // Reset height
        promptInput.value = '';
        promptInput.style.height = 'auto'; // Reset height
        console.log("New chat started.");
    }

    function resetSettings() {
        selectedModelId = DEFAULT_MODEL_ID;
        if (modelSelect) {
            modelSelect.value = selectedModelId;
            updateModelInfo(selectedModelId);
        }
        updateTemperatureUI(DEFAULT_TEMPERATURE);
        console.log("Settings reset to defaults.");
    }

    // Auto-resize textareas
    [promptInput, systemPromptInput].forEach(textarea => { /* ... (no change from previous) ... */
        if (textarea) {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            });
            // Initial resize
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
    });
    
    // Sync temperature slider and number input
    temperatureSlider.addEventListener('input', (e) => updateTemperatureUI(e.target.value));
    temperatureValue.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = DEFAULT_TEMPERATURE;
        if (val < 0) val = 0; if (val > 1) val = 1;
        updateTemperatureUI(val);
    });

    // Model select change
    if (modelSelect) {
        modelSelect.addEventListener('change', (event) => {
            selectedModelId = event.target.value;
            updateModelInfo(selectedModelId);
        });
    }

    // Tool Toggles
    function saveToolStates() {
        localStorage.setItem('toolStates', JSON.stringify(toolStates));
    }
    function loadToolStates() {
        const saved = localStorage.getItem('toolStates');
        if (saved) {
            toolStates = JSON.parse(saved);
        }
    }
    function updateToolTogglesUI() {
        if(toolStructuredOutputToggle) toolStructuredOutputToggle.checked = toolStates.structuredOutput;
        if(toolFunctionCallingToggle) toolFunctionCallingToggle.checked = toolStates.functionCalling;
    }

    if(toolStructuredOutputToggle) {
        toolStructuredOutputToggle.addEventListener('change', (e) => {
            toolStates.structuredOutput = e.target.checked;
            saveToolStates();
            console.log("Structured Output:", toolStates.structuredOutput);
        });
    }
    if(toolFunctionCallingToggle) {
        toolFunctionCallingToggle.addEventListener('change', (e) => {
            toolStates.functionCalling = e.target.checked;
            saveToolStates();
            console.log("Function Calling:", toolStates.functionCalling);
            // Future: if enabled, you might show an "Edit Functions" modal or similar
        });
    }


    // --- Chat Logic ---
    const addMessageToChat = (text, sender, type = 'text') => { /* ... (no change from previous) ... */
        if (welcomeMessageContainer && welcomeMessageContainer.style.display !== 'none') {
            welcomeMessageContainer.style.display = 'none';
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        if (type === 'error') messageDiv.classList.add('error');
        else if (type === 'loading') messageDiv.classList.add('loading');
        messageDiv.textContent = text;
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
        return messageDiv;
    };

    const handleRunPrompt = async () => { /* ... (no change, model_id already included) ... */
        const userPromptText = promptInput.value.trim();
        const systemPromptText = systemPromptInput.value.trim();
        const currentTemperature = parseFloat(temperatureSlider.value);

        if (!userPromptText) return;

        addMessageToChat(userPromptText, 'user');
        promptInput.value = '';
        promptInput.style.height = 'auto';
        runButton.disabled = true;

        const loadingMessage = addMessageToChat('AI is thinking...', 'ai', 'loading');

        // Include tool states in payload if they affect the backend call
        // For now, we're just logging them. Function calling would need to send definitions.
        const payload = {
            prompt: userPromptText,
            system_prompt: systemPromptText,
            temperature: currentTemperature,
            model_id: selectedModelId,
            // tools_config: toolStates // Example if backend needs this
        };
        console.log("Sending payload:", payload);
        console.log("Current tool states (FE only for now):", toolStates);


        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            // ... (rest of try-catch for fetch - no change)
            if (chatOutput.contains(loadingMessage)) {
                chatOutput.removeChild(loadingMessage);
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Server error, no details." }));
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

    // --- Event Listeners for Buttons ---
    if (newChatBtn) newChatBtn.addEventListener('click', handleNewChat);
    if (resetSettingsBtn) resetSettingsBtn.addEventListener('click', resetSettings);
    if (runButton) runButton.addEventListener('click', handleRunPrompt);
    
    promptInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            handleRunPrompt();
        }
    });

    // Placeholder nav item clicks
    [navStream, navVideoGen, navStarterApps, navHistory].forEach(navItem => {
        if (navItem) {
            navItem.addEventListener('click', (e) => {
                if (navItem.classList.contains('nav-disabled')) {
                    e.preventDefault();
                    return;
                }
                alert(`"${navItem.textContent.trim()}" feature is coming soon!`);
                // Could also remove 'active' from #nav-chat and add to clicked one
                // document.querySelector('.left-sidebar nav li.active').classList.remove('active');
                // navItem.classList.add('active');
            });
        }
    });

    // Initialize
    initializeApp();
});