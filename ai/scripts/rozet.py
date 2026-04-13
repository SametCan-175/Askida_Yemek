import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"
APP_ADI = "Son Lokma"

ROZETLER = [
    {
        "id": "ilk_adim",
        "ad": "İlk Adım",
        "aciklama": "İlk siparişini verdin!",
        "gereken_siparis": 1,
        "emoji": "🌱"
    },
    {
        "id": "firsat_avcisi",
        "ad": "Fırsat Avcısı",
        "aciklama": "5 sipariş tamamladın!",
        "gereken_siparis": 5,
        "emoji": "🎯"
    },
    {
        "id": "israf_onleyici",
        "ad": "İsraf Önleyici",
        "aciklama": "10 sipariş tamamladın!",
        "gereken_siparis": 10,
        "emoji": "♻️"
    },
    {
        "id": "kahraman",
        "ad": "Kahraman Kurtarıcı",
        "aciklama": "25 sipariş tamamladın!",
        "gereken_siparis": 25,
        "emoji": "🦸"
    },
    {
        "id": "efsane",
        "ad": "Efsane Kurtarıcı",
        "aciklama": "50 sipariş tamamladın!",
        "gereken_siparis": 50,
        "emoji": "🏆"
    },
]


def groq_cagir(sistem_prompt, kullanici_mesaji, sicaklik=0.4):
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


def json_parse(yanit):
    try:
        return json.loads(yanit)
    except json.JSONDecodeError:
        temiz = yanit.strip()
        if "```" in temiz:
            temiz = temiz.split("```")[1]
            if temiz.startswith("json"):
                temiz = temiz[4:]
        return json.loads(temiz.strip())


def ajan5_rozet_kontrol(kullanici):
    print("\n[AJAN 5] Rozetler kontrol ediliyor...")

    siparis_sayisi = kullanici.get("toplam_siparis", 0)
    mevcut_rozetler = kullanici.get("rozetler", [])
    mevcut_ids = [r["id"] for r in mevcut_rozetler]

    kazanilmasi_gereken = [
        r for r in ROZETLER
        if siparis_sayisi >= r["gereken_siparis"] and r["id"] not in mevcut_ids
    ]

    if not kazanilmasi_gereken:
        print("[AJAN 5] Yeni rozet yok.")
        siradaki = next(
            (r for r in ROZETLER if r["id"] not in mevcut_ids),
            None
        )
        return {
            "yeni_rozetler": [],
            "kutlama_mesajlari": [],
            "siradaki_rozet": siradaki,
            "kalan_siparis": (siradaki["gereken_siparis"] - siparis_sayisi) if siradaki else 0
        }

    kutlama_mesajlari = []
    for rozet in kazanilmasi_gereken:
        sistem_prompt = f"""Sen {APP_ADI} uygulamasının rozet kutlama yazarısın.
Kullanıcı yeni bir rozet kazandı. Kısa (max 2 cümle), samimi ve heyecanlı
bir kutlama mesajı yaz. Rozet emojisini kullan. Türkçe yaz.
Kullanıcı adıyla hitap et."""

        kullanici_mesaji = f"""
Kullanıcı adı: {kullanici['ad']}
Kazanılan rozet: {rozet['emoji']} {rozet['ad']}
Rozet açıklaması: {rozet['aciklama']}
Toplam sipariş sayısı: {siparis_sayisi}
"""
        mesaj = groq_cagir(sistem_prompt, kullanici_mesaji, sicaklik=0.7)
        kutlama_mesajlari.append({
            "rozet": rozet,
            "mesaj": mesaj.strip()
        })
        kullanici.setdefault("rozetler", []).append(rozet)

    print(f"[AJAN 5] {len(kazanilmasi_gereken)} yeni rozet kazanıldı!")

    guncellenmis_ids = [r["id"] for r in kullanici["rozetler"]]
    siradaki = next(
        (r for r in ROZETLER if r["id"] not in guncellenmis_ids),
        None
    )

    return {
        "yeni_rozetler": kazanilmasi_gereken,
        "kutlama_mesajlari": kutlama_mesajlari,
        "siradaki_rozet": siradaki,
        "kalan_siparis": (siradaki["gereken_siparis"] - siparis_sayisi) if siradaki else 0,
        "guncellenmis_kullanici": kullanici
    }


def siparis_tamamlandi(kullanici):
    kullanici["toplam_siparis"] = kullanici.get("toplam_siparis", 0) + 1

    sonuc = ajan5_rozet_kontrol(kullanici)

    if sonuc["yeni_rozetler"]:
        print("\n" + "🎉 " * 10)
        for km in sonuc["kutlama_mesajlari"]:
            r = km["rozet"]
            print(f"\n  {r['emoji']}  {r['ad']} rozeti kazanıldı!")
            print(f"  📩 {km['mesaj']}")
        print("🎉 " * 10)

    if sonuc["siradaki_rozet"]:
        s = sonuc["siradaki_rozet"]
        print(f"\n  ⏳ Sıradaki rozet: {s['emoji']} {s['ad']} — {sonuc['kalan_siparis']} sipariş kaldı")

    return sonuc


if __name__ == "__main__":
    test_kullanici = {
        "id": "kullanici_123",
        "ad": "Samet",
        "toplam_siparis": 0,
        "rozetler": []
    }

    print("=" * 55)
    print("Rozet Sistemi Testi")
    print("=" * 55)

    for i in range(5):
        print(f"\n--- Sipariş #{i+1} tamamlandı ---")
        siparis_tamamlandi(test_kullanici)