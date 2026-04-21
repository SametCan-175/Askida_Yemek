import sys
import os
from datetime import datetime

# 1. Klasör Yapısı ve Import Güvenliği
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    # Sınıf adını AIListingService olarak güncelledik
    from services.api_client import AIListingService
    from services.groq_service import groq_cagir
    from ml.ranker import feed_ranker
    from ml.recommender import get_personalized_recommendations
    from utils.logger import log
except ImportError as e:
    print(f"❌ Kritik Import Hatası: {e}")
    sys.exit(1)

class ResQFoodOrchestrator:
    def __init__(self):
        self.pipeline_start_time = None
        # Backend bağlantısı için doğru sınıfı başlatıyoruz
        self.client = AIListingService(base_url="http://127.0.0.1:8000")
        log.info("🤖 ResQ-Food AI Orchestrator Hazırlandı.")

    def run_ai_pipeline(self, active_user_context: dict):
        self.pipeline_start_time = datetime.now()
        user_id = active_user_context.get('id', 'USR_SAMET_34')
        
        log.info(f"🚀 Pipeline Başlatıldı | Kullanıcı: {user_id}")

        try:
            # ADIM 1: Backend'den konum bazlı verileri çek
            raw_listings = self.client.fetch_targeted_listings(
                latitude=active_user_context["location"]["latitude"],
                longitude=active_user_context["location"]["longitude"],
                radius=active_user_context.get("preferred_radius_km", 2.0)
            )

            if not raw_listings:
                log.warning(f"📍 Yakınlarda aktif fırsat bulunamadı.")
                return {"status": "no_data", "message": "Yakınlarda israf önlenecek ürün yok."}

            # ADIM 2 & 3: ML Katmanı ve Sıralama
            personalized_data = get_personalized_recommendations(active_user_context, raw_listings)
            ranked_feed = feed_ranker(personalized_data)
            
            log.info(f"🧠 ML Filtreleme Tamamlandı: {len(ranked_feed)} ürün skorlandı.")

            # ADIM 4: NLP Bildirim Üretimi (Groq / Llama 3.3)
            final_results = []
            for entry in ranked_feed[:3]:
                try:
                    ai_message = self._generate_notification(active_user_context, entry)
                    final_results.append({
                        "kafe": entry["kafe"],
                        "urun": entry["urun"],
                        "bildirim": ai_message,
                        "skor": entry.get("ai_score", 0),
                        "indirim": f"%{entry['indirim_orani']}"
                    })
                    log.info(f"✅ Mesaj Hazır: {entry['kafe']}")
                except Exception as nlp_err:
                    log.error(f"⚠️ NLP Hatası: {nlp_err}")

            duration = (datetime.now() - self.pipeline_start_time).total_seconds()
            return {
                "status": "success",
                "results": final_results,
                "metadata": {"latency": duration}
            }

        except Exception as global_err:
            log.critical(f"🚨 Pipeline Hatası: {global_err}")
            return {"status": "error", "message": str(global_err)}

    def _generate_notification(self, user, item):
        user_name = user.get("ad", "Samet")
        system_prompt = f"Sen ResQ-Food asistanısın. {user_name} için samimi bir teklif yaz."
        user_prompt = f"Ürün: {item['urun']}, Mekan: {item['kafe']}, İndirim: %{item['indirim_orani']}."
        return groq_cagir(system_prompt, user_prompt)

if __name__ == "__main__":
    orchestrator = ResQFoodOrchestrator()
    test_user = {
        "ad": "Samet",
        "location": {"latitude": 41.010, "longitude": 29.010},
        "preferred_radius_km": 5.0
    }
    
    result = orchestrator.run_ai_pipeline(test_user)
    print("\n--- AI PIPELINE SONUCU ---")
    import json
    print(json.dumps(result, indent=4, ensure_ascii=False))