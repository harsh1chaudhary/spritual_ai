from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from elevenlabs import stream
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from googleapiclient.discovery import build

# Load .env variables
load_dotenv()
chatapi = os.getenv("chat_api")
voiceapi = os.getenv("voice_api")

# Configure Gemini API
genai.configure(api_key=chatapi)
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction='''You are a compassionate and professional mental health therapist and your name is Dr.Baymax. Your role is to listen attentively, provide emotional support, ask thoughtful questions, and offer gentle guidance grounded in psychological understanding. You should be non-judgmental, patient, and empathetic, helping users explore their thoughts and feelings safely.

Use a calm, caring tone. Always validate the user’s emotions before offering insights or suggestions. Never make assumptions. If a user is in distress or shows signs of crisis, gently encourage them to seek help from a qualified professional or call a local emergency number. Avoid giving medical diagnoses or specific treatment plans.

'''
)

# ElevenLabs setup
client = ElevenLabs(api_key=voiceapi)

def hi(choice, xi):
    vo1 = ['6MoEUz34rbRrmmyxgRm4', 'xZp4zaaBzoWhWxxrcAij', 'MF4J4IDTRo0AxOO4dpFR']
    try:
        audio_stream = client.text_to_speech.convert_as_stream(
            text=xi,
            voice_id=vo1[choice - 1],
            model_id="eleven_multilingual_v2"
        )
        stream(audio_stream)
    except Exception as e:
        print("Voice not working --- Error:", e)

# Flask setup
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Shared variables
x = "NUll"
conversation_log = []

# File to store the conversation
CONVO_FILE = "conversation_log.json"

def save_conversation():
    with open(CONVO_FILE, "w", encoding='utf-8') as f:
        json.dump(conversation_log, f, indent=4, ensure_ascii=False)

@app.route("/")
def home():
    return render_template("chat.html")

@app.route("/chat", methods=['GET'])
def chat():
    return render_template("chat.html")

@app.route("/graph", methods=['GET'])
def graph():
    return render_template("graph.html")

@app.route("/data", methods=['GET'])
def data():
    global x
    return jsonify({"gini": x})

@app.route("/receive", methods=['POST'])
def rev():
    global x, conversation_log
    x = "NUll"

    try:
        datai = request.get_json(force=True)
        print("Request headers:", request.headers)
        print("Request body:", datai)

        if not datai or "message" not in datai:
            return jsonify({"status": "error", "reason": "Missing 'message' key"}), 400

        user_message = datai["message"]

        # Generate response from Gemini
        gen_txt = model.generate_content(user_message)
        response_dict = gen_txt.to_dict()
        assistant_text = response_dict["candidates"][0]["content"]["parts"][0]["text"]
       
        formatted_response = "MIND: " + assistant_text.replace("*", "\n")
       

        # Update global var
        x = formatted_response
        hi(1,assistant_text)  

        # Log the message
        conversation_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            "user": user_message,
            "assistant": assistant_text
        })

        save_conversation()

        return jsonify({"status": "success", "response": x})

    except Exception as e:
        print("Error in /receive:", e)
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route("/recommend", methods=["GET"])
def recommend_videos():
    
    try:
        # Read conversation from file
        if os.path.exists(CONVO_FILE):
            with open(CONVO_FILE, "r", encoding="utf-8") as f:
                conversation_data = json.load(f)
        else:
            return jsonify({"status": "error", "message": "No conversation data available."}), 400

        if not conversation_data:
            return jsonify({"status": "error", "message": "Conversation is empty."}), 400
       
        # Step 1: Generate short YouTube search query from Gemini
        chat_history = "\n".join([f"User: {x['user']}" for x in conversation_data])
        summary_prompt = (
            "You are a spiritual AI assistant. Based on the user's emotional conversation below, "
            "generate only one short YouTube search query (no more than 6 words) that would help them spiritually. "
            "Do NOT add any explanation, just return the raw query.\n\n"
            f"{chat_history}\n\nExample output: spiritual songs for emotional healing"
        )

        summary_response = model.generate_content(summary_prompt)
        search_query = summary_response.text.strip().split("\n")[0]  # First line only
        print("Generated YouTube Search Query:", search_query)

        # Step 2: Use YouTube API to get videos
        youtube = build("youtube", "v3", developerKey=os.getenv("YOUTUBE_API_KEY"))

        search_response = youtube.search().list(
            q=search_query,
            part="snippet",
            type="video",
            maxResults=3
        ).execute()

        print("YouTube API Response:", search_response)

        recommendations = []
        for item in search_response.get("items", []):
            video_id = item["id"]["videoId"]
            title = item["snippet"]["title"]
            url = f"https://www.youtube.com/watch?v={video_id}"
            recommendations.append({"title": title, "url": url})

        return jsonify({
            "status": "success",
            "search_query": search_query,
            "videos": recommendations
        })

    except Exception as e:
        print("Error in /recommend:", e)
        return jsonify({"status": "error", "message": str(e)}), 500
@app.route('/clear_conversation', methods=['POST'])
def clear_conversation():
    try:
        if os.path.exists(CONVO_FILE):
            with open(CONVO_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f)  # Clear the content by saving an empty list
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host="0.0.0.0", port=port)
