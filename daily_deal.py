import os
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"
APP_ADI = "Son Lokma"

AGIRLIKLAR = {
    "indirim_orani":   0.35,
    "fiyat_kalite":    0.30,
    "stok_aciliyeti":  0.20,
    "mekan_puani":     0.15,
}


def groq_cagir(sistem_prompt, kullanici_mesaji, sicaklik=0.6):
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": sistem_prompt},
            {"role": "user", "content": kullanici_mesaji}
        ],
        temperature=sicaklik,
        max_tokens=256,
    )
    return response.choices[0].message.content


def indirim_orani_skoru(indirim):
    return min(indirim / 100, 1.0)


def fiyat_kalite_skoru(fiyat, indirim, max_fiyat=300):
    indirimli = fiyat * (1 - indirim / 100)
    erisebilirlik = max(0, 1 - (indirimli / max_fiyat))
    tasarruf_miktari = min((fiyat - indirimli) / max_fiyat, 1.0)
    return round(erisebilirlik * 0.5 + tasarruf_miktari * 0.5, 4)


def stok_aciliyeti_skoru(adet):
    if adet <= 0:
        return 0.0
    if adet == 1:
        return 1.0
    if adet <= 3:
        return 0.8
    if adet <= 5:
        return 0.5
    return 0.2


def mekan_puani_skoru(yildiz):
    return round(min(yildiz / 5.0, 1.0), 4)


def firsat_puan(urun):
    s_indirim  = indirim_orani_skoru(urun.get("indirim", 0))
    s_fk       = fiyat_kalite_skoru(urun.get("fiyat", 100), urun.get("indirim", 0))
    s_stok     = stok_aciliyeti_skoru(urun.get("adet", 10))
    s_mekan    = mekan_puani_skoru(urun.get("yildiz", 3.0))

    toplam = (
        s_indirim * AGIRLIKLAR["indirim_orani"]  +
        s_fk      * AGIRLIKLAR["fiyat_kalite"]   +
        s_stok    * AGIRLIKLAR["stok_aciliyeti"] +
        s_mekan   * AGIRLIKLAR["mekan_puani"]
    )

    kopyasi = urun.copy()
    kopyasi["firsat_skoru"] = round(toplam, 4)
    kopyasi["firsat_detay"] = {
        "indirim_orani":  round(s_indirim, 4),
        "fiyat_kalite":   round(s_fk, 4),
        "stok_aciliyeti": round(s_stok, 4),
        "mekan_puani":    round(s_mekan, 4),
    }
    return kopyasi


def gunun_en_iyi_firsatini_bul(urun_listesi):
    aktif = [u for u in urun_listesi if u.get("adet", 0) > 0]
    if not aktif:
        return None

    puanlananlar = [firsat_puan(u) for u in aktif]
    puanlananlar.sort(key=lambda x: x["firsat_skoru"], reverse=True)
    return puanlananlar[0]


def ajan7_gunun_firsati(urun_listesi):
    print("\n[AJAN 7] Bugünün en iyi fırsatı aranıyor...")

    en_iyi = gunun_en_iyi_firsatini_bul(urun_listesi)

    if not en_iyi:
        print("[AJAN 7] Bugün uygun fırsat bulunamadı.")
        return {"firsat": None, "kart_metni": "Bugün henüz fırsat eklenmedi. 🕐"}

    indirimli_fiyat = round(en_iyi["fiyat"] * (1 - en_iyi["indirim"] / 100))

    sistem_prompt = f"""Sen {APP_ADI} uygulamasının 'Günün Fırsatı' kart yazarısın.
Sana bir fırsat verilecek. Ana ekranda gösterilecek kısa, çekici ve acele hissi veren
bir kart metni yaz. Maksimum 2 cümle. Fiyatı ve indirimi mutlaka belirt. Türkçe yaz. Emoji kullan."""

    kullanici_mesaji = f"""
Ürün: {en_iyi['urun']}
Kafe: {en_iyi['kafe']}
Normal fiyat: {en_iyi['fiyat']}₺
İndirimli fiyat: {indirimli_fiyat}₺
İndirim oranı: %{en_iyi['indirim']}
Kalan adet: {en_iyi['adet']}
Mekan puanı: {en_iyi['yildiz']}/5
Fırsat skoru: {en_iyi['firsat_skoru']}
"""

    kart_metni = groq_cagir(sistem_prompt, kullanici_mesaji)

    print(f"[AJAN 7] Günün fırsatı: {en_iyi['urun']} — {en_iyi['kafe']} ({en_iyi['firsat_skoru']} puan)")
    return {
        "firsat": en_iyi,
        "indirimli_fiyat": indirimli_fiyat,
        "kart_metni": kart_metni.strip()
    }


if __name__ == "__main__":
    test_urunler = [
        {
            "id": "u1", "kafe": "Merkez Kafe", "urun": "Karışık Sandviç",
            "fiyat": 120, "indirim": 40, "adet": 5, "yildiz": 4.2
        },
        {
            "id": "u2", "kafe": "Green Bowl", "urun": "Vegan Avokado Wrap",
            "fiyat": 150, "indirim": 55, "adet": 2, "yildiz": 4.8
        },
        {
            "id": "u3", "kafe": "Kampüs Bistro", "urun": "Mercimek Çorbası",
            "fiyat": 80, "indirim": 60, "adet": 1, "yildiz": 4.5
        },
        {
            "id": "u4", "kafe": "Kahve Durağı", "urun": "Filtre Kahve + Brownie",
            "fiyat": 95, "indirim": 45, "adet": 8, "yildiz": 4.6
        },
    ]

    sonuc = ajan7_gunun_firsati(test_urunler)

    print("\n" + "=" * 55)
    print(f"🔥 GÜNÜN FIRSATI — {datetime.now().strftime('%d.%m.%Y')}")
    print("=" * 55)
    f = sonuc["firsat"]
    print(f"  Ürün     : {f['urun']} — {f['kafe']}")
    print(f"  Fiyat    : {f['fiyat']}₺ → {sonuc['indirimli_fiyat']}₺ (%{f['indirim']} indirim)")
    print(f"  Kalan    : {f['adet']} adet | ⭐ {f['yildiz']}/5")
    print(f"  Skor     : {f['firsat_skoru']}")
    print(f"  Detay    : {f['firsat_detay']}")
    print(f"\n  📲 {sonuc['kart_metni']}")