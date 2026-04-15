import requests

def firsatlari_getir(lat, lon, radius=5.0):
    # --- MOD SEÇİMİ ---
    GERCEK_BACKEND_HAZIR_MI = False
    # ------------------

    if GERCEK_BACKEND_HAZIR_MI:
        try:
            url = f"http://127.0.0.1:8000/listings/?lat={lat}&lon={lon}"
            response = requests.get(url, timeout=5)
            return response.json()
        except Exception as e:
            print(f"Backend hatası: {e}")
            return []
    else:
        # AI Pipeline ile tam uyumlu Mock Veri (İsimler düzeltildi)
        mock_db = [
            {
                "id": 1,
                "kafe": "Bayatlamasın Kafe",
                "urun": "Karışık Sandviç",
                "indirim_orani": 50,
                "stok": 5,
                "konum": {"lat": 41.011, "lon": 29.011},
                "kategori": "sandviç"
            },
            {
                "id": 2,
                "kafe": "Çorba Dünyası",
                "urun": "Mercimek Çorbası",
                "indirim_orani": 70,
                "stok": 3,
                "konum": {"lat": 41.015, "lon": 29.012},
                "kategori": "çorba"
            },
            {
                "id": 3,
                "kafe": "Tatlıcı Selim",
                "urun": "Ekler Pasta",
                "indirim_orani": 40,
                "stok": 10,
                "konum": {"lat": 41.020, "lon": 29.020},
                "kategori": "tatlı"
            }
        ]
        return mock_db