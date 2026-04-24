"""
notification.py — Son Lokma Bildirim Merkezi

Görevler:
  1. AI tabanlı kişiselleştirilmiş bildirimler (daily_deal, recommender)
  2. Rezervasyon durum güncellemeleri (pending → confirmed → iptal)
  3. Konum bazlı tetikleyiciler (geofencing)
  4. Stok ve kritik uyarılar

Bildirim akışı:
  AI/sistem olayı → notification.py → Backend'e POST → Frontend push notification
  (Firebase FCM'e geçilirse sadece _bildirim_gonder() fonksiyonu güncellenir)
"""

import logging
import requests
from datetime import datetime

logger = logging.getLogger("SonLokma.Notification")

# Backend bildirim endpoint'i
# Batuhan bu endpoint'i açınca buraya yazar
BACKEND_URL = "http://127.0.0.1:8000"
BILDIRIM_ENDPOINT = f"{BACKEND_URL}/notifications/send"


# ─────────────────────────────────────────────────────────────────────────────
# TEMEL GÖNDERİM KATMANI
# Firebase'e geçilirse sadece bu fonksiyon değişir, geri kalan her şey aynı kalır
# ─────────────────────────────────────────────────────────────────────────────

def _bildirim_gonder(user_id: int, baslik: str, mesaj: str, tip: str, ekstra: dict = None):
    """
    Bildirimi backend'e POST atar.
    Backend oradan Firebase FCM veya uygulama içi bildirim olarak iletir.

    tip değerleri:
      "ai_oneri"        → Kişiselleştirilmiş fırsat önerisi
      "rozet"           → Rozet kazanıldı
      "rezervasyon"     → Rezervasyon durum değişikliği
      "stok_uyari"      → Stok kritik seviyede
      "yakinlik"        → Kullanıcı fırsata yakın
      "gunun_firsati"   → Günün fırsatı bildirimi
    """
    payload = {
        "user_id": user_id,
        "baslik": baslik,
        "mesaj": mesaj,
        "tip": tip,
        "zaman": datetime.now().isoformat(),
        "ekstra": ekstra or {}
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
    """
    pipeline.py'den gelen ai_description ile kişiselleştirilmiş bildirim gönderir.

    Örnek: "Hey Samet, tam senin damak tadına göre bir fırsat yakaladık!"
    """
    urun = firsat.get("urun", "")
    kafe = firsat.get("kafe", "")
    ai_description = firsat.get("ai_description", "")
    indirim = firsat.get("indirim_orani", 0)

    baslik = f"🍽️ Sana Özel Fırsat!"
    mesaj = ai_description if ai_description else f"{kafe}'da {urun} — %{indirim} indirim!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="ai_oneri",
        ekstra={
            "listing_id": firsat.get("listing_id"),
            "kafe": kafe,
            "indirim_orani": indirim
        }
    )


def bildir_gunun_firsati(user_id: int, firsat: dict, kart_metni: str):
    """
    daily_deal.py'den gelen günün fırsatını bildirir.
    """
    baslik = "🔥 Günün Fırsatı Geldi!"
    mesaj = kart_metni if kart_metni else f"{firsat.get('urun')} — kaçırma!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="gunun_firsati",
        ekstra={
            "listing_id": firsat.get("id"),
            "firsat_skoru": firsat.get("firsat_skoru")
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# 2. ROZET BİLDİRİMLERİ
# ─────────────────────────────────────────────────────────────────────────────

def bildir_rozet(user_id: int, kullanici_adi: str, rozet: dict, kutlama_mesaji: str):
    """
    rozet.py'den rozet kazanıldığında çağrılır.
    """
    baslik = f"{rozet['emoji']} Yeni Rozet Kazandın!"
    mesaj = kutlama_mesaji if kutlama_mesaji else f"{rozet['ad']} rozetini kazandın!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="rozet",
        ekstra={
            "rozet_id": rozet.get("id"),
            "rozet_ad": rozet.get("ad"),
            "rozet_emoji": rozet.get("emoji")
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# 3. REZERVASYON BİLDİRİMLERİ
# ─────────────────────────────────────────────────────────────────────────────

def bildir_rezervasyon_onaylandi(user_id: int, rezervasyon: dict):
    """
    Rezervasyon pending → confirmed olduğunda kullanıcıya bildirir.
    Batuhan'ın reservation router'ı bu fonksiyonu çağırır.
    """
    urun = rezervasyon.get("urun", "")
    kafe = rezervasyon.get("kafe", "")

    baslik = "✅ Rezervasyonun Onaylandı!"
    mesaj = f"{kafe}'daki {urun} siparişin onaylandı. Yemeğin seni bekliyor!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="rezervasyon",
        ekstra={
            "rezervasyon_id": rezervasyon.get("id"),
            "durum": "confirmed",
            "kafe": kafe
        }
    )


def bildir_rezervasyon_iptal(user_id: int, rezervasyon: dict):
    """
    Rezervasyon iptal edildiğinde kullanıcıya bildirir.
    """
    urun = rezervasyon.get("urun", "")
    kafe = rezervasyon.get("kafe", "")

    baslik = "❌ Rezervasyonun İptal Edildi"
    mesaj = f"{kafe}'daki {urun} rezervasyonun iptal edildi. Başka fırsatlara göz at!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="rezervasyon",
        ekstra={
            "rezervasyon_id": rezervasyon.get("id"),
            "durum": "iptal",
            "kafe": kafe
        }
    )


def bildir_isletmeye_rezervasyon(isletme_user_id: int, rezervasyon: dict):
    """
    Kullanıcı rezervasyon yaptığında işletmeye bildirir.
    """
    kullanici_adi = rezervasyon.get("kullanici_adi", "Bir kullanıcı")
    urun = rezervasyon.get("urun", "")

    baslik = "🛎️ Yeni Rezervasyon!"
    mesaj = f"{kullanici_adi} — {urun} için rezervasyon yaptı."

    return _bildirim_gonder(
        user_id=isletme_user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="rezervasyon",
        ekstra={
            "rezervasyon_id": rezervasyon.get("id"),
            "durum": "pending"
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# 4. KONUM BAZLI TETİKLEYİCİLER (GEOFENCING)
# ─────────────────────────────────────────────────────────────────────────────

def bildir_yakinlik(user_id: int, firsat: dict, mesafe_km: float, esik_km: float = 0.3):
    """
    Kullanıcı bir fırsata esik_km'den yakınsa bildirim gönderir.
    geo_service.py'den gelen mesafe_km ile pipeline içinde tetiklenir.

    Varsayılan eşik: 300 metre
    """
    if mesafe_km > esik_km:
        return False  # Yeterince yakın değil

    urun = firsat.get("urun", "")
    kafe = firsat.get("kafe", "")
    mesafe_m = int(mesafe_km * 1000)

    baslik = "📍 Fırsat Çok Yakında!"
    mesaj = f"{kafe} sadece {mesafe_m} metre uzağında! {urun} seni bekliyor."

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="yakinlik",
        ekstra={
            "listing_id": firsat.get("id"),
            "mesafe_km": mesafe_km,
            "kafe": kafe
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# 5. STOK VE KRİTİK UYARILAR
# ─────────────────────────────────────────────────────────────────────────────

def bildir_stok_azaliyor(user_id: int, firsat: dict, kalan_adet: int, esik: int = 2):
    """
    Favori bir ürünün stoğu kritik seviyeye düştüğünde bildirir.
    Pipeline'da ranker.py stok_aciliyeti hesaplarken tetiklenebilir.
    """
    if kalan_adet > esik:
        return False  # Henüz kritik değil

    urun = firsat.get("urun", "")
    kafe = firsat.get("kafe", "")

    baslik = "⚡ Son Birkaç Porsiyon!"
    mesaj = f"{kafe}'da {urun} — sadece {kalan_adet} porsiyon kaldı, acele et!"

    return _bildirim_gonder(
        user_id=user_id,
        baslik=baslik,
        mesaj=mesaj,
        tip="stok_uyari",
        ekstra={
            "listing_id": firsat.get("id"),
            "kalan_adet": kalan_adet
        }
    )