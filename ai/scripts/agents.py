import os 
import json 
from datetime import datetime
from groq import Groq 
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

SAHTE_URUNLER = [
    {
    "id":"u1",
    "kafe": "Merkez Kafe",
    "urun": "Karışık Sandviç",
    "adet": 3,
    "indirim": 60,
    "konum": {"lat": 41.010, "lon": 29.010},
    "son_saat": "22:00",
    "kategori": "sandviç"
    },
    {
        "id":"u2",
        "kafe": "Kampüs Bistro",
        "urun": "Mercimek Çorbası",
        "adet": 5,
        "indirim": 50,
        "konum": {"lat":40.987, "lon":29.015},
        "son_saat": "21:30",
        "kategori": "çorba"
    },
]
SAHTE_KULLANICI = {
    "id": "kullanici_123",
    "ad": "Samet",
    "konum": {"lat": 41.010, "lon": 29.010},
    "tercihler": ["sandviç", "çorba"],
    "gecmis_siparisler": ["Merkez Kafe", "Kampüs Bistro"],
    "max_mesafe_km": 1.0
}

def mesafe_hesapla(konum1,konum2):
    lat_fark = abs(konum1["lat"]-konum2["lat"])*111
    lon_fark = abs(konum1["lon"]-konum2["lon"])*111
    return round((lat_fark**2 + lon_fark**2)**0.5,2)

def groq_cagir(sistem_prompt, kullanici_mesaji):
    response =client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": sistem_prompt},
            {"role": "user", "content": kullanici_mesaji}
        ],
        temperature=0.4,
        max_tokens=1024,
        )
    return response.choices[0].message.content


def ajan1_firsat_tarayici(kullanici_konum, max_mesafe):
    print("\n[AJAN 1] Fırsatlar taranıyor...")

    uygun_urunler = []

    for urun in SAHTE_URUNLER:
        if urun["adet"] <=0 :
            continue

        mesafe = mesafe_hesapla(kullanici_konum, urun["konum"])
        if mesafe > max_mesafe:
            continue

        urun_kopyasi = urun.copy()
        urun_kopyasi["mesafe_km"] = mesafe
        uygun_urunler.append(urun_kopyasi)

    uygun_urunler.sort(key=lambda x: x["mesafe_km"])
    
    print(f"[AJAN 1] {len(uygun_urunler)} uygun fırsat bulundu.")
    return uygun_urunler

def ajan2_eslestirici(kullanici,firsatlar):
    print("\n[AJAN 2] En iyi eşleşmeler seçiliyor (Groq)...")

    sistem_prompt = """Sen Askıda Yemek uygulamasının akıllı eşleştirme ajanısın. Sana bir kullanıcı profili ve mevcut yiyecek fırsatları listesi verilecek. Kullanıcının tercihlerine, geçmiş siparişlerini ve mesafeyi göz önünde bulundurarak EN İYİ 3 fırsatı çek. 
    SADECE JSON formatında yanıt ver. Başka hiçbir şey yazma.
Format:
[
  {
    "urun_id": "...",
    "skor": 1-10,
    "neden": "kısa gerekçe"
  }
]"""

    kullanici_mesaji = f"""
Kullanıcı Profili:
{json.dumps(kullanici, ensure_ascii=False, indent=2)}

Mevcut Fırsatlar:
{json.dumps(firsatlar, ensure_ascii=False, indent=2)}

En iyi 3 fırsatı seç ve JSON olarak döndür.
"""
    
    yanit = groq_cagir(sistem_prompt, kullanici_mesaji)

    try:
        secimler = json.loads(yanit)
    except json.JSONDecodeError:
        temiz = yanit.strip().removeprefix("```json").removesuffix("```").strip()
        secimler = json.loads(temiz)

    id_harita = {f["id"]: f for f in firsatlar}
    sonuc = []
    for secim in secimler:
        urun = id_harita.get(secim["urun_id"], {})
        sonuc.append({
            **urun,
            "ai_skor": secim["skor"],
            "ai_neden": secim["neden"]
        })

    print(f"[AJAN 2] {len(sonuc)} eşleşme seçildi.")
    return sonuc

def ajan3_bildirim_yazari(kullanici_adi, eslesmeler):
    print("\n[AJAN 3] Bildirim metinleri yazılıyor...")

    sistem_prompt = """Sen ResQ-Food uygulamasının bildirim yazarısın.
Sana bir kullanıcı adı ve yiyecek fırsatı verilecek.
Bu fırsat için KISA (max 2 cümle), SAMIMI ve ACELE HİSSİ veren
bir push notification metni yaz.
Emoji kullanabilirsin. Türkçe yaz."""

    bildirimler = []

    for eslesme in eslesmeler:
        kullanici_mesaji = f"""
Kullanıcı adı: {kullanici_adi}
Kafe: {eslesme['kafe']}
Ürün: {eslesme['urun']}
İndirim: %{eslesme['indirim']}
Kalan adet: {eslesme['adet']}
Mesafe: {eslesme['mesafe_km']} km
Son saat: {eslesme['son_saat']}

Kısa bir push notification metni yaz.
"""
        bildirim = groq_cagir(sistem_prompt, kullanici_mesaji)
        bildirimler.append(bildirim.strip())

    return bildirimler

def resqfood_pipeline(kullanici):
    print("=" * 55)
    print(f"ResQ-Food Pipeline Başladı | {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 55)

    firsatlar = ajan1_firsat_tarayici(
        kullanici_konum=kullanici["konum"],
        max_mesafe=kullanici["max_mesafe_km"]
    )

    if not firsatlar:
        print("\n❌ Uygun fırsat bulunamadı.")
        return {"durum": "fırsat_yok", "bildirimler": []}

    eslesmeler = ajan2_eslestirici(kullanici, firsatlar)

    bildirimler = ajan3_bildirim_yazari(kullanici["ad"], eslesmeler)

    print("\n" + "=" * 55)
    print("📲 ÜRETİLEN BİLDİRİMLER")
    print("=" * 55)
    for i, (eslesme, bildirim) in enumerate(zip(eslesmeler, bildirimler), 1):
        print(f"\n[{i}] {eslesme['kafe']} — {eslesme['urun']}")
        print(f"    AI Skoru: {eslesme['ai_skor']}/10 | {eslesme['ai_neden']}")
        print(f"    📩 {bildirim}")

    return {
        "durum": "basarili",
        "eslesmeler": eslesmeler,
        "bildirimler": bildirimler
    }


if __name__ == "__main__":
    sonuc = resqfood_pipeline(SAHTE_KULLANICI)