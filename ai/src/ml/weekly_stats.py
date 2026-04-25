import os
from datetime import datetime, timedelta
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"
APP_ADI = "Son Lokma"


def groq_cagir(sistem_prompt, kullanici_mesaji, sicaklik=0.5):
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": sistem_prompt},
            {"role": "user", "content": kullanici_mesaji}
        ],
        temperature=sicaklik,
        max_tokens=512,
    )
    return response.choices[0].message.content


def bu_haftanin_siparislerini_al(siparis_gecmisi):
    bugun = datetime.now()
    haftanin_basi = bugun - timedelta(days=bugun.weekday())
    haftanin_basi = haftanin_basi.replace(hour=0, minute=0, second=0, microsecond=0)

    return [
        s for s in siparis_gecmisi
        if datetime.fromisoformat(s["tarih"]) >= haftanin_basi
    ]


def istatistik_hesapla(haftalik_siparisler):
    if not haftalik_siparisler:
        return None

    toplam_siparis = len(haftalik_siparisler)
    toplam_tasarruf = sum(
        s["orijinal_fiyat"] - s["odenen_fiyat"]
        for s in haftalik_siparisler
    )
    toplam_harcama = sum(s["odenen_fiyat"] for s in haftalik_siparisler)

    kategori_sayaci = {}
    for s in haftalik_siparisler:
        for kategori in s.get("kategoriler", []):
            kategori_sayaci[kategori] = kategori_sayaci.get(kategori, 0) + 1

    en_sevilen = max(kategori_sayaci, key=kategori_sayaci.get) if kategori_sayaci else None

    kafe_sayaci = {}
    for s in haftalik_siparisler:
        kafe = s.get("kafe", "")
        kafe_sayaci[kafe] = kafe_sayaci.get(kafe, 0) + 1

    en_cok_gidilen = max(kafe_sayaci, key=kafe_sayaci.get) if kafe_sayaci else None

    tahmini_kg = round(toplam_siparis * 0.35, 2)

    return {
        "toplam_siparis": toplam_siparis,
        "toplam_tasarruf": round(toplam_tasarruf, 2),
        "toplam_harcama": round(toplam_harcama, 2),
        "en_sevilen_kategori": en_sevilen,
        "en_cok_gidilen_kafe": en_cok_gidilen,
        "onlenen_israf_kg": tahmini_kg,
        "kategori_dagilimi": kategori_sayaci,
    }


def ajan6_haftalik_istatistik(kullanici):
    print("\n[AJAN 6] Haftalık istatistikler hesaplanıyor...")

    haftalik = bu_haftanin_siparislerini_al(kullanici.get("siparis_gecmisi", []))
    istatistik = istatistik_hesapla(haftalik)

    if not istatistik:
        print("[AJAN 6] Bu hafta henüz sipariş yok.")
        return {
            "istatistik": None,
            "ozet_mesaj": f"Bu hafta henüz bir sipariş vermedin. {APP_ADI}'da seni bekliyoruz! 🍽️"
        }

    sistem_prompt = f"""Sen {APP_ADI} uygulamasının haftalık özet yazarısın.
Kullanıcıya bu haftaki alışveriş istatistiklerini samimi, motive edici ve kısa (max 3 cümle) 
bir şekilde özetle. Tasarrufu ve israf önlemeyi ön plana çıkar. Türkçe yaz. Emoji kullan."""

    kullanici_mesaji = f"""
Kullanıcı adı: {kullanici['ad']}
Bu haftaki sipariş sayısı: {istatistik['toplam_siparis']}
Toplam tasarruf: {istatistik['toplam_tasarruf']}₺
Toplam harcama: {istatistik['toplam_harcama']}₺
En sevilen kategori: {istatistik['en_sevilen_kategori']}
En çok gidilen kafe: {istatistik['en_cok_gidilen_kafe']}
Önlenen israf: {istatistik['onlenen_israf_kg']} kg
"""

    ozet = groq_cagir(sistem_prompt, kullanici_mesaji, sicaklik=0.7)

    print("[AJAN 6] İstatistikler hazır.")
    return {
        "istatistik": istatistik,
        "ozet_mesaj": ozet.strip()
    }


def run():
    """
    APScheduler tarafından her Pazartesi 09:00'de otomatik çağrılır.
    Batuhan'ın scheduler'ı: scheduler.add_job(weekly_stats.run, 'cron', day_of_week='mon', hour=9)
    """
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    print(f"\n[AJAN 6] {datetime.now().strftime('%d.%m.%Y %H:%M')} — Haftalık istatistikler hesaplanıyor...")

    try:
        from services.api_client import AIListingService
        import requests

        # Batuhan'dan tüm kullanıcıların sipariş geçmişini çek
        response = requests.get("http://127.0.0.1:8000/analytics/order-history")
        response.raise_for_status()
        kullanicilar = response.json()

        if not kullanicilar:
            raise Exception("Kullanıcı verisi boş")

        # Her kullanıcı için haftalık istatistik hesapla
        tum_sonuclar = []
        for kullanici in kullanicilar:
            sonuc = ajan6_haftalik_istatistik(kullanici)
            tum_sonuclar.append({
                "kullanici_id": kullanici.get("id"),
                "sonuc": sonuc
            })
            print(f"[AJAN 6] ✅ {kullanici.get('ad', 'Kullanıcı')} — istatistik hazır")

    except Exception as e:
        print(f"[AJAN 6] API hatası ({e}), test verisiyle çalışıyor...")

        # Fallback: test verisiyle çalış
        test_kullanici = {
            "id": "test_user",
            "ad": "Test Kullanıcı",
            "siparis_gecmisi": [
                {
                    "id": "s1", "kafe": "Merkez Kafe", "urun": "Karışık Sandviç",
                    "kategoriler": ["sandviç", "et"],
                    "orijinal_fiyat": 120, "odenen_fiyat": 48,
                    "tarih": (datetime.now() - timedelta(days=1)).isoformat()
                },
                {
                    "id": "s2", "kafe": "Green Bowl", "urun": "Vegan Wrap",
                    "kategoriler": ["vegan", "wrap"],
                    "orijinal_fiyat": 150, "odenen_fiyat": 67,
                    "tarih": (datetime.now() - timedelta(days=2)).isoformat()
                },
            ]
        }
        sonuc = ajan6_haftalik_istatistik(test_kullanici)
        tum_sonuclar = [{"kullanici_id": "test", "sonuc": sonuc}]

    print(f"[AJAN 6] ✅ Tamamlandı — {len(tum_sonuclar)} kullanıcı işlendi.")
    return tum_sonuclar


if __name__ == "__main__":

    test_kullanici = {
        "ad": "Samet",
        "siparis_gecmisi": [
            {
                "id": "s1", "kafe": "Merkez Kafe", "urun": "Karışık Sandviç",
                "kategoriler": ["sandviç", "et"],
                "orijinal_fiyat": 120, "odenen_fiyat": 48,
                "tarih": (datetime.now() - timedelta(days=1)).isoformat()
            },
            {
                "id": "s2", "kafe": "Green Bowl", "urun": "Vegan Wrap",
                "kategoriler": ["vegan", "wrap"],
                "orijinal_fiyat": 150, "odenen_fiyat": 67,
                "tarih": (datetime.now() - timedelta(days=2)).isoformat()
            },
            {
                "id": "s3", "kafe": "Merkez Kafe", "urun": "Mercimek Çorbası",
                "kategoriler": ["çorba", "vegan"],
                "orijinal_fiyat": 80, "odenen_fiyat": 40,
                "tarih": (datetime.now() - timedelta(days=3)).isoformat()
            },
        ]
    }

    sonuc = ajan6_haftalik_istatistik(test_kullanici)

    print("\n" + "=" * 55)
    print("📊 HAFTALIK İSTATİSTİK")
    print("=" * 55)
    ist = sonuc["istatistik"]
    print(f"  Sipariş sayısı    : {ist['toplam_siparis']}")
    print(f"  Toplam tasarruf   : {ist['toplam_tasarruf']}₺")
    print(f"  Toplam harcama    : {ist['toplam_harcama']}₺")
    print(f"  En sevilen        : {ist['en_sevilen_kategori']}")
    print(f"  En çok gidilen    : {ist['en_cok_gidilen_kafe']}")
    print(f"  Önlenen israf     : {ist['onlenen_israf_kg']} kg")
    print(f"\n  📩 {sonuc['ozet_mesaj']}")