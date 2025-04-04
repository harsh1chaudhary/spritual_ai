from flask import Flask ,request, jsonify, render_template
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from elevenlabs import stream
from dotenv import load_dotenv
import os
load_dotenv()
chatapi=os.getenv("chat_api")
voiceapi=os.getenv("voice_api")
genai.configure(api_key=(chatapi))

model = genai.GenerativeModel("gemini-2.0-flash")

client = ElevenLabs(
  api_key=voiceapi,
)
x="NUll"

def hi(choice,xi):
    vo1=['6MoEUz34rbRrmmyxgRm4','xZp4zaaBzoWhWxxrcAij','MF4J4IDTRo0AxOO4dpFR']
    try:
        audio_stream = client.text_to_speech.convert_as_stream(
            text=xi,
            voice_id=vo1[choice-1],
            model_id="eleven_multilingual_v2"
        )
        # option 1: play the streamed audio locally
        stream(audio_stream)
    except Exception as e:
        print("Voice not working  --- Error found  ",e)    




app=Flask(__name__)
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat",methods=['POST','GET'])
def chat():
    return render_template("chat.html")

@app.route("/data",methods=['GET'])
def data():
    global x
    return jsonify({"gini":x})
   

@app.route("/receive",methods=['POST'])
def rev():
    global x
    x="NUll"
    datai = request.json  # Get JSON data from the request
   # print("Received:", datai["message"])
  
    gen_txt=model.generate_content(datai["message"])
    response_dict = gen_txt.to_dict()
    text = response_dict["candidates"][0]["content"]["parts"][0]["text"]
    
    print(text)
    x = text.replace("*","\n")
    x="MIND: "+x
    #hi(3,x)

    return jsonify({"status": "success", "received": datai})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host="0.0.0.0", port=port)
print("hello")
