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

    async def _LOG(self, message):
        level = "LOG"
        timestamp = time.ctime()
        frame = inspect.currentframe().f_back
        lineno = frame.f_lineno
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def LOG(self, message):
        asyncio.run(self._LOG(message))

    async def _DEBUG(self, message):
        level = "DEBUG"
        timestamp = time.ctime()
        frame = inspect.currentframe().f_back
        lineno = frame.f_lineno
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def DEBUG(self, message):
        asyncio.run(self._DEBUG(message))

    async def _INFO(self, message):
        level = "INFO"
        timestamp = time.ctime()
        frame = inspect.currentframe().f_back
        lineno = frame.f_lineno
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def INFO(self, message):
        asyncio.run(self._INFO(message))

    async def _WARNING(self, message):
        level = "WARNING"
        timestamp = time.ctime()
        frame = inspect.currentframe().f_back
        lineno = frame.f_lineno
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def WARNING(self, message):
        asyncio.run(self._WARNING(message))

    async def _ERROR(self, message):
        level = "ERROR"
        timestamp = time.ctime()
        frame = inspect.currentframe().f_back
        lineno = frame.f_lineno
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def ERROR(self, message):
        asyncio.run(self._ERROR(message))

    async def _CRITICAL(self, message):
        level = "CRITICAL"
        timestamp = time.ctime()
        frame = inspect.currentframe().f_back
        lineno = frame.f_lineno
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def CRITICAL(self, message):
        asyncio.run(self._CRITICAL(message))

    async def _EXCEPTION(self, message):
        level = "EXCEPTION"
        timestamp = time.ctime()
        frame = inspect.currentframe().f_back
        lineno = frame.f_lineno
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def EXCEPTION(self, message):
        asyncio.run(self._EXCEPTION(message))

    async def _FATAL(self, message):
        level = "FATAL"
        timestamp = time.ctime()
        frame = inspect.currentframe().f_back
        lineno = frame.f_lineno
        await update_progress(message, level, timestamp, self.filename, lineno, self.host, self.port)

    def FATAL(self, message):
        asyncio.run(self._FATAL(message))