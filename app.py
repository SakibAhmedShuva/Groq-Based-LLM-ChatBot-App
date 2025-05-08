import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)

try:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
    client = Groq(api_key=groq_api_key)
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    client = None

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/chat', methods=['POST'])
def chat_with_groq():
    if not client:
        return jsonify({"error": "Groq client not initialized. Check API key and server logs."}), 500

    data = request.json
    user_prompt = data.get('prompt')
    system_prompt_from_request = data.get('system_prompt')
    temperature_from_request = data.get('temperature', 0.7)
    model_id_from_request = data.get('model_id', 'llama3-8b-8192') # <<< ADDED: Get model_id, default if not provided

    if not user_prompt:
        return jsonify({"error": "Prompt is required"}), 400

    final_system_prompt = system_prompt_from_request if system_prompt_from_request and system_prompt_from_request.strip() else "You are a helpful AI assistant."

    try:
        print(f"Received user prompt: {user_prompt}")
        print(f"Using system prompt: {final_system_prompt}")
        print(f"Using temperature: {temperature_from_request}")
        print(f"Using model: {model_id_from_request}") # <<< Log the model being used

        messages = [
            {"role": "system", "content": final_system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        chat_completion = client.chat.completions.create(
            messages=messages,
            model=model_id_from_request, # <<< UPDATED: Use the model_id from request
            temperature=float(temperature_from_request),
            max_tokens=1024, # Consider making this configurable later
        )
        ai_response = chat_completion.choices[0].message.content
        print(f"Groq response: {ai_response}")
        return jsonify({"response": ai_response})

    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return jsonify({"error": f"Error communicating with Groq API: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)