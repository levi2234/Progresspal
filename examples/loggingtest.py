from ProgressPal import Plog
import time
logger = Plog(host = "127.0.0.1")

for i in range(40):
    logger.LOG(f"Dit is een voorbeeldLOGbericht ")
    logger.CRITICAL(f"Dit is een voorbeeldCRITICALbericht ")
    logger.ERROR(f"Dit is een voorbeeldERRORbericht ")
    logger.WARNING(f"Dit is een voorbeeldWARNINGbericht ")
    logger.INFO(f"Dit is een voorbeeldINFObericht ")
    logger.DEBUG(f"Dit is een voorbeeldDEBUGbericht ")

    
    time.sleep(1)