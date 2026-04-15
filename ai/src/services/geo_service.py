import math

def haversine_mesafe(konum1, konum2):
    """
    İki koordinat arasındaki kuş uçuşu mesafeyi (km) hesaplar.
    konum1: {'lat': 41.0, 'lon': 29.0}
    """
    R = 6371  # Dünya'nın yarıçapı (km)

    lat1, lon1 = konum1['lat'], konum1['lon']
    lat2, lon2 = konum2['lat'], konum2['lon']

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c