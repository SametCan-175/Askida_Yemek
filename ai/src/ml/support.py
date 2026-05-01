"""
support_agent.py — Son Lokma Canlı Destek Ajanı

Kullanıcı uygulamada "Canlı Destek" butonuna basar,
chat ekranı açılır, AI ile konuşur.

Özellikler:
  - Konuşma geçmişini hatırlar (çok turlu diyalog)
  - Sipariş durumu, rezervasyon, genel sorular
  - Şikayet ve geri bildirim yönetimi
  - Türkçe, samimi ve kısa yanıtlar

Batuhan'ın çağıracağı fonksiyon:
  from support_agent import destek_ajani_yanit
  yanit = destek_ajani_yanit(user_id, mesaj, konusma_gecmisi)
"""

import os
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"
APP_ADI = "Son Lokma"

logger = logging.getLogger("SonLokma.Destek")

# Ajanın kişiliği ve kuralları
SISTEM_PROMPTU = f"""Sen '{APP_ADI}' uygulamasının canlı destek asistanısın. 
Adın 'Lokma'.

Görevin:
- Kullanıcıların sorularını samimi, kısa ve net şekilde yanıtlamak
- Sipariş, rezervasyon ve uygulama hakkında yardımcı olmak
- Şikayetleri anlayışla karşılamak ve çözüm sunmak

Kurallar:
- Kullanıcı hangi dilde yazarsa o dilde yanıt ver
- Türkçe yazarsa Türkçe, İngilizce yazarsa İngilizce, başka bir dilde yazarsa o dilde konuş
- Maksimum 3 cümle yaz, uzun cevaplar verme
- Bilmediğin şeyleri uydurma, "Bu konuda size daha iyi yardımcı olabilmek için ekibimize iletiyorum" de
- Samimi ve sıcak ol, resmi değil
- Emoji kullanabilirsin ama abartma

Yapabileceklerin:
- Rezervasyon durumu hakkında bilgi vermek
- Uygulama kullanımını açıklamak  
- Şikayetleri dinlemek ve yönlendirmek
- İptal ve iade süreçlerini açıklamak
- Fırsatlar ve indirimler hakkında bilgi vermek

Yapamadıklarında:
- Doğrudan veritabanına erişim yok
- Ödeme işlemi yapamazsın
- Rezervasyon iptal edemezsin (yönlendir)
"""


def destek_ajani_yanit(
    user_id: int,
    yeni_mesaj: str,
    konusma_gecmisi: list = None
) -> dict:
    """
    Kullanıcının mesajına yanıt üretir.

    Parametreler:
        user_id: Kullanıcı ID'si (loglama için)
        yeni_mesaj: Kullanıcının yazdığı mesaj
        konusma_gecmisi: Önceki mesajların listesi
            Format: [
                {"rol": "kullanici", "mesaj": "Siparişim nerede?"},
                {"rol": "asistan", "mesaj": "Rezervasyonunuz onaylandı..."},
                ...
            ]

    Döndürür:
        {
            "yanit": "Asistanın yanıtı",
            "guncellenmis_gecmis": [...] // Frontend bunu saklayıp bir sonraki istekte gönderir
        }
    """
    if konusma_gecmisi is None:
        konusma_gecmisi = []

    logger.info(f"💬 Destek isteği — user:{user_id} mesaj:'{yeni_mesaj[:50]}...'")

    # Geçmişi Groq formatına çevir
    mesajlar = [{"role": "system", "content": SISTEM_PROMPTU}]

    for gecmis in konusma_gecmisi:
        rol = gecmis.get("rol", "")
        icerik = gecmis.get("mesaj", "")

        if rol == "kullanici":
            mesajlar.append({"role": "user", "content": icerik})
        elif rol == "asistan":
            mesajlar.append({"role": "assistant", "content": icerik})

    # Yeni mesajı ekle
    mesajlar.append({"role": "user", "content": yeni_mesaj})

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=mesajlar,
            temperature=0.7,
            max_tokens=256,
        )

        yanit = response.choices[0].message.content.strip()
        logger.info(f"✅ Yanıt üretildi — user:{user_id}")

        # Geçmişi güncelle
        guncellenmis_gecmis = konusma_gecmisi.copy()
        guncellenmis_gecmis.append({"rol": "kullanici", "mesaj": yeni_mesaj})
        guncellenmis_gecmis.append({"rol": "asistan", "mesaj": yanit})

        # Geçmiş çok uzarsa son 20 mesajı tut (token tasarrufu)
        if len(guncellenmis_gecmis) > 20:
            guncellenmis_gecmis = guncellenmis_gecmis[-20:]

        return {
            "yanit": yanit,
            "guncellenmis_gecmis": guncellenmis_gecmis
        }

    except Exception as e:
        logger.error(f"❌ Destek ajanı hatası — user:{user_id} hata:{e}")
        return {
            "yanit": "Üzgünüm, şu an teknik bir sorun yaşıyorum. Lütfen birkaç dakika sonra tekrar deneyin. 🙏",
            "guncellenmis_gecmis": konusma_gecmisi
        }


# ── Test çalıştırma ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("🤖 LOKMA — Canlı Destek Ajanı Testi")
    print("=" * 55)
    print("Çıkmak için 'q' yaz\n")

    gecmis = []
    user_id = 1

    while True:
        kullanici_mesaji = input("Sen: ").strip()

        if kullanici_mesaji.lower() == "q":
            print("Görüşmek üzere! 👋")
            break

        if not kullanici_mesaji:
            continue

        sonuc = destek_ajani_yanit(
            user_id=user_id,
            yeni_mesaj=kullanici_mesaji,
            konusma_gecmisi=gecmis
        )

        gecmis = sonuc["guncellenmis_gecmis"]
        print(f"\nLokma: {sonuc['yanit']}\n")