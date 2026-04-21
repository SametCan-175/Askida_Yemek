import logging
import colorama # Renkli çıktılar için (pip install colorama)
from colorama import Fore, Style

colorama.init()

def get_logger(name="ResQFood-AI"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        # Konsol çıktısı için handler
        c_handler = logging.StreamHandler()

        # Log formatı (Zaman - İsim - Seviye - Mesaj)
        fmt = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s', datefmt='%H:%M:%S')
        c_handler.setFormatter(fmt)

        logger.addHandler(c_handler)

    return logger

# Kolay kullanım için bir instance
log = get_logger()