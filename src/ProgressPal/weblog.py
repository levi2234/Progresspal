import requests
import time
import os
import inspect
import threading

def update_progress(message, level, timestamp, filename, lineno, host="127.0.0.1", port=5000):
    url = f"http://{host}:{port}/update_logs"
    data = { 
        "message": message,
        "level": level,
        "timestamp": timestamp,
        "filename": filename,
        "lineno": lineno
    }

    for attempt in range(3):  # Retry mechanism
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                return
        except requests.RequestException as e:
            pass
        time.sleep(1)  # Wait before retrying

class Plog:
    def __init__(self, host="127.0.0.1", port=5000):
        self.port = port
        self.host = host
        self.filename = os.path.basename(inspect.stack()[1].filename)
        self.lock = threading.Lock()  # Thread safety for shared state

    def LOG(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        level = "LOG"
        timestamp = time.ctime()
        threading.Thread(
            target=update_progress, 
            args=(message, level, timestamp, self.filename, lineno, self.host, self.port), 
            daemon=True
        ).start()
        
    def INFO(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        level = "INFO"
        timestamp = time.ctime()
        threading.Thread(
            target=update_progress, 
            args=(message, level, timestamp, self.filename, lineno, self.host, self.port), 
            daemon=True
        ).start()
        
    def DEBUG(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        level = "DEBUG"
        timestamp = time.ctime()
        threading.Thread(
            target=update_progress, 
            args=(message, level, timestamp, self.filename, lineno, self.host, self.port), 
            daemon=True
        ).start()
        
    def WARNING(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        level = "WARNING"
        timestamp = time.ctime()
        threading.Thread(
            target=update_progress, 
            args=(message, level, timestamp, self.filename, lineno, self.host, self.port), 
            daemon=True
        ).start()
        
    def ERROR(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        level = "ERROR"
        timestamp = time.ctime()
        threading.Thread(
            target=update_progress, 
            args=(message, level, timestamp, self.filename, lineno, self.host, self.port), 
            daemon=True
        ).start()
        
    def CRITICAL(self, message):
        
        frame = inspect.stack()[1]
        lineno = frame.lineno
        level = "CRITICAL"
        timestamp = time.ctime()
        threading.Thread(
            target=update_progress, 
            args=(message, level, timestamp, self.filename, lineno, self.host, self.port), 
            daemon=True
        ).start()
        
