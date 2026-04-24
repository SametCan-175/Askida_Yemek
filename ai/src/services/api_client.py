import requests
import logging

logger = logging.getLogger("ResQFoodAI")


class AIListingService:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url

    def fetch_targeted_listings(self, latitude: float, longitude: float, radius: float = 2.0):
        """Backend'den fırsat verilerini çeker."""
        params = {
            "lat": float(latitude),
            "lon": float(longitude),
            "radius": float(radius)
        }
        try:
            url = f"{self.base_url}/listings/ai-fırsatlar"
            logger.info(f"🛰️ Listing'ler çekiliyor: lat={params['lat']}, lon={params['lon']}")
            response = requests.get(url, params=params)

            if response.status_code == 422:
                logger.error(f"422 Hatası: {response.json()}")

            response.raise_for_status()
            data = response.json()
            logger.info(f"✅ {len(data)} adet listing çekildi.")
            return data

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Listing çekme hatası: {str(e)}")
            return []

    def post_ai_scores(self, sonuclar: list):
        """
        İşlenmiş AI skorlarını backend'e gönderir.

        Beklenen format:
        [
            {
                "listing_id": 123,
                "ai_score": 0.95,
                "badge_text": "Günün Yıldızı",
                "ai_description": "Kebap seversin, bu ayran tam sana göre!"
            }
        ]
        """
        if not sonuclar:
            logger.warning("⚠️ Gönderilecek skor yok, istek atılmadı.")
            return None

        try:
            url = f"{self.base_url}/listings/ai-scores"
            logger.info(f"📤 {len(sonuclar)} skor backend'e gönderiliyor...")
            response = requests.post(url, json=sonuclar)

            if response.status_code == 422:
                logger.error(f"422 Hatası: {response.json()}")

            response.raise_for_status()
            logger.info("✅ Skorlar başarıyla backend'e iletildi.")
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Skor gönderme hatası: {str(e)}")
            return None

    def post_siparis_tamamlandi(self, user_id: int, listing_id: int):
        """
        Sipariş tamamlandığında rozet kontrolü için backend'e bildirim gönderir.
        (Batuhan bu endpoint'i açtığında kullanılacak)
        """
        try:
            url = f"{self.base_url}/ai/siparis-tamamlandi"
            payload = {"user_id": user_id, "listing_id": listing_id}
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Sipariş bildirimi hatası: {str(e)}")
            return None