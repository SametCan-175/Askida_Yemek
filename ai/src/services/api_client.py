import requests
import logging

# Logger ayarlarını daha önce yapmıştık, ona sadık kalıyoruz
logger = logging.getLogger("ResQFoodAI")

class AIListingService:
    def __init__(self, base_url="http://localhost:8000"):
        self.endpoint = f"{base_url}/listings/ai-fırsatlar"

    def fetch_targeted_listings(self, latitude: float, longitude: float, radius: float = 2.0):
        """
        Backend'den coğrafi olarak filtrelenmiş verileri çeker.
        """
        params = {
            "lat": latitude,
            "lon": longitude,
            "radius": radius
        }
        
        try:
            logger.info(f"🛰️ Veri kaynağına bağlanılıyor: {params['lat']}, {params['lon']}")
            response = requests.get(self.endpoint, params=params)
            response.raise_for_status() # Hata varsa yakalar
            
            data = response.json()
            logger.info(f"✅ {len(data)} adet aktif fırsat başarıyla çekildi.")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Veri çekme hatası: {str(e)}")
            return []