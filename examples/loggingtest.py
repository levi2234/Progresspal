from ProgressPal import Plog
import time
logger = Plog(host = "https://rhsq9n8h-5000.euw.devtunnels.ms/")

for i in range(40):
    logger.INFO(f"Dit is een voorbeeld INFO bericht ")
    
    logger.DEBUG(f"Dit is een voorbeeld DEBUG bericht ")
    
    logger.INFO(f"Dit is een voorbeeld INFO bericht ")
    
    logger.DEBUG(f"Dit is een voorbeeld DEBUG bericht ")
    logger.LOG(f"Dit is een voorbeeld LOG bericht ")
    logger.CRITICAL(f"Dit is een voorbeeld CRITICAL bericht ")
    logger.ERROR(f"Dit is een voorbeeld ERROR bericht ")
    logger.WARNING(f"Dit is een voorbeeld WARNING bericht ")


    time.sleep(1)