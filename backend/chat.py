from openai import OpenAI
import google.generativeai as genai

from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("API_KEY_google")


def interact(messages, api_key=api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    chat = model.start_chat(history=messages[:-1])
    response = chat.send_message(messages[-1])
    return response.text
