from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner import monitor
from chat import interact
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

path = "../"

(observer, event_handler) = monitor(path=path)

live = False
chat_log = []


def set_live(state: bool):
    global live
    live = state


def get_live():
    global live
    return live


@app.route("/chat-log", methods=["GET"])
def get_chat_log():
    global chat_log
    return jsonify(chat_log)


# SCAN FOR CHANGES
@app.route("/scan", methods=["GET"])
def scan():
    global chat_log
    log = event_handler.log  # GET LOG FROM EVENT HANDLER
    print(event_handler.log, event_handler.history)
    if log:
        message = ""
        for event in log:
            message += f"CHANGE OF TYPE {event['type']} IN FILE {event['path']} AT {event['time']}"
            # TODO ADD ".IGNORE" "FILTERING" SYSTEM AND FILTER BEFORE SHOWING CHANGE, IE. DON'T SHOW CHANGE IN .env FILE
            if event['changes']: message += " " + "CHANGES: " + event['changes']
        message += "WHEN ASKED GENERICALLY ABOUT THIS UPDATE, RESPOND IN ONLY 1 OR TWO SENTENCES."
        message += "<FOR FRONTEND: DO NOT DISPLAY>"
        chat_log.append({"role": "user", "parts": message})
        event_handler.update()  # UPDATE EVENT HANDLER (PUSHES LOG TO event_handler.HISTORY & CLEARS event_handler.LOG)
    else:
        print("ERROR")
        pass  # THIS MUST CHANGE

    return jsonify({"log": log})  # RETURN JSONIFIED LOG


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
