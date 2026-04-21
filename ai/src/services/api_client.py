import requests
import logging

# Logger ayarları
logger = logging.getLogger("ResQFoodAI")

class AIListingService:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        # URL'i burada tek bir yerde oluşturuyoruz
        self.base_url = base_url
        self.endpoint = f"{base_url}/listings/ai-fırsatlar"

    def fetch_targeted_listings(self, latitude: float, longitude: float, radius: float = 2.0):
        """Backend'e bağlanıp fırsat verilerini çeker."""
        
        # Backend'in (ai_listings.py) beklediği 'lat' ve 'lon' isimleri
        params = {
            "lat": float(latitude),
            "lon": float(longitude),
            "radius": float(radius)
        }
        
        try:
            url = f"{self.base_url}/listings/ai-fırsatlar"
            logger.info(f"🛰️ Veri kaynağına bağlanılıyor: {params['lat']}, {params['lon']}")
            logger.info(f"🔗 Manuel URL denemesi: {url}")
            
            # İstek atılıyor
            response = requests.get(url, params=params)
            
            if response.status_code == 422:
                print(response.json())

            # HTTP hatalarını (404, 422, 500 vb.) kontrol et
            response.raise_for_status() 
            
            data = response.json()
            logger.info(f"✅ {len(data)} adet aktif fırsat başarıyla çekildi.")
            return data
            
        except requests.exceptions.RequestException as e:
            # Burası 422 veya Bağlantı hatası durumunda log basar
            logger.error(f"❌ Veri çekme hatası: {str(e)}")
            return []