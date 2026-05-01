def get_personalized_recommendations(kullanici, firsatlar):
    """
    Kullanıcının tercihleri ile ürün kategorilerini eşleştirir.
    """
    tercihler = [t.lower() for t in kullanici.get("tercihler", [])]
    onerilenler = []

    for firsat in firsatlar:
        kategori = firsat.get("kategori", "").lower()
        urun_adi = firsat.get("urun", "").lower()

        # Eğer kullanıcının tercihlerinden biri ürün adında veya kategorisinde geçiyorsa öner
        if any(tercih in kategori or tercih in urun_adi for tercih in tercihler):
            firsat["match_reason"] = "Tercihlerinize uygun"
            onerilenler.append(firsat)
        elif not tercihler: # Tercih belirtilmemişse hepsini al
            onerilenler.append(firsat)

    return onerilenler