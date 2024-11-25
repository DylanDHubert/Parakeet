from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner import monitor
from chat import interact
import os

path = "../"


def get_path():
    global path
    return path


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

(observer, event_handler) = monitor(path=get_path())

chat_log = []


@app.route("/chat-log", methods=["GET"])
def get_chat_log():
    global chat_log
    return jsonify(chat_log)


def generate_message_from_event_log(event_log):
    message = ""
    for event in event_log:
        message += f"CHANGE OF TYPE {event['type']} IN FILE {event['path']} AT {event['time']}"
        if event['changes']: message += " " + "CHANGES: " + event['changes']
    message += "<FOR FRONTEND: DO NOT DISPLAY>"
    return message

# SCAN FOR CHANGES
@app.route("/scan", methods=["GET"])
def scan():
    global chat_log
    event_log = event_handler.log  # GET LOG FROM EVENT HANDLER

    event_log = [event for event in event_log if passes_filter(event['path'], get_ignore_list())]

    if event_log:
        message = generate_message_from_event_log(event_log)
        chat_log.append({"role": "user", "parts": message})
        event_handler.update()  # UPDATE EVENT HANDLER (PUSHES LOG TO event_handler.HISTORY & CLEARS event_handler.LOG)
    else:
        print("NO CHANGES.")
        pass  # THIS MUST CHANGE

    return jsonify({"log": event_log})  # RETURN JSONIFIED LOG


@app.route("/chat", methods=["POST"])
def chat():
    global chat_log

    message = request.json.get("message")
    chat_log.append({"role": "user", "parts": message})
    response = interact(chat_log)

    if response:
        # UPDATE GLOBAL CHAT LOG
        chat_log.append({"role": "assistant", "parts": response})

    return jsonify({"response": response})


ignore_list = []


def get_ignore_list():
    global ignore_list
    if not ignore_list:
        ignore_list = generate_ignore_list()
    return ignore_list


def generate_ignore_list():
    file = os.path.join(get_path(), ".pk-ignore")
    if not os.path.exists(file): return []
    try:
        with open(file, 'r') as f:
            return [line.strip() for line in f if line.strip()]
    except Exception as e:
        return [f"Error {e} in reading .pk-ignore"]


@app.route("/ignore", methods=["GET"])
def ignore():
    return jsonify({"ignored_files": get_ignore_list()})


context_list = []


def get_context_list():
    global context_list
    if not context_list:
        context_list = generate_context_list()
    return context_list


def generate_context_list():
    file = os.path.join(get_path(), ".pk-context")
    if not os.path.exists(file): return []
    try:
        with open(file, 'r') as f:
            return [line.strip() for line in f if line.strip()]
    except Exception as e:
        return [f"Error {e} in reading .pk-context"]


@app.route("/context", methods=["GET"])
def context():
    return jsonify({"context_files": get_context_list()})


def passes_filter(filepath, filter_list):
    print(filepath)
    for pattern in filter_list:
        # CASE 1: file.filetype
        if (filepath == pattern) or (filepath.endswith(pattern)): return False
        # CASE 2: *.filetype
        if pattern.startswith("*"):
            if filepath.endswith(pattern[1:]): return False
        # CASE 3: directory/*
        if pattern.endswith("*"):
            if pattern[1:] in filepath: return False
        return True


if __name__ == "__main__":
    app.run(debug=True)
    observer.stop()
    observer.join()

"""
log LOOKS LIKE {"type": "STRING", 
                "path": "STRING", 
                "time": datetime.datetime.now,
                "change": EITHER None OR diff = ''.join(difflib.unified_diff(
                                            previous_content,
                                            current_content,
                                            fromfile='before_modification',
                                            tofile='after_modification'))
"""
