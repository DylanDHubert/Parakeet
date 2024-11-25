from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import difflib
import datetime


class ChangeLogger(FileSystemEventHandler):
    def __init__(self):
        self.history = []
        self.log = []
        self.file_snapshots = {}

    def on_modified(self, event):
        if not event.is_directory:
            if not self.valid(event.src_path):
                return

            try:
                # READ CURRENT CONTENTS OF FILE
                with open(event.src_path, 'r') as file:
                    current_content = file.readlines()

                # GET PREVIOUS FILE CONTENT IF AVAILIBLE
                previous_content = self.file_snapshots.get(event.src_path, [])

                # SAVE UPDATED CONTENT
                self.file_snapshots[event.src_path] = current_content

                # COMPUTER DIFFERENCE
                diff = ''.join(difflib.unified_diff(
                    previous_content,
                    current_content,
                    fromfile='before_modification',
                    tofile='after_modification'
                ))

                # LOG DIFFERENCE
                change = {"type":"MODIFY",
                          "path": event.src_path,
                          "time": datetime.datetime.now(),
                          "changes": diff}
                self.log.append(change)
                print(f"FILE MODIFIED: {event.src_path} AT: {datetime.datetime.now()}")

            except Exception as e:
                print(f"Error reading file {event.src_path}: {e}")

    def on_created(self, event):
        if not event.is_directory:
            if not self.valid(event.src_path): return
            change = {"type":"CREATE",
                      "path": event.src_path,
                      "time": datetime.datetime.now(),
                      "changes": None}
            self.log.append(change)
            print(f"FILE CREATED: {event.src_path} AT: {datetime.datetime.now()}")

    def on_deleted(self, event):
        if not event.is_directory:
            if not self.valid(event.src_path): return
            change = {"type": "DELETE",
                      "path": event.src_path,
                      "time": datetime.datetime.now(),
                      "changes": None}
            self.log.append(change)
            print(f"FILE DELETED: {event.src_path} AT: {datetime.datetime.now()}")

    def update(self):
        self.history.append(self.log)
        self.log = []

    def valid(self, path):
        if path[-1] == "~":
            return False
        elif path.endswith(".DS_Store"):  return False
        else:
            return True


def monitor(path="."):
    event_handler = ChangeLogger()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    return observer, event_handler
