import aiohttp
import asyncio
import time
import os
import inspect

async def update_progress(message, level, timestamp, filename, lineno, host="127.0.0.1", port=5000):
    url = f"http://{host}:{port}/update_logs"
    data = { 
        "message": message,
        "level": level,
        "timestamp": timestamp,
        "filename": filename,
        "lineno": lineno
    }
    
    async with aiohttp.ClientSession() as session:
        for attempt in range(3):  # Retry mechanism
            try:
                async with session.post(url, json=data) as response:
                    if response.status == 200:
                        return
            except aiohttp.ClientError as e:
                print(f"Attempt {attempt + 1} failed: {e}")
            await asyncio.sleep(1)  # Wait before retrying

class Plog:
    def __init__(self, host="127.0.0.1", port=5000):
        self.port = port
        self.host = host
        self.filename = os.path.basename(inspect.stack()[1].filename)

    async def _LOG(self, message, lineno=None):
        level = "LOG"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def LOG(self, message):
        
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._LOG(message,lineno=lineno))


    async def _CRITICAL(self, message, lineno=None):
        level = "CRITICAL"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)
        
    def CRITICAL(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._CRITICAL(message,lineno=lineno))
        
    async def _ERROR(self, message, lineno=None):
        level = "ERROR"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)
        
    def ERROR(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._ERROR(message,lineno=lineno))
        
    async def _WARNING(self, message, lineno=None):
        level = "WARNING"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)
        
    def WARNING(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._WARNING(message,lineno=lineno))
        
    async def _INFO(self, message, lineno=None):
        level = "INFO"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)
        
    def INFO(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._INFO(message,lineno=lineno))
        
    async def _DEBUG(self, message, lineno=None):
        level = "DEBUG"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)
        
    def DEBUG(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._DEBUG(message,lineno=lineno))
        
    async def _CRITICAL(self, message, lineno=None):
        level = "CRITICAL"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)
        
    def CRITICAL(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._CRITICAL(message,lineno=lineno))
        
    async def _FATAL(self, message, lineno=None):
        level = "FATAL"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)
        
    def FATAL(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._FATAL(message,lineno=lineno))
        
    
    async def _EXCEPTION(self, message, lineno=None):
        level = "EXCEPTION"
        timestamp = time.ctime()
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)
        
    def EXCEPTION(self, message):
        frame = inspect.stack()[1]
        lineno = frame.lineno
        asyncio.run(self._EXCEPTION(message,lineno=lineno))
    