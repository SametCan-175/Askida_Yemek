"""
notification.py — Son Lokma Bildirim Merkezi
"""

import logging
import requests
from datetime import datetime

logger = logging.getLogger("SonLokma.Notification")

BACKEND_URL = "http://127.0.0.1:8000"
BILDIRIM_ENDPOINT = f"{BACKEND_URL}/notifications/send"


def _bildirim_gonder(user_id: int, baslik: str, mesaj: str, tip: str, ekstra: dict = None):
    payload = {
        "user_id": user_id,
        "title": baslik,
        "body": mesaj,
        "listing_id": (ekstra or {}).get("listing_id"),
        "ai_score": str((ekstra or {}).get("ai_score", "")) or None,
        "badge_text": (ekstra or {}).get("badge_text") or (ekstra or {}).get("rozet_id"),
    }

    try:
        response = requests.post(BILDIRIM_ENDPOINT, json=payload)
        response.raise_for_status()
        logger.info(f"🔔 Bildirim gönderildi → user:{user_id} tip:{tip}")
        return True
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Bildirim gönderilemedi → user:{user_id} tip:{tip} hata:{e}")
        return False


# ─────────────────────────────────────────────────────────────────────────────
# 1. AI TABANLı KİŞİSELLEŞTİRİLMİŞ BİLDİRİMLER
# ─────────────────────────────────────────────────────────────────────────────

def bildir_ai_oneri(user_id: int, kullanici_adi: str, firsat: dict):
    urun = firsat.get("urun", "")
    kafe = firsat.get("kafe", "")
    ai_description = firsat.get("ai_description", "")
    indirim = firsat.get("indirim_orani", 0)

    baslik = "🍽️ Sana Özel Fırsat!"
    mesaj = ai_description if ai_description else f"{kafe}'da {urun} — %{indirim} indirim!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="ai_oneri",
        ekstra={
            "listing_id": firsat.get("listing_id"),
            "ai_score": firsat.get("ai_score"),
            "badge_text": firsat.get("badge_text"),
        }
    )


def bildir_gunun_firsati(user_id: int, firsat: dict, kart_metni: str):
    baslik = "🔥 Günün Fırsatı Geldi!"
    mesaj = kart_metni if kart_metni else f"{firsat.get('urun')} — kaçırma!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="gunun_firsati",
        ekstra={
            "listing_id": firsat.get("id"),
            "ai_score": firsat.get("firsat_skoru"),
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. ROZET BİLDİRİMLERİ
# ─────────────────────────────────────────────────────────────────────────────

def bildir_rozet(user_id: int, kullanici_adi: str, rozet: dict, kutlama_mesaji: str):
    baslik = f"{rozet['emoji']} Yeni Rozet Kazandın!"
    mesaj = kutlama_mesaji if kutlama_mesaji else f"{rozet['ad']} rozetini kazandın!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="rozet",
        ekstra={
            "rozet_id": rozet.get("id"),
            "badge_text": f"{rozet.get('emoji')} {rozet.get('ad')}",
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# 3. REZERVASYON BİLDİRİMLERİ
# ─────────────────────────────────────────────────────────────────────────────

def bildir_rezervasyon_onaylandi(user_id: int, rezervasyon: dict):
    urun = rezervasyon.get("urun", "")
    kafe = rezervasyon.get("kafe", "")

    return _bildirim_gonder(
        user_id=user_id,
        baslik="✅ Rezervasyonun Onaylandı!",
        mesaj=f"{kafe}'daki {urun} siparişin onaylandı. Yemeğin seni bekliyor!",
        tip="rezervasyon",
        ekstra={
            "listing_id": rezervasyon.get("id"),
            "badge_text": "Onaylandı",
        }
    )


def bildir_rezervasyon_iptal(user_id: int, rezervasyon: dict):
    urun = rezervasyon.get("urun", "")
    kafe = rezervasyon.get("kafe", "")

    return _bildirim_gonder(
        user_id=user_id,
        baslik="❌ Rezervasyonun İptal Edildi",
        mesaj=f"{kafe}'daki {urun} rezervasyonun iptal edildi. Başka fırsatlara göz at!",
        tip="rezervasyon",
        ekstra={
            "listing_id": rezervasyon.get("id"),
            "badge_text": "İptal",
        }
    )


def bildir_isletmeye_rezervasyon(isletme_user_id: int, rezervasyon: dict):
    kullanici_adi = rezervasyon.get("kullanici_adi", "Bir kullanıcı")
    urun = rezervasyon.get("urun", "")

    return _bildirim_gonder(
        user_id=isletme_user_id,
        baslik="🛎️ Yeni Rezervasyon!",
        mesaj=f"{kullanici_adi} — {urun} için rezervasyon yaptı.",
        tip="rezervasyon",
        ekstra={
            "listing_id": rezervasyon.get("id"),
            "badge_text": "Yeni",
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# 4. KONUM BAZLI TETİKLEYİCİLER
# ─────────────────────────────────────────────────────────────────────────────

def bildir_yakinlik(user_id: int, firsat: dict, mesafe_km: float, esik_km: float = 0.3):
    if mesafe_km > esik_km:
        return False

    urun = firsat.get("urun", "")
    kafe = firsat.get("kafe", "")
    mesafe_m = int(mesafe_km * 1000)

    return _bildirim_gonder(
        user_id=user_id,
        baslik="📍 Fırsat Çok Yakında!",
        mesaj=f"{kafe} sadece {mesafe_m} metre uzağında! {urun} seni bekliyor.",
        tip="yakinlik",
        ekstra={
            "listing_id": firsat.get("id"),
            "badge_text": f"{mesafe_m}m",
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# 5. STOK VE KRİTİK UYARILAR
# ─────────────────────────────────────────────────────────────────────────────

def bildir_stok_azaliyor(user_id: int, firsat: dict, kalan_adet: int, esik: int = 2):
    if kalan_adet > esik:
        return False

    urun = firsat.get("urun", "")
    kafe = firsat.get("kafe", "")

    return _bildirim_gonder(
        user_id=user_id,
        baslik="⚡ Son Birkaç Porsiyon!",
        mesaj=f"{kafe}'da {urun} — sadece {kalan_adet} porsiyon kaldı, acele et!",
        tip="stok_uyari",
        ekstra={
            "listing_id": firsat.get("id"),
            "badge_text": f"Son {kalan_adet}",
        }
    )