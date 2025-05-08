import os
import json # For SSE data formatting
from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = Flask(__name__, static_folder=None) # No separate static folder, all in HTML
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
    # Serve the single index.html file
    return send_from_directory('.', 'index.html')

def generate_groq_stream(payload):
    """
    Generator function to stream responses from Groq.
    Sends data in Server-Sent Events format.
    """
    if not client:
        error_event = {"error": "Groq client not initialized."}
        yield f"data: {json.dumps(error_event)}\n\n"
        return

    user_prompt = payload.get('prompt')
    system_prompt_from_request = payload.get('system_prompt')
    temperature_from_request = payload.get('temperature', 0.7)
    model_id_from_request = payload.get('model_id', 'llama3-8b-8192')

    if not user_prompt:
        error_event = {"error": "Prompt is required"}
        yield f"data: {json.dumps(error_event)}\n\n"
        return

    final_system_prompt = system_prompt_from_request if system_prompt_from_request and system_prompt_from_request.strip() else "You are a helpful AI assistant."
    
    full_response_content = ""

    try:
        print(f"Streaming request for model: {model_id_from_request}")
        messages = [
            {"role": "system", "content": final_system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        stream = client.chat.completions.create(
            messages=messages,
            model=model_id_from_request,
            temperature=float(temperature_from_request),
            max_tokens=2048, # Adjust as needed
            stream=True,
        )

        for chunk in stream:
            content_chunk = chunk.choices[0].delta.content
            if content_chunk:
                full_response_content += content_chunk
                # Send chunk to client
                event_data = {"text_chunk": content_chunk, "is_final": False}
                yield f"data: {json.dumps(event_data)}\n\n"
        
        # Send final event with full response (useful for history saving on client)
        final_event_data = {"full_response": full_response_content, "is_final": True}
        yield f"data: {json.dumps(final_event_data)}\n\n"

    except Exception as e:
        print(f"Error during Groq stream: {e}")
        error_event = {"error": f"Error streaming from Groq: {str(e)}", "is_final": True}
        yield f"data: {json.dumps(error_event)}\n\n"


@app.route('/chat', methods=['POST'])
def chat_with_groq_stream():
    payload = request.json
    return Response(generate_groq_stream(payload), mimetype='text/event-stream')


if __name__ == '__main__':
    app.run(debug=True, port=5000)