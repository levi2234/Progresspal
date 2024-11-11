from ProgressPal import Plog
import time
logger = Plog(host = "127.0.0.1")

for i in range(40):
    logger.LOG(f"Dit is een voorbeeld LOG bericht ")
    logger.CRITICAL(f"Dit is een voorbeeld CRITICAL bericht ")
    logger.ERROR(f"Dit is een voorbeeld ERROR bericht ")
    logger.WARNING(f"Dit is een voorbeeld WARNING bericht ")
    logger.INFO(f"Dit is een voorbeeld INFO bericht ")
    logger.DEBUG(f"Dit is een voorbeeld DEBUG bericht ")

    
    time.sleep(1)