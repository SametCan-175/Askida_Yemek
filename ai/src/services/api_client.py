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

            # Batuhan'ın API'si {"user_id": ..., "listings": [...]} formatında döndürüyor
            if isinstance(data, dict) and "listings" in data:
                listings = data["listings"]
            else:
                listings = data  # Direkt liste dönerse de çalışır

            logger.info(f"✅ {len(listings)} adet listing çekildi.")
            return listings

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
            # Batuhan'ın endpoint'i {"scores": [...]} formatı bekliyor
            response = requests.post(url, json={"scores": sonuclar})

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

    def post_rozet_sonucu(self, user_id: int, rozet_sonucu: dict):
        """
        rozet.py'den gelen sonucu backend'e gönderir.
        Batuhan bunu alıp kullanıcının rozet listesini günceller,
        frontend de oradan gösterir.

        Beklenen format:
        {
            "user_id": 1,
            "yeni_rozetler": [
                {
                    "id": "firsat_avcisi",
                    "ad": "Fırsat Avcısı",
                    "emoji": "🎯",
                    "aciklama": "5 sipariş tamamladın!"
                }
            ],
            "kutlama_mesaji": "Tebrikler! Fırsat Avcısı rozetini kazandın! 🎯",
            "siradaki_rozet": {
                "ad": "İsraf Önleyici",
                "kalan_siparis": 5
            }
        }
        """
        if not rozet_sonucu.get("yeni_rozetler"):
            logger.info("ℹ️ Yeni rozet yok, gönderim yapılmadı.")
            return None

        try:
            url = f"{self.base_url}/users/rozetler"
            payload = {
                "user_id": user_id,
                **rozet_sonucu
            }
            logger.info(f"🏅 {len(rozet_sonucu['yeni_rozetler'])} rozet backend'e gönderiliyor...")
            response = requests.post(url, json=payload)

            if response.status_code == 422:
                logger.error(f"422 Hatası: {response.json()}")

            response.raise_for_status()
            logger.info(f"✅ Rozet sonucu backend'e iletildi → user:{user_id}")
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Rozet gönderme hatası: {str(e)}")
            return None