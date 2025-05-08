// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const systemPromptInput = document.getElementById('system-prompt-input'); // Get system prompt input
    const runButton = document.getElementById('run-button');
    const chatOutput = document.getElementById('chat-output');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    const welcomeMessage = document.querySelector('.welcome-message');

    const API_URL = '/chat'; // UPDATED: Relative path for Flask-served app

    // Auto-resize textareas (user prompt and system prompt)
    [promptInput, systemPromptInput].forEach(textarea => {
        if (textarea) {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto'; // Reset height
                textarea.style.height = (textarea.scrollHeight) + 'px'; // Set to scroll height
            });
            // Initial resize for system prompt if it has default content or placeholder makes it multi-line
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
    });
    
    // Sync temperature slider and number input
    temperatureSlider.addEventListener('input', (e) => {
        temperatureValue.value = e.target.value;
    });
    temperatureValue.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0.7; // Default if NaN
        if (val < 0) val = 0;
        if (val > 1) val = 1;
        temperatureSlider.value = val;
        temperatureValue.value = val.toFixed(1); // Ensure it reflects corrected value with one decimal
    });


    const addMessageToChat = (text, sender, type = 'text') => {
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
        messageDiv.textContent = text; // Using textContent for security
        chatOutput.appendChild(messageDiv);
        chatOutput.scrollTop = chatOutput.scrollHeight;
        return messageDiv;
    };

    const handleRunPrompt = async () => {
        const userPromptText = promptInput.value.trim();
        const systemPromptText = systemPromptInput.value.trim(); // Get system prompt value
        const currentTemperature = parseFloat(temperatureSlider.value); // Get temperature

        if (!userPromptText) {
            // Optionally provide feedback if user prompt is empty
            // alert("Please enter a prompt.");
            return;
        }

        addMessageToChat(userPromptText, 'user');
        promptInput.value = '';
        promptInput.style.height = 'auto'; // Reset height after clearing
        runButton.disabled = true;

        const loadingMessage = addMessageToChat('AI is thinking...', 'ai', 'loading');

        const payload = {
            prompt: userPromptText,
            system_prompt: systemPromptText, // Send system prompt (backend will handle if empty)
            temperature: currentTemperature  // Send temperature
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

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
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            handleRunPrompt();
        }
    });

    suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
            promptInput.value = button.textContent;
            promptInput.focus();
            promptInput.dispatchEvent(new Event('input', { bubbles: true })); // Trigger auto-resize
        });
    });
});