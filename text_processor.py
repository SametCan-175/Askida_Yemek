import math
import re
from collections import Counter

STOPWORDS = {
    "ve", "ile", "bir", "bu", "da", "de", "ki", "mi", "mu", "mü",
    "için", "ama", "veya", "ya", "çok", "daha", "en", "her", "hiç",
    "var", "yok", "olan", "gibi", "kadar", "sonra", "önce",
    "taze", "lezzetli", "güzel", "harika", "enfes", "muhteşem", "özel",
    "günlük", "bugün", "yarın", "sınırlı", "adet", "kalan", "stok",
}

ANAHTAR_KELIMELER = {
    "sandviç", "tost", "burger", "wrap", "dürüm", "pide", "lavaş",
    "çorba", "mercimek", "domates", "ezogelin", "yayla", "tarhana",
    "kahve", "latte", "espresso", "americano", "cappuccino", "mocha", "filtre",
    "tatlı", "pasta", "kek", "kurabiye", "brownie", "cheesecake", "waffle", "tiramisu",
    "vegan", "vejetaryen", "glutensiz", "organik", "doğal",
    "tavuk", "et", "köfte", "döner", "kebap", "sucuk", "sosis",
    "salata", "avokado", "sebze", "meyve",
    "smoothie", "ayran", "limonata", "çay",
    "omlet", "menemen", "yumurta", "kahvaltı",
    "sıcak", "soğuk", "ızgara", "fırın",
}

KATEGORI_ESLESMESI = {
    "sandviç":  ["sandviç", "tost", "wrap", "dürüm", "pide", "lavaş"],
    "burger":   ["burger", "köfte", "et"],
    "çorba":    ["çorba", "mercimek", "ezogelin", "yayla", "tarhana", "domates"],
    "kahve":    ["kahve", "latte", "espresso", "americano", "cappuccino", "mocha", "filtre"],
    "tatlı":    ["tatlı", "pasta", "kek", "kurabiye", "brownie", "cheesecake", "waffle", "tiramisu"],
    "vegan":    ["vegan", "vejetaryen", "avokado", "salata", "sebze", "organik"],
    "et":       ["et", "tavuk", "döner", "kebap", "sucuk", "sosis", "ızgara"],
    "içecek":   ["smoothie", "ayran", "limonata"],
    "kahvaltı": ["kahvaltı", "omlet", "menemen", "yumurta"],
}


def metni_temizle(metin):
    metin = metin.lower()
    metin = re.sub(r"[^\w\s]", " ", metin)
    metin = re.sub(r"\d+", " ", metin)
    kelimeler = metin.split()
    return [k for k in kelimeler if k not in STOPWORDS and len(k) > 2]


def anahtar_kelimeleri_filtrele(kelimeler):
    return [k for k in kelimeler if k in ANAHTAR_KELIMELER]


def tf(kelimeler):
    sayi = Counter(kelimeler)
    toplam = len(kelimeler) or 1
    return {k: v / toplam for k, v in sayi.items()}


def idf(belgeler):
    toplam = len(belgeler)
    sonuc = {}
    tum_kelimeler = set(k for belge in belgeler for k in belge)
    for kelime in tum_kelimeler:
        icerenler = sum(1 for belge in belgeler if kelime in belge)
        sonuc[kelime] = math.log((toplam + 1) / (icerenler + 1)) + 1
    return sonuc


def tfidf(kelimeler, idf_degerleri):
    tf_degerleri = tf(kelimeler)
    return {k: round(tf_degerleri[k] * idf_degerleri.get(k, 1.0), 6) for k in tf_degerleri}


def kategori_bul(tfidf_skorlari):
    bulunanlar = []
    for kategori, kelimeler in KATEGORI_ESLESMESI.items():
        skor = sum(tfidf_skorlari.get(k, 0) for k in kelimeler)
        if skor > 0:
            bulunanlar.append((kategori, round(skor, 6)))
    bulunanlar.sort(key=lambda x: x[1], reverse=True)
    return bulunanlar


def urun_isle(urun, idf_degerleri):
    ham_metin = " ".join([
        urun.get("urun", ""),
        urun.get("kafe", ""),
        urun.get("aciklama", ""),
        " ".join(urun.get("etiketler", []))
    ])
    temiz = metni_temizle(ham_metin)
    anahtar = anahtar_kelimeleri_filtrele(temiz)
    tfidf_skorlari = tfidf(anahtar if anahtar else temiz, idf_degerleri)
    kategoriler = kategori_bul(tfidf_skorlari)

    kopyasi = urun.copy()
    kopyasi["islenmis_kelimeler"] = anahtar
    kopyasi["tfidf_skorlari"] = tfidf_skorlari
    kopyasi["kategoriler"] = [k for k, _ in kategoriler]
    kopyasi["kategori_skorlari"] = dict(kategoriler)
    return kopyasi


def urunleri_isle(urun_listesi):
    belgeler = []
    for urun in urun_listesi:
        ham = " ".join([
            urun.get("urun", ""),
            urun.get("kafe", ""),
            urun.get("aciklama", ""),
            " ".join(urun.get("etiketler", []))
        ])
        temiz = metni_temizle(ham)
        anahtar = anahtar_kelimeleri_filtrele(temiz)
        belgeler.append(anahtar if anahtar else temiz)

    idf_degerleri = idf(belgeler)
    return [urun_isle(urun, idf_degerleri) for urun in urun_listesi]


if __name__ == "__main__":
    test = [
        {
            "id": "u1", "kafe": "Merkez Kafe",
            "urun": "Karışık Sandviç",
            "aciklama": "Izgara tavuk ve taze sebzelerle hazırlanmış sandviç",
            "etiketler": ["sandviç", "tavuk"]
        },
        {
            "id": "u2", "kafe": "Green Bowl",
            "urun": "Vegan Avokado Wrap",
            "aciklama": "Organik avokado, taze salata ve vegan sos ile hazırlandı",
            "etiketler": ["vegan", "wrap"]
        },
        {
            "id": "u3", "kafe": "Kahve Durağı",
            "urun": "Filtre Kahve + Brownie",
            "aciklama": "Günlük çekilen filtre kahve ve çikolatalı brownie",
            "etiketler": ["kahve", "tatlı"]
        },
    ]

    sonuclar = urunleri_isle(test)
    for s in sonuclar:
        print(f"\n{s['urun']}")
        print(f"  Anahtar kelimeler : {s['islenmis_kelimeler']}")
        print(f"  Kategoriler       : {s['kategoriler']}")
        print(f"  TF-IDF skorları   : {s['tfidf_skorlari']}")