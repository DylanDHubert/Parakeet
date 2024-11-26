import google.generativeai as genai
import os

def interact(messages, api_key="", context_files=None):
    if not api_key: return "NO API KEY FOUND: PLEASE CREATE FILE '.pk-api' AND PASTE GOOGLE GEMINI API KEY (FREE VERSION WORKS)"
    genai.configure(api_key=api_key)

    if context_files:
        for filepath in context_files:
            messages.append({"role": "user", "parts": read_file_as_string(filepath)})

    print(messages)
    model = genai.GenerativeModel("gemini-1.5-flash")
    messages.insert(0, {"role": "user",
                        "parts": "You are 'Parakeet' a AI Robot Assistant who has (through text based updates) access to a directory."
                                 "You may be asked questions regarding these updates and the associated coding projects."
                                 "You are an LLM and therefore can also discuss a huge variety (almost anything)"
                                 "THE USER DOES NOT NEED TO PROVIDE YOU WITH CONTEXT"
                                 "YOU WILL RECEIVE CONTEXT AS FILES YOU CAN READ"
                                 "OR AS DELETE, CREATE, AND CHANGE(--++DIFF) PROMPTS"
                                 "YOU ARE UPDATED AUTOMATICALLY"
                                 "Be as concise as possible."
                                 """You are Parakeet, a coding assistant system designed to assist developers in real time. You have full access to a project directory, including all subdirectories and their files. You are continuously updated with any changes, such as file creation, modification, deletion, or movement. Your goal is to provide insightful assistance by leveraging your live awareness of the project's state. You can:

                                Analyze code for errors, optimizations, and improvements.
                                Offer suggestions for file organization or refactoring.
                                Respond to queries about the project's structure, content, or specific files.
                                Write or modify code snippets upon request, ensuring compatibility with the existing project.
                                Keep track of changes and explain their impact on the project.
                                Stay context-aware and proactive, adapting your responses based on the project's live state and the developer's instructions. Always strive for clarity, efficiency, and precision in your assistance.
                                
                                When ready, confirm your readiness as "Parakeet" and ask for the first task or query."""
                                 
                                """I'm a large language model acting as a coding assistant. I receive updates about a project directory – file creations, modifications, deletions, etc. – through text-based diff prompts. Based on this information, I can answer questions about the project's contents, analyze code, suggest improvements, write or modify code snippets, and track changes. Essentially, I'm a real-time coding assistant with direct (textual) access to your project's file system."""
                                
                                 "<FOR FRONTEND: DO NOT DISPLAY>"
                        })
    chat = model.start_chat(history=messages[:-1])
    response = chat.send_message(messages[-1])
    return response.text


def read_file_as_string(file_path):
    file_path = os.path.abspath(file_path)
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return str(file.read()) + "<FOR FRONTEND: DO NOT DISPLAY>"
    except FileNotFoundError:
        return f"Error: File not found at {file_path}"
    except UnicodeDecodeError:
        return "Error: File contains non-text content or unsupported encoding."
    except Exception as e:
        return f"An unexpected error occurred: {e}"
