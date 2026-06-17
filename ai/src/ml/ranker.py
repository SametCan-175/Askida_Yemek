def feed_ranker(firsatlar):
    """
    Fırsatları matematiksel bir skorla sıralar.
    Skor = (İndirim * 0.4) + (Aciliyet[Stok Azlığı] * 0.4) - (Mesafe * 0.2)
    """
    for firsat in firsatlar:
        # İndirim puanı (0-100 arası)
        indirim_skoru = firsat.get("indirim_orani", 0)

        # Mesafe puanı (Max 10km varsayıyoruz)
        mesafe_skoru = max(0, 100 - (firsat.get("mesafe_km", 0) * 10))

        # Stok aciliyeti (Stok azsa puan yükselir)
        # Batuhan'ın API'si "adet" gönderiyor
        stok_skoru = max(10, 110 - (firsat.get("adet", 5) * 10))

        # Final Skor
        final_skor = (indirim_skoru * 0.4) + (stok_skoru * 0.4) + (mesafe_skoru * 0.2)
        firsat["ai_score"] = round(final_skor / 10, 1)

    return sorted(firsatlar, key=lambda x: x.get("ai_score", 0), reverse=True)