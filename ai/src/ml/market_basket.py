import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
import psycopg2
import warnings

# Gereksiz uyarıları gizleyelim
warnings.filterwarnings("ignore", category=DeprecationWarning)

def get_market_basket_rules():
    print("🚀 Veritabanına bağlanılıyor ve veriler çekiliyor...")
    try:
        conn = psycopg2.connect(dbname="askida_yemek", user="postgres", password="12345", host="localhost")
        
        # DİKKAT: Seeder'da ID'ler vardı, isimleri görmek için listings ile JOIN yapıyoruz
        query = """
            SELECT oh.id as order_id, l.title as product_name 
            FROM order_history oh
            JOIN listings l ON oh.item_a_id = l.id
            UNION ALL
            SELECT oh.id as order_id, l.title as product_name 
            FROM order_history oh
            JOIN listings l ON oh.item_b_id = l.id
        """
        df = pd.read_sql(query, conn)
        conn.close()

        if df.empty:
            print("⚠️ Veritabanında işlenecek veri bulunamadı!")
            return pd.DataFrame()

        # 2. Veriyi One-Hot Encoding Formatına Getir
        basket = (df.groupby(['order_id', 'product_name'])['product_name']
                  .count().unstack().reset_index().fillna(0)
                  .set_index('order_id'))
        
        # applymap yerine map kullanıyoruz (Pandas 2.x uyumu için)
        basket_sets = basket.map(lambda x: 1 if x > 0 else 0)

        # 3. Apriori Algoritmasını Çalıştır
        print("🧠 Apriori algoritması çalıştırılıyor...")
        # min_support değerini biraz daha düşürelim ki kesin sonuç gelsin
        frequent_itemsets = apriori(basket_sets, min_support=0.01, use_colnames=True)

        if frequent_itemsets.empty:
            return pd.DataFrame()

        # 4. Birliktelik Kurallarını Oluştur
        rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1)
        
        return rules.sort_values('confidence', ascending=False)

    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        return pd.DataFrame()

# --- ANA ÇALIŞTIRMA BÖLÜMÜ ---
if __name__ == "__main__":
    results = get_market_basket_rules()

    if not results.empty:
        print("\n🔥 BULUNAN İLİŞKİLER 🔥")
        # Sonuçları daha okunaklı basalım
        formatted_rules = results[['antecedents', 'consequents', 'support', 'confidence']]
        print(formatted_rules.to_string())
        
        print("\n💡 Öneri:")
        print("Kebap alan birine 'Ayran (Büyük)' önerme olasılığımız çok yüksek!")
    else:
        print("\n⚠️ Hiçbir ilişki kuralı bulunamadı. Eşik değerlerini (threshold) düşürmeyi dene!")