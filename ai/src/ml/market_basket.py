"""
market_basket.py — Birliktelik Analizi (Market Basket Analysis)

Eskiden PostgreSQL'e direkt bağlanıyordu.
Şimdi Batuhan'ın GET /analytics/order-history endpoint'inden veri çekiyor.

"Kebap alan ayran da alır" mantığını Apriori algoritmasıyla bulur.
"""

import os
import logging
import pandas as pd
import requests
import warnings
from dotenv import load_dotenv
from pathlib import Path
from mlxtend.frequent_patterns import apriori, association_rules

warnings.filterwarnings("ignore", category=DeprecationWarning)

logger = logging.getLogger("SonLokma.MarketBasket")

# .env dosyasını yükle
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

# ── Backend URL env'den oku, yoksa localhost'a düş ───────────────────────────
BACKEND_URL = (os.environ.get("BACKEND_URL") or "http://127.0.0.1:8000").rstrip("/")

# ── Güvenlik: Sadece localhost/127.0.0.1 kabul et (production'da değiştir) ───
IZIN_VERILEN_HOSTLAR = {"127.0.0.1", "localhost"}

def _backend_url_dogrula(url: str) -> str:
    """
    BACKEND_URL'nin izin verilen bir host'a işaret ettiğini kontrol eder.
    Yanlış env değeri ile dış sunucuya istek atılmasını önler.
    """
    from urllib.parse import urlparse
    parsed = urlparse(url)
    host = parsed.hostname or ""
    if host not in IZIN_VERILEN_HOSTLAR:
        raise ValueError(
            f"Güvenlik hatası: BACKEND_URL izin verilmeyen host içeriyor → '{host}'. "
            f"İzin verilenler: {IZIN_VERILEN_HOSTLAR}"
        )
    return url

try:
    BACKEND_URL = _backend_url_dogrula(BACKEND_URL)
    logger.info(f"✅ Backend URL doğrulandı: {BACKEND_URL}")
except ValueError as e:
    logger.error(f"❌ {e}")
    BACKEND_URL = "http://127.0.0.1:8000"  # Güvenli varsayılana dön


def order_history_cek(limit: int = 500):
    """
    Batuhan'ın GET /analytics/order-history endpoint'inden
    tamamlanmış sipariş geçmişini çeker.
    """
    # limit değerini doğrula — negatif veya aşırı büyük değer gönderilmesin
    if not isinstance(limit, int) or limit <= 0:
        limit = 500
    limit = min(limit, 5000)  # max 5000 ile sınırla

    try:
        url = f"{BACKEND_URL}/analytics/order-history"
        logger.info(f"📡 Sipariş geçmişi çekiliyor: {url} (limit={limit})")

        response = requests.get(
            url,
            params={"limit": limit},
            timeout=15  # 15 saniye timeout — sonsuz bekleme önlemi
        )
        response.raise_for_status()
        data = response.json()

        siparisler = data.get("order_history", [])
        if not siparisler:
            logger.warning("⚠️ Veritabanında tamamlanmış sipariş yok.")
            return pd.DataFrame()

        satirlar = []
        for s in siparisler:
            # Eksik alan kontrolü — bozuk kayıt varsa atla
            user_id = s.get("user_id")
            tarih = s.get("tarih", "")
            urun = s.get("urun", "").strip()

            if not user_id or not tarih or not urun:
                logger.debug(f"⚠️ Eksik alan, kayıt atlandı: {s}")
                continue

            satirlar.append({
                "order_id": f"{user_id}_{tarih[:10]}",
                "product_name": urun
            })

        logger.info(f"✅ {len(satirlar)} sipariş kaydı çekildi.")
        return pd.DataFrame(satirlar)

    except requests.exceptions.Timeout:
        logger.error(f"❌ Backend zaman aşımı (15s): {BACKEND_URL}")
        return pd.DataFrame()
    except requests.exceptions.ConnectionError:
        logger.error(f"❌ Backend'e bağlanılamadı: {BACKEND_URL}")
        return pd.DataFrame()
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Backend bağlantı hatası: {e}")
        return pd.DataFrame()
    except (ValueError, KeyError) as e:
        logger.error(f"❌ Yanıt parse hatası: {e}")
        return pd.DataFrame()


def get_market_basket_rules():
    logger.info("🚀 Backend'den sipariş geçmişi çekiliyor...")

    df = order_history_cek()

    if df.empty:
        logger.warning("⚠️ İşlenecek veri bulunamadı!")
        return pd.DataFrame()

    try:
        basket = (
            df.groupby(["order_id", "product_name"])["product_name"]
            .count()
            .unstack()
            .reset_index()
            .fillna(0)
            .set_index("order_id")
        )

        basket_sets = basket.map(lambda x: 1 if x > 0 else 0)

        logger.info("🧠 Apriori algoritması çalıştırılıyor...")
        frequent_itemsets = apriori(basket_sets, min_support=0.01, use_colnames=True)

        if frequent_itemsets.empty:
            logger.warning("⚠️ Yeterli birliktelik bulunamadı. Daha fazla sipariş verisi gerekiyor.")
            return pd.DataFrame()

        rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1)
        return rules.sort_values("confidence", ascending=False)

    except Exception as e:
        logger.error(f"❌ Analiz hatası: {e}")
        return pd.DataFrame()


if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

    results = get_market_basket_rules()

    if not results.empty:
        print("\n🔥 BULUNAN İLİŞKİLER 🔥")
        formatted_rules = results[["antecedents", "consequents", "support", "confidence"]]
        print(formatted_rules.to_string())
        print("\n💡 Öneri: Birlikte alınan ürünleri öneri sistemine ekleyebiliriz!")
    else:
        print("\n⚠️ Kural bulunamadı — daha fazla tamamlanmış sipariş gerekiyor.")
        print("   Kullanıcılar sipariş tamamladıkça (picked_up) analiz çalışacak.")