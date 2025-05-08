import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
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

@app.route('/')
def home():
    return "Flask API for AI Studio Clone is running!"

@app.route('/chat', methods=['POST'])
def chat_with_groq():
    if not client:
        return jsonify({"error": "Groq client not initialized. Check API key and server logs."}), 500

    data = request.json
    user_prompt = data.get('prompt')

    if not user_prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        print(f"Received prompt: {user_prompt}")
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant."
                },
                {
                    "role": "user",
                    "content": user_prompt,
                }
            ],
            model="llama3-8b-8192", # Or try "mixtral-8x7b-32768"
            temperature=0.7, # You can make this configurable from frontend later
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