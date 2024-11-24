import random

from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner import monitor
from chat import interact

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

(observer, event_handler) = monitor()

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
    if log:
        set_live(True)
        event_handler.update()  # UPDATE EVENT HANDLER (PUSHES LOG TO event_handler.HISTORY & CLEARS event_handler.LOG)
        message = f"CHANGE OF TYPE {log['type']} IN FILE {log['path']} AT {log['time']}"
        if log['changes']: message += " " + "CHANGES: " + log['changes']
        chat_log.append({"role": "system", "parts": message})
    else:
        pass # THIS MUST CHANGE

    return jsonify({"log": log})  # RETURN JSONIFIED LOG

"""
user clicks scan button ("/scan" endpoint) : set up-to-date True

when (up-to-date == True) **TRIGGERED UPON SCAN

    *ASSISTANT* SHOULD GET CHANGES: LOG OF CREATE/DELETE AND A TEXT VERSION OF CHANGED DOCUMENTS
    *ASSISTANT* GETS NOT USER INPUT
    *ASSISTANT* IS TOLD TO SIMPLY STATE ("PRINT") CHANGES IN SPECIFIED FORMAT
    
    set up-to-date False
        
when (up-to-date == False) **DEFAULT STATE

    *ASSISTANT* SHOULD NOT GET CHANGES
    *ASSISTANT* GETS USER INPUT
"""


@app.route("/chat", methods=["POST"])
def chat():
    global chat_log

    # IF THE DIRECTORY HAS UPDATES (AND THE USER HAS CLICKED REFRESH BUTTON)
    if get_live():
        # RESPOND WITH DETECTED CHANGES
        set_live(state=False)  # RESET STATE
        response = interact(messages=chat_log)

    else:
        # USER INPUT
        message = request.json.get("message")
        chat_log.append({"role": "user", "parts": message})
        response = interact(chat_log)

    if response:
        chat_log.append({"role": "assistant", "parts": response})
    # UPDATE GLOBAL CHAT LOG
    print(chat_log)
    print(get_live())
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