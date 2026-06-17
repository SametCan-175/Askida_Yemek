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
import re
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

# ── Güvenlik Sabitleri ────────────────────────────────────────────────────────
MAX_BADGE_UZUNLUK = 30       # badge_text max karakter
MAX_ACIKLAMA_UZUNLUK = 200   # ai_description max karakter
IZIN_VERILEN_BADGE_REGEX = re.compile(r"^[\w\s\-ÇçĞğİıÖöŞşÜü!%]+$")  # Sadece harf/rakam/boşluk


def _metin_temizle(metin: str, max_uzunluk: int) -> str:
    """
    Groq'tan gelen metni kısalt ve tehlikeli karakterleri temizle.
    XSS / injection önlemi.
    """
    if not isinstance(metin, str):
        return ""
    # HTML etiketlerini kaldır
    temiz = re.sub(r"<[^>]+>", "", metin)
    # Başındaki/sonundaki boşlukları kaldır
    temiz = temiz.strip()
    # Maksimum uzunluğa kısalt
    return temiz[:max_uzunluk]


def _json_parse_guvenli(yanit: str) -> dict:
    """
    Groq'tan gelen yanıtı güvenli şekilde JSON'a çevirir.

    Groq bazen şu formatlardan birini döndürür:
      1. Düz JSON:           {"badge_text": "...", "ai_description": "..."}
      2. Markdown kod bloğu: ```json\n{...}\n```
      3. Açıklama + JSON:    "İşte sonuç:\n{...}"

    Hiçbiri parse edilemezse fallback döner, servis asla çökmez.
    """
    if not yanit or not isinstance(yanit, str):
        raise ValueError("Groq'tan boş yanıt geldi")

    temiz = yanit.strip()

    # Format 2: ```json ... ``` bloğunu ayıkla
    if "```" in temiz:
        parcalar = temiz.split("```")
        for parca in parcalar:
            parca = parca.strip()
            if parca.startswith("json"):
                parca = parca[4:].strip()
            if parca.startswith("{"):
                temiz = parca
                break

    # Format 3: Metin içindeki ilk JSON nesnesini bul
    if not temiz.startswith("{"):
        eslesen = re.search(r"\{.*\}", temiz, re.DOTALL)
        if eslesen:
            temiz = eslesen.group(0)

    return json.loads(temiz)


def groq_badge_ve_aciklama_uret(firsat: dict, kullanici: dict) -> dict:
    """
    Tek bir fırsat için Groq'tan badge_text ve ai_description üretir.
    Güvenli parse + çıktı doğrulama içerir.
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

    fallback = {
        "badge_text": "Fırsat",
        "ai_description": "Bu ürünü kaçırma!"
    }

    try:
        yanit = groq_cagir(sistem, kullanici_mesaji)
        veri = _json_parse_guvenli(yanit)

        # ── Çıktı doğrulama ───────────────────────────────────────────────────
        badge = _metin_temizle(veri.get("badge_text", ""), MAX_BADGE_UZUNLUK)
        aciklama = _metin_temizle(veri.get("ai_description", ""), MAX_ACIKLAMA_UZUNLUK)

        # badge_text boş geldiyse fallback kullan
        if not badge:
            badge = fallback["badge_text"]
        if not aciklama:
            aciklama = fallback["ai_description"]

        return {"badge_text": badge, "ai_description": aciklama}

    except json.JSONDecodeError as e:
        logger.warning(f"⚠️ Groq JSON parse hatası ({firsat.get('id')}): {e}")
        return fallback
    except Exception as e:
        logger.warning(f"⚠️ Groq genel hata ({firsat.get('id')}): {e}")
        return fallback


def _kullanici_konum_dogrula(kullanici: dict) -> tuple[float, float]:
    """
    Kullanıcıdan lat/lon alır. Eksik veya geçersizse ValueError fırlatır.
    """
    try:
        lat = float(kullanici["lat"])
        lon = float(kullanici["lon"])
    except (KeyError, TypeError, ValueError) as e:
        raise ValueError(f"Kullanıcı konumu eksik veya geçersiz: {e}")

    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        raise ValueError(f"Geçersiz koordinat: lat={lat}, lon={lon}")

    return lat, lon


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

    # ── ADIM 0: Kullanıcı konum doğrulama ────────────────────────────────────
    try:
        lat, lon = _kullanici_konum_dogrula(kullanici)
    except ValueError as e:
        logger.error(f"❌ Konum hatası: {e}")
        return []

    service = AIListingService()
    kullanici_id = kullanici.get("id")
    kullanici_adi = kullanici.get("ad", "Kullanıcı")

    # ── ADIM 1: Listing'leri çek ──────────────────────────────────────────────
    try:
        ham_listeler = service.fetch_targeted_listings(latitude=lat, longitude=lon)
    except Exception as e:
        logger.error(f"❌ Listing çekme hatası: {e}")
        return []

    if not ham_listeler:
        logger.warning("⚠️ Hiç listing gelmedi, pipeline durdu.")
        return []

    logger.info(f"📦 {len(ham_listeler)} listing çekildi.")

    # ── ADIM 2: Metinleri işle (TF-IDF + kategori tespiti) ───────────────────
    try:
        islenmis = urunleri_isle(ham_listeler)
        logger.info("📝 Metinler işlendi.")
    except Exception as e:
        logger.error(f"❌ Metin işleme hatası: {e}")
        islenmis = ham_listeler  # Hata olursa ham listeyle devam et

    # ── ADIM 3: Skorla ve sırala ──────────────────────────────────────────────
    try:
        skorlananlar = feed_ranker(islenmis)
        logger.info("📊 Skorlama tamamlandı.")
    except Exception as e:
        logger.error(f"❌ Skorlama hatası: {e}")
        skorlananlar = islenmis  # Hata olursa sırasız listeyle devam et

    # ── ADIM 3.5: Stok azalan ürünler için bildirim ───────────────────────────
    for firsat in skorlananlar:
        kalan = firsat.get("adet", 99)
        if kalan <= 2:
            try:
                bildir_stok_azaliyor(
                    user_id=kullanici_id,
                    firsat=firsat,
                    kalan_adet=kalan
                )
                logger.info(f"⚡ Stok uyarısı gönderildi → {firsat.get('urun')} ({kalan} adet)")
            except Exception as e:
                logger.warning(f"⚠️ Stok bildirimi gönderilemedi: {e}")

    # ── ADIM 4: Kullanıcıya özel filtrele ────────────────────────────────────
    try:
        onerilenler = get_personalized_recommendations(kullanici, skorlananlar)
        if not onerilenler:
            onerilenler = skorlananlar
        logger.info(f"🎯 {len(onerilenler)} kişiselleştirilmiş öneri hazır.")
    except Exception as e:
        logger.error(f"❌ Kişiselleştirme hatası: {e}")
        onerilenler = skorlananlar

    # ── ADIM 5: Groq ile badge + açıklama üret ───────────────────────────────
    sonuclar = []
    for firsat in onerilenler[:10]:
        # Her ürün için Groq hatası diğerlerini etkilemez
        groq_cikti = groq_badge_ve_aciklama_uret(firsat, kullanici)

        firsat_sonuc = {
            "listing_id": firsat.get("listing_id") or firsat.get("id"),
            "ai_score": firsat.get("ai_score", 0),
            "badge_text": groq_cikti.get("badge_text", "Fırsat"),
            "ai_description": groq_cikti.get("ai_description", ""),
        }
        sonuclar.append(firsat_sonuc)

        # ── ADIM 5.5: En iyi öneri için kişisel bildirim gönder ──────────────
        if len(sonuclar) == 1:
            try:
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
            except Exception as e:
                logger.warning(f"⚠️ AI öneri bildirimi gönderilemedi: {e}")

    logger.info(f"✨ {len(sonuclar)} ürün için Groq metni üretildi.")

    # ── ADIM 6: Batuhan'a geri gönder ────────────────────────────────────────
    try:
        basari = service.post_ai_scores(sonuclar)
        if basari:
            logger.info("✅ Pipeline tamamlandı, sonuçlar backend'e iletildi.")
        else:
            logger.error("❌ Backend'e gönderim başarısız.")
    except Exception as e:
        logger.error(f"❌ Backend gönderim hatası: {e}")

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