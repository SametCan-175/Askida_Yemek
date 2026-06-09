import requests
import logging

logger = logging.getLogger("ResQFoodAI")

TIMEOUT = 10  # saniye


class AIListingService:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url

    def fetch_targeted_listings(self, latitude: float, longitude: float, radius: float = 2.0):
        params = {
            "lat": float(latitude),
            "lon": float(longitude),
            "radius": float(radius)
        }
        try:
            url = f"{self.base_url}/listings/ai-fırsatlar"
            logger.info(f"🛰️ Listing'ler çekiliyor: lat={params['lat']}, lon={params['lon']}")
            response = requests.get(url, params=params, timeout=TIMEOUT)

            if response.status_code == 422:
                logger.error(f"422 Hatası: {response.json()}")

            response.raise_for_status()
            data = response.json()

            if isinstance(data, dict) and "listings" in data:
                listings = data["listings"]
            else:
                listings = data

            logger.info(f"✅ {len(listings)} adet listing çekildi.")
            return listings

        except requests.exceptions.Timeout:
            logger.error(f"❌ Listing çekme zaman aşımı ({TIMEOUT}s)")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Listing çekme hatası: {str(e)}")
            return []

    def post_ai_scores(self, sonuclar: list):
        if not sonuclar:
            logger.warning("⚠️ Gönderilecek skor yok, istek atılmadı.")
            return None

        try:
            url = f"{self.base_url}/listings/ai-scores"
            logger.info(f"📤 {len(sonuclar)} skor backend'e gönderiliyor...")
            response = requests.post(url, json={"scores": sonuclar}, timeout=TIMEOUT)

            if response.status_code == 422:
                logger.error(f"422 Hatası: {response.json()}")

            response.raise_for_status()
            logger.info("✅ Skorlar başarıyla backend'e iletildi.")
            return response.json()

        except requests.exceptions.Timeout:
            logger.error(f"❌ Skor gönderme zaman aşımı ({TIMEOUT}s)")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Skor gönderme hatası: {str(e)}")
            return None

    def post_siparis_tamamlandi(self, user_id: int, listing_id: int):
        try:
            url = f"{self.base_url}/ai/siparis-tamamlandi"
            payload = {"user_id": user_id, "listing_id": listing_id}
            response = requests.post(url, json=payload, timeout=TIMEOUT)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            logger.error(f"❌ Sipariş bildirimi zaman aşımı ({TIMEOUT}s)")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Sipariş bildirimi hatası: {str(e)}")
            return None

    def post_rozet_sonucu(self, user_id: int, rozet_sonucu: dict):
        if not rozet_sonucu.get("yeni_rozetler"):
            logger.info("ℹ️ Yeni rozet yok, gönderim yapılmadı.")
            return None

        try:
            url = f"{self.base_url}/users/rozetler"
            payload = {"user_id": user_id, **rozet_sonucu}
            logger.info(f"🏅 {len(rozet_sonucu['yeni_rozetler'])} rozet backend'e gönderiliyor...")
            response = requests.post(url, json=payload, timeout=TIMEOUT)

            if response.status_code == 422:
                logger.error(f"422 Hatası: {response.json()}")

            response.raise_for_status()
            logger.info(f"✅ Rozet sonucu backend'e iletildi → user:{user_id}")
            return response.json()

        except requests.exceptions.Timeout:
            logger.error(f"❌ Rozet gönderme zaman aşımı ({TIMEOUT}s)")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Rozet gönderme hatası: {str(e)}")
            return None