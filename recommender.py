from text_processor import urunleri_isle

AGIRLIKLAR = {
    "kategori_eslesme": 0.35,
    "tercih_gecmisi":   0.25,
    "fiyat_skoru":      0.20,
    "mesafe_skoru":     0.12,
    "yildiz_skoru":     0.08,
}


def kullanici_profili_vektoru(kullanici):
    vektor = {}
    tercihler = kullanici.get("tercihler", [])
    gecmis = kullanici.get("tercih_gecmisi", {})
    toplam_gecmis = sum(gecmis.values()) or 1

    for kategori in tercihler:
        vektor[kategori] = vektor.get(kategori, 0) + 0.5

    for kategori, sayi in gecmis.items():
        agirlik = sayi / toplam_gecmis
        vektor[kategori] = vektor.get(kategori, 0) + agirlik

    maksimum = max(vektor.values()) if vektor else 1
    return {k: round(v / maksimum, 4) for k, v in vektor.items()}


def kosinüs_benzerligi(vektor1, vektor2):
    ortak = set(vektor1) & set(vektor2)
    if not ortak:
        return 0.0
    carpim = sum(vektor1[k] * vektor2[k] for k in ortak)
    norm1 = sum(v ** 2 for v in vektor1.values()) ** 0.5
    norm2 = sum(v ** 2 for v in vektor2.values()) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return round(carpim / (norm1 * norm2), 4)


def kategori_eslesme_skoru(kullanici_vektor, urun_kategori_skorlari):
    urun_vektor = {}
    toplam = sum(urun_kategori_skorlari.values()) or 1
    for k, v in urun_kategori_skorlari.items():
        urun_vektor[k] = round(v / toplam, 4)
    return kosinüs_benzerligi(kullanici_vektor, urun_vektor)


def tercih_gecmisi_skoru(kullanici, urun_kategoriler):
    gecmis = kullanici.get("tercih_gecmisi", {})
    toplam = sum(gecmis.values()) or 1
    skor = sum(gecmis.get(k, 0) for k in urun_kategoriler)
    return min(round(skor / toplam, 4), 1.0)


def fiyat_skoru(urun, kullanici):
    indirim = urun.get("indirim", 0)
    fiyat = urun.get("fiyat", 100)
    max_butce = kullanici.get("max_butce", 200)

    indirim_katkisi = indirim / 100
    butce_katkisi = max(0, 1 - (fiyat * (1 - indirim / 100)) / max_butce)
    return round((indirim_katkisi * 0.6 + butce_katkisi * 0.4), 4)


def mesafe_skoru(mesafe_km, max_mesafe_km):
    if mesafe_km >= max_mesafe_km:
        return 0.0
    return round(1 - (mesafe_km / max_mesafe_km), 4)


def yildiz_skoru(yildiz):
    return round(min(yildiz / 5.0, 1.0), 4)


def urun_puan(urun, kullanici, kullanici_vektor):
    kategori_skorlari = urun.get("kategori_skorlari", {})
    kategoriler = urun.get("kategoriler", [])

    s_kategori = kategori_eslesme_skoru(kullanici_vektor, kategori_skorlari)
    s_gecmis   = tercih_gecmisi_skoru(kullanici, kategoriler)
    s_fiyat    = fiyat_skoru(urun, kullanici)
    s_mesafe   = mesafe_skoru(urun.get("mesafe_km", 0), kullanici.get("max_mesafe_km", 1.0))
    s_yildiz   = yildiz_skoru(urun.get("yildiz", 3.0))

    toplam = (
        s_kategori * AGIRLIKLAR["kategori_eslesme"] +
        s_gecmis   * AGIRLIKLAR["tercih_gecmisi"]   +
        s_fiyat    * AGIRLIKLAR["fiyat_skoru"]       +
        s_mesafe   * AGIRLIKLAR["mesafe_skoru"]      +
        s_yildiz   * AGIRLIKLAR["yildiz_skoru"]
    )

    kopyasi = urun.copy()
    kopyasi["final_skor"] = round(toplam, 4)
    kopyasi["skor_detay"] = {
        "kategori_eslesme": s_kategori,
        "tercih_gecmisi":   s_gecmis,
        "fiyat_skoru":      s_fiyat,
        "mesafe_skoru":     s_mesafe,
        "yildiz_skoru":     s_yildiz,
    }
    return kopyasi


def oneri_uret(kullanici, urun_listesi, ilk_n=3):
    islenmis = urunleri_isle(urun_listesi)
    kullanici_vektor = kullanici_profili_vektoru(kullanici)

    puanlananlar = [urun_puan(u, kullanici, kullanici_vektor) for u in islenmis]
    puanlananlar.sort(key=lambda x: x["final_skor"], reverse=True)
    return puanlananlar[:ilk_n]


if __name__ == "__main__":
    test_urunler = [
        {
            "id": "u1", "kafe": "Merkez Kafe", "urun": "Karışık Sandviç",
            "aciklama": "Izgara tavuk ve taze sebzelerle hazırlanmış sandviç",
            "etiketler": ["sandviç", "tavuk"], "fiyat": 120, "indirim": 60,
            "mesafe_km": 0.3, "yildiz": 4.5
        },
        {
            "id": "u2", "kafe": "Kampüs Bistro", "urun": "Mercimek Çorbası",
            "aciklama": "Ev yapımı sıcak mercimek çorbası",
            "etiketler": ["çorba", "vegan"], "fiyat": 80, "indirim": 50,
            "mesafe_km": 0.8, "yildiz": 4.2
        },
        {
            "id": "u3", "kafe": "Green Bowl", "urun": "Vegan Avokado Wrap",
            "aciklama": "Organik avokado ve taze salata ile vegan wrap",
            "etiketler": ["vegan", "wrap"], "fiyat": 150, "indirim": 55,
            "mesafe_km": 0.2, "yildiz": 4.8
        },
        {
            "id": "u4", "kafe": "Kahve Durağı", "urun": "Filtre Kahve + Brownie",
            "aciklama": "Günlük çekilen filtre kahve ve çikolatalı brownie",
            "etiketler": ["kahve", "tatlı"], "fiyat": 95, "indirim": 45,
            "mesafe_km": 0.5, "yildiz": 4.6
        },
    ]

    test_kullanici = {
        "ad": "Samet",
        "tercihler": ["vegan", "sandviç"],
        "tercih_gecmisi": {"vegan": 5, "sandviç": 3, "çorba": 1},
        "max_mesafe_km": 1.0,
        "max_butce": 200,
    }

    sonuclar = oneri_uret(test_kullanici, test_urunler)

    print("=== SON LOKMA — ÖNERI SONUÇLARI ===\n")
    for i, u in enumerate(sonuclar, 1):
        indirimli = round(u["fiyat"] * (1 - u["indirim"] / 100))
        print(f"[{i}] {u['urun']} — {u['kafe']}")
        print(f"     Fiyat     : {u['fiyat']}₺ → {indirimli}₺ (%{u['indirim']} indirim)")
        print(f"     Mesafe    : {u['mesafe_km']} km | Yıldız: {u['yildiz']}/5")
        print(f"     Kategoriler: {u['kategoriler']}")
        print(f"     Final skor: {u['final_skor']}")
        print(f"     Detay     : {u['skor_detay']}\n")