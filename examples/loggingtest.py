from ProgressPal import Plog
import time
from joblib import Parallel, delayed

    

if __name__ == '__main__':
    #BASIC USAGE
    logger = Plog()


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
        
        
    def logtest(id= 0):
        
        #BASIC USAGE
        logger = Plog()
        
        for i in range(40):
            logger.INFO(f"Dit is een voorbeeld INFO bericht {id}") 
            logger.DEBUG(f"Dit is een voorbeeld DEBUG bericht {id} ")
            logger.LOG(f"Dit is een voorbeeld LOG bericht {id}")
            logger.CRITICAL(f"Dit is een voorbeeld CRITICAL bericht {id}")
            logger.ERROR(f"Dit is een voorbeeld ERROR bericht {id}")
            logger.WARNING(f"Dit is een voorbeeld WARNING bericht {id}")
            time.sleep(1)
                
    # #JOBLIBTEST
    Parallel(n_jobs=5)(delayed(logtest)() for i in range(10))

    # #THREADING EXAMPLE
    from threading import Thread
    threads = []
    for i in range(10):
        thread = Thread(target=logtest, args=(i,))
        threads.append(thread)
        thread.start()
        
    for thread in threads:
        thread.join()
        
    #CONCURRENT FUTURES EXAMPLE
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(logtest, range(10))
    
    
    
    #PROCESS EXAMPLE
    from multiprocessing import Process
    processes = []
    for i in range(10):
        process = Process(target=logtest, args=(i,))
        processes.append(process)
        process.start()

    for process in processes:
        process.join()
    



