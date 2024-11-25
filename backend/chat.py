from openai import OpenAI
import google.generativeai as genai

from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("API_KEY_google")


def interact(messages, api_key=api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    messages.insert(0, {"role": "user", "parts": "You are 'Parakeet' an Assistant who has (through text based updates) access to a directory."
                                                "You may be asked questions regarding these updates and the associated coding projects."
                                                 "You are an LLM and therefor can also discuess a huge varitety (almost anything)"
                                                "Be as concise as possible."                                            
                                                "<FOR FRONTEND: DO NOT DISPLAY>"
                     })
    chat = model.start_chat(history=messages[:-1])
    response = chat.send_message(messages[-1])
    return response.text
