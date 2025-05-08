import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='static') # Point to the 'static' folder
CORS(app) # Enable CORS for all routes

# Initialize Groq client
try:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
    client = Groq(api_key=groq_api_key)
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    client = None # Set client to None if initialization fails

# Serve index.html from the root
@app.route('/')
def serve_index():
    # Assumes index.html is in the same directory as app.py
    return send_from_directory('.', 'index.html')

# Flask will automatically serve files from the 'static_folder' (static) at the /static URL prefix.
# No explicit route needed if using app = Flask(__name__, static_folder='static')
# and files are linked correctly in HTML (e.g., /static/style.css)

@app.route('/chat', methods=['POST'])
def chat_with_groq():
    if not client:
        return jsonify({"error": "Groq client not initialized. Check API key and server logs."}), 500

    data = request.json
    user_prompt = data.get('prompt')
    system_prompt_from_request = data.get('system_prompt') # Get system prompt from request
    temperature_from_request = data.get('temperature', 0.7) # Get temperature, default 0.7

    if not user_prompt:
        return jsonify({"error": "Prompt is required"}), 400

    # Use provided system prompt, or a default if none is given or it's empty
    final_system_prompt = system_prompt_from_request if system_prompt_from_request and system_prompt_from_request.strip() else "You are a helpful AI assistant."

    try:
        print(f"Received user prompt: {user_prompt}")
        print(f"Using system prompt: {final_system_prompt}")
        print(f"Using temperature: {temperature_from_request}")

        messages = [
            {
                "role": "system",
                "content": final_system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            }
        ]

        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama3-8b-8192", # Or try "mixtral-8x7b-32768"
            temperature=float(temperature_from_request), # Ensure it's a float
            max_tokens=1024,
        )
        ai_response = chat_completion.choices[0].message.content
        print(f"Groq response: {ai_response}")
        return jsonify({"response": ai_response})

    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return jsonify({"error": f"Error communicating with Groq API: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)