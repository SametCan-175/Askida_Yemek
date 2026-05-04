"""
pipeline.py — Son Lokma AI Ana Motoru

Akış:
  1. Batuhan'ın API'sinden listing'leri çek (mesafe_km zaten geliyor)
  2. Metinleri işle (text_processor → TF-IDF + kategori tespiti)
  3. Skorla ve sırala (ranker)
  4. Kullanıcıya özel filtrele (recommender)
  5. Groq ile badge_text + ai_description üret (groq_service)
  6. Sonuçları Batuhan'a geri gönder (api_client → post_ai_scores)
  7. Bildirim gönder (notification → ai_oneri + stok_uyari)
"""

import logging
import json
import sys
import os

# Proje kökünü path'e ekle — nerede çalıştırılırsa çalıştırılsın importlar çalışır
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.api_client import AIListingService
from services.groq_service import groq_cagir
from services.notification import bildir_ai_oneri, bildir_stok_azaliyor
from ml.text_processor import urunleri_isle
from ml.ranker import feed_ranker
from ml.recommender import get_personalized_recommendations

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("SonLokma.Pipeline")


def groq_badge_ve_aciklama_uret(firsat: dict, kullanici: dict) -> dict:
    """
    Tek bir fırsat için Groq'tan badge_text ve ai_description üretir.
    """
    sistem = (
        "Sen 'Son Lokma' uygulamasının AI yazarısın. "
        "Sana bir ürün ve kullanıcı bilgisi verilecek. "
        "Sadece JSON döndür, başka hiçbir şey yazma:\n"
        '{"badge_text": "...", "ai_description": "..."}\n'
        "badge_text: max 3 kelime, çarpıcı etiket (örn: Günün Yıldızı)\n"
        "ai_description: max 1 cümle, kullanıcıya özel samimi öneri. Türkçe."
    )

    kullanici_mesaji = (
        f"Ürün: {firsat.get('urun', '')}\n"
        f"Kafe: {firsat.get('kafe', '')}\n"
        f"Kategori: {firsat.get('kategori', '')}\n"
        f"Açıklama: {firsat.get('aciklama', '')}\n"
        f"İndirim oranı: %{firsat.get('indirim_orani', 0)}\n"
        f"Kalan adet: {firsat.get('adet', 0)}\n"
        f"Mesafe: {firsat.get('mesafe_km', 0)} km\n"
        f"AI skoru: {firsat.get('ai_score', 0)}\n"
        f"Kullanıcı tercihleri: {', '.join(kullanici.get('tercihler', []))}"
    )

    try:
        yanit = groq_cagir(sistem, kullanici_mesaji)
        temiz = yanit.strip()
        if "```" in temiz:
            temiz = temiz.split("```")[1]
            if temiz.startswith("json"):
                temiz = temiz[4:]
        return json.loads(temiz.strip())
    except Exception as e:
        logger.warning(f"⚠️ Groq parse hatası ({firsat.get('id')}): {e}")
        return {
            "badge_text": "Fırsat",
            "ai_description": "Bu ürünü kaçırma!"
        }


def ai_pipeline_calistir(kullanici: dict) -> list:
    """
    Ana pipeline fonksiyonu.

    kullanici = {
        "id": 1,
        "lat": 41.008,
        "lon": 29.012,
        "tercihler": ["vegan", "kahve"],   # boş liste olabilir
        "ad": "Ali"                        # bildirim için (opsiyonel)
    }

    Döndürür: Batuhan'a POST edilecek liste
    [
        {
            "listing_id": 123,
            "ai_score": 0.95,
            "badge_text": "Günün Yıldızı",
            "ai_description": "Kebap seversin, bu ayran tam sana göre!"
        }
    ]
    """
    logger.info(f"🚀 Pipeline başladı — kullanıcı: {kullanici.get('id')}")

    service = AIListingService()
    kullanici_id = kullanici.get("id")
    kullanici_adi = kullanici.get("ad", "Kullanıcı")

    # ── ADIM 1: Listing'leri çek ──────────────────────────────────────────────
    ham_listeler = service.fetch_targeted_listings(
        latitude=kullanici["lat"],
        longitude=kullanici["lon"]
    )

    if not ham_listeler:
        logger.warning("⚠️ Hiç listing gelmedi, pipeline durdu.")
        return []

    logger.info(f"📦 {len(ham_listeler)} listing çekildi.")

    # ── ADIM 2: Metinleri işle (TF-IDF + kategori tespiti) ───────────────────
    islenmis = urunleri_isle(ham_listeler)
    logger.info("📝 Metinler işlendi.")

    # ── ADIM 3: Skorla ve sırala ──────────────────────────────────────────────
    skorlananlar = feed_ranker(islenmis)
    logger.info("📊 Skorlama tamamlandı.")

    # ── ADIM 3.5: Stok azalan ürünler için bildirim ───────────────────────────
    for firsat in skorlananlar:
        kalan = firsat.get("adet", 99)
        if kalan <= 2:
            bildir_stok_azaliyor(
                user_id=kullanici_id,
                firsat=firsat,
                kalan_adet=kalan
            )
            logger.info(f"⚡ Stok uyarısı gönderildi → {firsat.get('urun')} ({kalan} adet)")

    # ── ADIM 4: Kullanıcıya özel filtrele ────────────────────────────────────
    onerilenler = get_personalized_recommendations(kullanici, skorlananlar)

    # Eğer tercih eşleşmesi yoksa tüm listeyi kullan
    if not onerilenler:
        onerilenler = skorlananlar

    logger.info(f"🎯 {len(onerilenler)} kişiselleştirilmiş öneri hazır.")

    # ── ADIM 5: Groq ile badge + açıklama üret ───────────────────────────────
    sonuclar = []
    for firsat in onerilenler[:10]:
        groq_cikti = groq_badge_ve_aciklama_uret(firsat, kullanici)

        firsat_sonuc = {
            "listing_id": firsat.get("listing_id") or firsat.get("id"),
            "ai_score": firsat.get("ai_score", 0),
            "badge_text": groq_cikti.get("badge_text", "Fırsat"),
            "ai_description": groq_cikti.get("ai_description", ""),
        }
        sonuclar.append(firsat_sonuc)

        # ── ADIM 5.5: En iyi öneri için kişisel bildirim gönder ──────────────
        # Sadece ilk (en iyi skorlu) ürün için bildirim gönderiyoruz
        if len(sonuclar) == 1:
            bildir_ai_oneri(
                user_id=kullanici_id,
                kullanici_adi=kullanici_adi,
                firsat={
                    **firsat,
                    "listing_id": firsat.get("id"),
                    "ai_description": groq_cikti.get("ai_description", "")
                }
            )
            logger.info(f"🔔 AI öneri bildirimi gönderildi → user:{kullanici_id}")

    logger.info(f"✨ {len(sonuclar)} ürün için Groq metni üretildi.")

    # ── ADIM 6: Batuhan'a geri gönder ────────────────────────────────────────
    basari = service.post_ai_scores(sonuclar)

    if basari:
        logger.info("✅ Pipeline tamamlandı, sonuçlar backend'e iletildi.")
    else:
        logger.error("❌ Backend'e gönderim başarısız.")

    return sonuclar


# ── Test çalıştırma ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    test_kullanici = {
        "id": 1,
        "ad": "Samet",
        "lat": 40.9612,
        "lon": 29.07,
        "tercihler": ["vegan", "kahve"]
    }

    sonuclar = ai_pipeline_calistir(test_kullanici)

    print("\n" + "=" * 55)
    print("🤖 PIPELINE ÇIKTISI")
    print("=" * 55)
    for s in sonuclar:
        print(f"\n  listing_id    : {s['listing_id']}")
        print(f"  ai_score      : {s['ai_score']}")
        print(f"  badge_text    : {s['badge_text']}")
        print(f"  ai_description: {s['ai_description']}")