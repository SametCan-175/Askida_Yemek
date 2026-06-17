import logging
import colorama
from colorama import Fore, Style

colorama.init()

def get_logger(name="ResQFood-AI"):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        # 1. Terminale Yazdırma (Mevcut kodun)
        c_handler = logging.StreamHandler()
        fmt = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s', datefmt='%H:%M:%S')
        c_handler.setFormatter(fmt)
        logger.addHandler(c_handler)

        # 2. DOSYAYA KAYDETME (Eksik olan kısım burasıydı)
        f_handler = logging.FileHandler("app.log", encoding="utf-8")
        f_handler.setFormatter(fmt)
        logger.addHandler(f_handler)

    return logger

log = get_logger()

# BU SATIRI EKLE (Test etmek için)
if __name__ == "__main__":
    log.info("Test mesajı: Log dosyası şu an oluşturulmuş olmalı!")