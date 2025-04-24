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
import pyaudio
import wave
from pydub import AudioSegment
import audioop # To calculate RMS (volume)
import math # For log calculation if needed for threshold tuning
import whisper
import csv
import re
whisper_model="medium"
model_voice = whisper.load_model(whisper_model)
import time
# Load .env variables
load_dotenv()
chatapi = os.getenv("chat_api")
voiceapi = os.getenv("voice_api")

# Configure Gemini API
genai.configure(api_key=chatapi)
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction='''You are a compassionate and professional mental health therapist as well as spirtual guider and your name is Dr.Baymax. Your role is to listen attentively, provide emotional support, ask thoughtful questions, and offer gentle guidance grounded in psychological understanding. You should be non-judgmental, patient, and empathetic, helping users explore their thoughts and feelings safely.

Use a calm, caring tone. Always validate the user’s emotions before offering insights or suggestions. Never make assumptions. If a user is in distress or shows signs of crisis, gently encourage them to seek help from a qualified professional or call a local emergency number. Avoid giving medical diagnoses or specific treatment plans.

'''
)


model1 = genai.GenerativeModel(
  model_name="gemini-2.0-flash",

  system_instruction=''' You are a bot designed to analyze user sentiments and calibrate the levels of anxiety, stress, and depression on a scale of 0 to 10. However, if the user’s emotional state indicates a danger or alert level like ending itself life, 
  the scale can extend up to 20 to reflect the level of anxiety, stress, and depression will go high more than 10 . Do not explain your process or show any inner thoughts; simply provide the calibrated levels based on the user's input ands its past chats .
if user is having sucidal thought , want to danger lives , make the level of anxiety, stress, and depression all 20
Example:

User: "I am feeling very nervous and stressed today due to exam pressure."
Output: Anxiety: 6, Stress: 9, Depression: 2
User: "I feel completely overwhelmed, like I can’t handle anything anymore."
Output: Anxiety: 12, Stress: 15, Depression: 10
This makes it clear how to handle extreme emotional states with the extended scale. Let me know if further adjustments are needed!


Here are more examples to illustrate how the calibration works with both the standard and extended scale:
Example 0:

User: "I want to sucide"
Output: Anxiety: 13, Stress: 12, Depression: 12
Example 1:

User: "I’m feeling a bit uneasy, but I think I’ll be okay."
Output: Anxiety: 3, Stress: 2, Depression: 1
Example 2:

User: "I’m so stressed about meeting this deadline. I can’t seem to focus!"
Output: Anxiety: 7, Stress: 8, Depression: 10
Example 3:

User: "I’ve been feeling sad and unmotivated for weeks. Nothing seems to make me happy."
Output: Anxiety: 4, Stress: 5, Depression: 9
Example 4:

User: "I can’t sleep, my heart is racing all the time, and I feel like something bad is about to happen."
Output: Anxiety: 11, Stress: 13, Depression: 7
Example 5 (Alert Level):
'''

)

# ElevenLabs setup
client = ElevenLabs(api_key=voiceapi)
def extract_digits(text):
    digits = [int(digit) for digit in ''.join(re.findall(r'\d+', text))]
    
    # Extract time in formats hh:mm or hh:mm:ss
    time = re.findall(r'\b\d{1,2}[:]\d{2}(:\d{2})?\b', text)
    
    # Extract days of the week (e.g., Mon, Tue, etc.)
    days = re.findall(r'\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b', text)
    
    # Get current time and day
    current_time = datetime.now().strftime('%H:%M:%S')
    current_day = datetime.now().strftime('%A')  # Full day name (e.g., Monday)
    
    return [
         digits,
        
        current_time,
        current_day
    ]
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
chat_session1 = model1.start_chat(history=[])
dt=['death','sucide',"end live",'not live','dead','die','kill']
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
        response1 = chat_session1.send_message(user_message)
        digit_data=extract_digits(response1.text)
        if any(word in user_message for word in dt):
            digit_data[0][0]=17
            digit_data[0][1]=16
            digit_data[0][2]=20
        
        new_rows=[[digit_data[0][0],digit_data[0][1],digit_data[0][2],digit_data[1]]]
        with open("/Users/harshchaudhary/H_projects/spritual ai/static/dynamic.csv", mode="a", newline="") as file:
            writer = csv.writer(file)
            writer.writerows(new_rows) 
    
   # print(response.text)
        digit_data=extract_digits(response1.text)

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

@app.route('/recording')
def record_and_transcribe():
    # --- Configuration ---
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 44100
    CHUNK = 1024
    SILENCE_THRESHOLD = 500
    SILENCE_DURATION_LIMIT = 3.0
    WAVE_FILENAME = "temp_audio_recording.wav"
    MP3_FILENAME = "audio.mp3"

    audio = pyaudio.PyAudio()
    stream = None
    frames = []
    silence_counter = 0
    total_chunks_recorded = 0
    chunks_per_second = RATE / CHUNK
    silent_chunks_limit = int(SILENCE_DURATION_LIMIT * chunks_per_second)

    try:
        stream = audio.open(format=FORMAT,
                            channels=CHANNELS,
                            rate=RATE,
                            input=True,
                            frames_per_buffer=CHUNK)

        print("Recording started... Speak now.")

        while True:
            data = stream.read(CHUNK, exception_on_overflow=False)
            frames.append(data)
            total_chunks_recorded += 1
            rms = audioop.rms(data, audio.get_sample_size(FORMAT))

            if rms < SILENCE_THRESHOLD:
                silence_counter += 1
            else:
                silence_counter = 0

            if silence_counter >= silent_chunks_limit:
                print("Silence detected. Stopping recording.")
                break

        stream.stop_stream()
        stream.close()
        audio.terminate()

        # Save the audio as a temporary WAV file
        wav_file_path = "temp_audio.wav"
        wf = wave.open(wav_file_path, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(audio.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
        wf.close()

        # Convert WAV to MP3 and overwrite previous file
        audio_segment = AudioSegment.from_wav(wav_file_path)
        mp3_file_path = "audio.mp3"
        audio_segment.export(mp3_file_path, format="mp3")

        # Transcribe the audio
        result = model_voice.transcribe(mp3_file_path)
        print(result)
        return jsonify({"text": result["text"]})

    except Exception as e:
        return jsonify({"error": f"Recording error: {str(e)}"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host="0.0.0.0", port=port)
