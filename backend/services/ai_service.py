"""
AI servisini HTTP ile çağıran client.
AI ekibi http://127.0.0.1:5000/score endpoint'ini host eder.
"""
import os
import logging
import requests
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

AI_URL = os.getenv("AI_URL", "http://127.0.0.1:5000")
AI_TIMEOUT = 10.0  # saniye


class AIService:
    """
    AI modülüne HTTP request gönderir.
    AI down olursa boş liste döndürür — backend çalışmaya devam eder.
    """

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or AI_URL
        logger.info(f"AI Service başlatıldı: {self.base_url}")

    def health_check(self) -> bool:
        """AI servisi açık mı kontrol et."""
        try:
            r = requests.get(f"{self.base_url}/health", timeout=2)
            return r.status_code == 200
        except Exception:
            return False

    def score_listings(
        self,
        user_context: Dict[str, Any],
        listings: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        AI'a listing'leri yollar, skorları geri alır.

        Args:
            user_context: {
                "id": int,
                "location": {"latitude": float, "longitude": float},
                "preferred_radius_km": float,
                "name": str (opsiyonel)
            }
            listings: [
                {
                    "listing_id": int,
                    "kafe": str, "kategori": str, "urun": str,
                    "aciklama": str, "indirim_orani": float,
                    "fiyat": float, "mesafe_km": float
                }
            ]

        Returns:
            AI'dan dönen scored_listings listesi.
            Hata durumunda boş liste döner (fallback).
        """
        if not listings:
            return []

        payload = {
            "user_context": user_context,
            "listings": listings,
        }

        try:
            logger.info(f"AI'ya {len(listings)} listing gönderiliyor...")
            response = requests.post(
                f"{self.base_url}/score",
                json=payload,
                timeout=AI_TIMEOUT,
            )
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "success":
                logger.warning(f"AI 'success' dönmedi: {data.get('message')}")
                return []

            scored = data.get("scored_listings", [])
            logger.info(f"AI {len(scored)} listing skorladı.")
            return scored

        except requests.exceptions.Timeout:
            logger.warning(f"AI timeout ({AI_TIMEOUT}s). Skorsuz devam.")
            return []
        except requests.exceptions.ConnectionError:
            logger.warning("AI servisine bağlanılamadı. Çalışıyor mu?")
            return []
        except Exception as e:
            logger.error(f"AI çağrı hatası: {e}")
            return []