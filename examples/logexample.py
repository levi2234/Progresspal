from ProgressPal import Plog
import time
logger = Plog()

for i in range(40):
    logger.LOG(f"Dit is een voorbeeldLOGbericht ")
    logger.CRITICAL(f"Dit is een voorbeeldCRITICALbericht ")
    logger.ERROR(f"Dit is een voorbeeldERRORbericht ")
    logger.WARNING(f"Dit is een voorbeeldWARNINGbericht ")
    logger.INFO(f"Dit is een voorbeeldINFObericht ")
    logger.DEBUG(f"Dit is een voorbeeldDEBUGbericht ")

    
    time.sleep(0.1)