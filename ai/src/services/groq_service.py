import os
import logging
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

logger = logging.getLogger("SonLokma.Groq")

# .env dosyasını yükle
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

# ── API Key Kontrolü ──────────────────────────────────────────────────────────
GROQ_API_KEY = (os.getenv("GROQ_API_KEY") or "").strip()

if not GROQ_API_KEY:
    logger.warning("⚠️ GROQ_API_KEY bulunamadı! .env dosyasını kontrol et.")
    client = None
else:
    client = Groq(api_key=GROQ_API_KEY)

MAX_SISTEM_UZUNLUK = 2000
MAX_KULLANICI_UZUNLUK = 2000


def groq_cagir(sistem_mesaji: str, kullanici_mesaji: str, sicaklik: float = 0.7) -> str:
    # ── Input Validasyonu ─────────────────────────────────────────────────────
    if not sistem_mesaji or not kullanici_mesaji:
        logger.error("❌ Boş mesaj ile Groq çağrısı yapılamaz.")
        return "Hata: Mesaj boş olamaz."

    if len(sistem_mesaji) > MAX_SISTEM_UZUNLUK:
        sistem_mesaji = sistem_mesaji[:MAX_SISTEM_UZUNLUK]
        logger.warning("⚠️ Sistem mesajı kısaltıldı.")

    if len(kullanici_mesaji) > MAX_KULLANICI_UZUNLUK:
        kullanici_mesaji = kullanici_mesaji[:MAX_KULLANICI_UZUNLUK]
        logger.warning("⚠️ Kullanıcı mesajı kısaltıldı.")

    # ── Client Kontrolü ───────────────────────────────────────────────────────
    if client is None:
        logger.error("❌ Groq client başlatılamadı, API key eksik.")
        return "Servis şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin."

    # ── API Çağrısı ───────────────────────────────────────────────────────────
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": sistem_mesaji},
                {"role": "user", "content": kullanici_mesaji}
            ],
            temperature=sicaklik,
            max_tokens=512,
            timeout=30,
        )
        return completion.choices[0].message.content

    except Exception as e:
        logger.error(f"❌ Groq API hatası: {e}")
        return "Yapay zeka servisi şu an yanıt veremiyor. Lütfen tekrar deneyin."