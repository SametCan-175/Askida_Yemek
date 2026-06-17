import psycopg2
from psycopg2.extras import execute_values
import random
from datetime import datetime, timedelta

# Veritabanı Bağlantı Bilgileri
DB_CONFIG = {
    "dbname": "askida_yemek",
    "user": "postgres",
    "password": "12345", # Docker'da belirlediğimiz şifre
    "host": "localhost",
    "port": "5432"
}

def seed_data():
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("🚀 Veritabanına bağlanıldı. Şema kontrol ediliyor...")

        # 1. Tabloları Oluştur (Eğer yoklarsa hata almanı engeller)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT,
                lat FLOAT,
                lng FLOAT,
                preferences TEXT
            );
            CREATE TABLE IF NOT EXISTS shops (
                id SERIAL PRIMARY KEY,
                name TEXT,
                lat FLOAT,
                lng FLOAT,
                category_tags TEXT
            );
            CREATE TABLE IF NOT EXISTS listings (
                id SERIAL PRIMARY KEY,
                shop_id INTEGER,
                title TEXT,
                price FLOAT,
                discount_price FLOAT,
                category TEXT
            );
            CREATE TABLE IF NOT EXISTS order_history (
                id SERIAL PRIMARY KEY,
                item_a_id INTEGER,
                item_b_id INTEGER
            );
        """)

        # 2. Temizlik Yap (Fresh Start)
        print("🧹 Eski veriler temizleniyor...")
        cur.execute("TRUNCATE TABLE order_history, listings, shops, users RESTART IDENTITY CASCADE;")

        # 3. Genel Kullanıcı Personaları
        users = [
            ("User_Eco_Warrior", 41.008, 29.012, "vegan, sebze, organik"),
            ("User_Student_Budget", 41.012, 29.005, "ekonomik, hızlı, doyurucu"),
            ("User_Gourmet_Taste", 41.005, 29.015, "tatlı, gurme, yerel")
        ]
        cur.executemany("INSERT INTO users (name, lat, lng, preferences) VALUES (%s, %s, %s, %s)", users)

        # 4. Dükkanlar
        shops = [
            ("Bereket Fırını", 41.010, 29.010, "unlu mamul, kahvaltı"),
            ("Yeşil Mutfak", 41.011, 29.011, "vegan, ev yemeği"),
            ("Usta Kebapçı", 41.009, 29.009, "kebap, içecek, meze")
        ]
        cur.executemany("INSERT INTO shops (name, lat, lng, category_tags) VALUES (%s, %s, %s, %s)", shops)

        # 5. İlanlar (Listings)
        listings = [
            (1, "Sıcak Poğaça Paketi", 60, 20, "Kahvaltı"),
            (1, "Simit & Çay Menü", 40, 15, "Kahvaltı"),
            (3, "Adana Kebap (Porsiyon)", 200, 80, "Ana Yemek"),
            (3, "Ayran (Büyük)", 30, 10, "İçecek"),
            (2, "Zeytinyağlı Enginar", 120, 50, "Vegan")
        ]
        cur.executemany("INSERT INTO listings (shop_id, title, price, discount_price, category) VALUES (%s, %s, %s, %s, %s)", listings)

        # 6. Market Basket Analizi İçin Geçmiş Veri (Order History)
        order_samples = []
        for _ in range(50): 
            # Kebap (ID: 3) + Ayran (ID: 4) Kombosu
            order_samples.append((3, 4))
        
        execute_values(cur, "INSERT INTO order_history (item_a_id, item_b_id) VALUES %s", order_samples)

        conn.commit()
        print("✅ Veritabanı başarıyla tohumlandı! Ömer artık algoritmalarını çalıştırabilir.")

    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    seed_data()