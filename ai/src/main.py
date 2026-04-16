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

    def run_ai_pipeline(self, active_user_context: dict):
        """
        Kişiselleştirilmiş fırsatları belirlemek için Çoklu Ajan (Multi-Agent) 
        akışını yöneten merkezi pipeline.
        """
        self.pipeline_start_time = datetime.now()
        # Profesyonel log kaydı (Kişisel isimlerden arındırılmış)
        log.info(f"🚀 ResQ-Food AI Pipeline Başlatıldı | Context: {active_user_context.get('id', 'Anonymous_Session')}")

        try:
            # ADIM 1: Dinamik Veri Çekme (Hafta 1: PostgreSQL Entegrasyonu)
            # Artık backend'in sunduğu /ai-fırsatlar endpoint'i kullanılıyor
            raw_listings = firsatlari_getir(
                latitude=active_user_context["location"]["latitude"],
                longitude=active_user_context["location"]["longitude"],
                radius=active_user_context.get("preferred_radius_km", 2.0)
            )

            if not raw_listings:
                log.warning("❌ Belirlenen yarıçap içerisinde uygun aktif fırsat bulunamadı.")
                return {"status": "no_data", "data": []}

            # ADIM 2: Mesafe Doğrulama (Opsiyonel: Backend zaten Haversine ile filtreledi)
            # Ancak AI motorunun kendi puanlaması için mesafe verisi saklanır.
            
            # ADIM 3 & 4: ML Öneri Katmanı ve Feed Ranker (Hafta 2: Algoritma Geliştirme)
            # Content-Based Filtering ve Weighted Scoring burada devreye girer.
            personalized_recommendations = get_personalized_recommendations(active_user_context, raw_listings)
            ranked_feed = feed_ranker(personalized_recommendations)
            
            log.info(f"🧠 ML Filtreleme ve Hiyerarşik Sıralama (Weighted Scoring) Tamamlandı.")

            # ADIM 5: NLP Tabanlı Bildirim Üretimi (Agent 3 - Groq/Llama 3.3)
            final_results = []
            # En iyi skora sahip ilk 3 teklif için AI metni üretilir
            for entry in ranked_feed[:3]:
                try:
                    # Groq modülüne bağlam (context) gönderilir
                    notification_payload = self._generate_notification(active_user_context, entry)
                    log.info(f"✅ Bildirim Hazırlandı: {entry['kafe']} — {entry['urun']}")

                    final_results.append({
                        "item_id": entry["id"],
                        "merchant_name": entry["kafe"],
                        "product_name": entry["urun"],
                        "content": notification_payload,
                        "relevance_score": entry.get("ai_score")
                    })
                except Exception as e:
                    log.error(f"⚠️ {entry['urun']} için NLP üretim hatası: {str(e)}")

            execution_time = (datetime.now() - self.pipeline_start_time).total_seconds()
            log.info(f"🏁 Pipeline Tamamlandı. Süre: {execution_time}s | {len(final_results)} adet optimize teklif üretildi.")
            
            return {
                "status": "success", 
                "results": final_results,
                "metadata": {"latency": execution_time}
            }

        except Exception as global_error:
            log.critical(f"🚨 Pipeline Çalışma Zamanı Hatası: {str(global_error)}")
            return {"status": "error", "message": "Sistem geçici olarak yanıt veremiyor."}

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
    result = orchestrator.run_ai_pipeline({
        "ad": "Samet",
        "location": {"latitude": 41.010, "longitude": 29.010},
        "preferred_radius_km": 5.0
    })
    print(result)