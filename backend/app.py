from flask import Flask, request, jsonify
from scanner import monitor
from chat import interact

app = Flask(__name__)
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
    log = event_handler.log  # GET LOG FROM EVENT HANDLER
    if log:
        set_live(True)
        event_handler.update()  # UPDATE EVENT HANDLER (PUSHES LOG TO event_handler.HISTORY & CLEARS event_handler.LOG)
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
        log = event_handler.history[-1] if event_handler.history else None  # USE MOST RECENT LOG FROM HISTORY
        set_live(state=False)  # RESET STATE

        if log:
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
            message = f"CHANGE OF TYPE {log['type']} IN FILE {log['path']} AT {log['time']}"
            if log['changes']: message += " " + "CHANGES: " + log['changes']

            chat_log.append({"role": "system", "content": message})

            response = interact(messages=chat_log)
        else:
            response = None
    else:
        # USER INPUT
        message = request.json.get("message")
        chat_log.append({"role": "user", "content": message})
        response = interact(chat_log)

    if response:
        chat_log.append({"role": "assistant", "content": response})
    # UPDATE GLOBAL CHAT LOG
    return jsonify({"response": response})


if __name__ == "__main__":
    app.run(debug=True)
    observer.stop()
    observer.join()
