import sys
import os
from datetime import datetime

# Import yollarını garantile
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.api_client import firsatlari_getir
from services.groq_service import groq_cagir
from services.geo_service import haversine_mesafe
from ml.ranker import feed_ranker
from ml.recommender import get_personalized_recommendations
from utils.logger import log 

class ResQFoodOrchestrator:
    def __init__(self):
        self.pipeline_start_time = None

    def run_pipeline(self, kullanici):
        self.pipeline_start_time = datetime.now()
        log.info(f"🚀 ResQ-Food AI Pipeline Başlatıldı | Kullanıcı: {kullanici.get('ad', 'Misafir')}")

        try:
            # ADIM 1: Veri Çek
            raw_firsatlar = firsatlari_getir(
                lat=kullanici["konum"]["lat"],
                lon=kullanici["konum"]["lon"],
                radius=kullanici.get("max_mesafe_km", 5.0)
            )

            if not raw_firsatlar:
                log.warning("❌ Yakınlarda uygun fırsat bulunamadı.")
                return {"status": "no_data", "data": []}

            # ADIM 2: Mesafe
            for firsat in raw_firsatlar:
                firsat["mesafe_km"] = haversine_mesafe(kullanici["konum"], firsat["konum"])

            # ADIM 3 & 4: Öneri ve Sıralama
            onerilen_firsatlar = get_personalized_recommendations(kullanici, raw_firsatlar)
            sirali_liste = feed_ranker(onerilen_firsatlar)
            log.info(f"🧠 ML Filtreleme ve Sıralama Tamamlandı.")

            # ADIM 5: Bildirim Üretimi
            final_results = []
            for urun in sirali_liste[:3]:
                try:
                    bildirim_metni = self._generate_notification(kullanici, urun)
                    log.info(f"✅ Bildirim Hazır: {urun['kafe']} — {urun['urun']}")

                    final_results.append({
                        "urun_id": urun["id"],
                        "kafe": urun["kafe"],
                        "urun_adi": urun["urun"],
                        "bildirim": bildirim_metni,
                        "ai_score": urun.get("ai_score")
                    })
                except Exception as e:
                    log.error(f"⚠️ {urun['urun']} bildirimi hata verdi: {e}")

            log.info(f"🏁 Pipeline Bitti. {len(final_results)} teklif üretildi.")
            return {"status": "success", "results": final_results}

        except Exception as global_e:
            log.critical(f"🚨 KRİTİK HATA: {global_e}")
            return {"status": "error", "message": str(global_e)}

    def _generate_notification(self, kullanici, urun):
        kullanici_adi = kullanici.get("ad", "Samet")
        vakit = "sabah" if 5 <= datetime.now().hour < 12 else "öğle" if 12 <= datetime.now().hour < 17 else "akşam"
        
        sistem_prompt = f"Sen ResQ-Food asistanısın. {kullanici_adi} için {vakit} vaktine uygun samimi bir israf önleme mesajı yaz."
        kullanici_mesaji = (
            f"Ürün: {urun['urun']} ({urun['kafe']}), "
            f"Mesafe: {urun['mesafe_km']} km, "
            f"İndirim: %{urun['indirim_orani']}, "
            f"Stok: {urun['stok']}"
        )
        return groq_cagir(sistem_prompt, kullanici_mesaji)

if __name__ == "__main__":
    orchestrator = ResQFoodOrchestrator()
    result = orchestrator.run_pipeline({
        "ad": "Samet",
        "konum": {"lat": 41.010, "lon": 29.010},
        "tercihler": ["sandviç", "çorba"],
        "max_mesafe_km": 5.0
    })