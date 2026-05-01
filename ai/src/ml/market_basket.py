"""
market_basket.py — Birliktelik Analizi (Market Basket Analysis)

Eskiden PostgreSQL'e direkt bağlanıyordu.
Şimdi Batuhan'ın GET /analytics/order-history endpoint'inden veri çekiyor.

"Kebap alan ayran da alır" mantığını Apriori algoritmasıyla bulur.
"""

import pandas as pd
import requests
import warnings
from mlxtend.frequent_patterns import apriori, association_rules

warnings.filterwarnings("ignore", category=DeprecationWarning)

BACKEND_URL = "http://127.0.0.1:8000"


def order_history_cek(limit: int = 500):
    """
    Batuhan'ın GET /analytics/order-history endpoint'inden
    tamamlanmış sipariş geçmişini çeker.
    """
    try:
        response = requests.get(f"{BACKEND_URL}/analytics/order-history", params={"limit": limit})
        response.raise_for_status()
        data = response.json()

        siparisler = data.get("order_history", [])
        if not siparisler:
            print("⚠️ Veritabanında tamamlanmış sipariş yok.")
            return pd.DataFrame()

        satirlar = []
        for s in siparisler:
            satirlar.append({
                "order_id": f"{s['user_id']}_{s['tarih'][:10]}",
                "product_name": s["urun"]
            })

        print(f"✅ {len(satirlar)} sipariş kaydı çekildi.")
        return pd.DataFrame(satirlar)

    except requests.exceptions.RequestException as e:
        print(f"❌ Backend bağlantı hatası: {e}")
        return pd.DataFrame()


def get_market_basket_rules():
    print("🚀 Backend'den sipariş geçmişi çekiliyor...")

    df = order_history_cek()

    if df.empty:
        print("⚠️ İşlenecek veri bulunamadı!")
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

        print("🧠 Apriori algoritması çalıştırılıyor...")
        frequent_itemsets = apriori(basket_sets, min_support=0.01, use_colnames=True)

        if frequent_itemsets.empty:
            print("⚠️ Yeterli birliktelik bulunamadı. Daha fazla sipariş verisi gerekiyor.")
            return pd.DataFrame()

        rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1)
        return rules.sort_values("confidence", ascending=False)

    except Exception as e:
        print(f"❌ Analiz hatası: {e}")
        return pd.DataFrame()


if __name__ == "__main__":
    results = get_market_basket_rules()

    if not results.empty:
        print("\n🔥 BULUNAN İLİŞKİLER 🔥")
        formatted_rules = results[["antecedents", "consequents", "support", "confidence"]]
        print(formatted_rules.to_string())
        print("\n💡 Öneri: Birlikte alınan ürünleri öneri sistemine ekleyebiliriz!")
    else:
        print("\n⚠️ Kural bulunamadı — daha fazla tamamlanmış sipariş gerekiyor.")
        print("   Kullanıcılar sipariş tamamladıkça (picked_up) analiz çalışacak.")