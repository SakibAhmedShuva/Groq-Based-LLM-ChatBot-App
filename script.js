document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('prompt-input');
  const runButton = document.getElementById('run-button');
  const chatOutput = document.getElementById('chat-output');
  const temperatureSlider = document.getElementById('temperature');
  const temperatureValue = document.getElementById('temperature-value');
  const suggestionButtons = document.querySelectorAll('.suggestion-btn');
  const welcomeMessage = document.querySelector('.welcome-message');

  const API_URL = 'http://localhost:5000/chat'; // Your Flask API endpoint

  // Auto-resize textarea
  promptInput.addEventListener('input', () => {
      promptInput.style.height = 'auto';
      promptInput.style.height = (promptInput.scrollHeight) + 'px';
  });
  
  // Sync temperature slider and number input
  temperatureSlider.addEventListener('input', (e) => {
      temperatureValue.value = e.target.value;
  });
  temperatureValue.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value);
      if (val < 0) val = 0;
      if (val > 1) val = 1;
      temperatureSlider.value = val;
      temperatureValue.value = val; // ensure it reflects corrected value
  });


  const addMessageToChat = (text, sender, type = 'text') => {
      if (welcomeMessage) {
          welcomeMessage.style.display = 'none'; // Hide welcome message once chat starts
      }
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', sender); // sender is 'user' or 'ai'
      if (type === 'error') {
          messageDiv.classList.add('error');
      } else if (type === 'loading') {
          messageDiv.classList.add('loading');
      }
      messageDiv.textContent = text;
      chatOutput.appendChild(messageDiv);
      chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to bottom
      return messageDiv; // Return for potential modification (e.g., removing loading)
  };

  const handleRunPrompt = async () => {
      const promptText = promptInput.value.trim();
      if (!promptText) return;

      addMessageToChat(promptText, 'user');
      promptInput.value = ''; // Clear input
      promptInput.style.height = 'auto'; // Reset height
      runButton.disabled = true;

      const loadingMessage = addMessageToChat('AI is thinking...', 'ai', 'loading');

      try {
          const response = await fetch(API_URL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt: promptText }),
          });

          chatOutput.removeChild(loadingMessage); // Remove loading message

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: "Unknown error occurred" }));
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
          event.preventDefault(); // Prevent new line on Ctrl+Enter
          handleRunPrompt();
      }
  });

  suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
          promptInput.value = button.textContent;
          promptInput.focus();
          // Trigger input event for auto-resize
          promptInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
  });
});