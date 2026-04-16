from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
import math

from database import get_db
from models import Listing, ListingStatus, Shop

router = APIRouter()


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """İki koordinat arasındaki mesafeyi km cinsinden hesaplar (Haversine formülü)."""
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


@router.get("/ai-fırsatlar")
def ai_fırsatlar(
    lat: float = Query(..., description="Kullanıcının enlemi"),
    lon: float = Query(..., description="Kullanıcının boylamı"),
    radius: float = Query(2.0, description="Yarıçap (km), varsayılan 2 km"),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    listings = (
        db.query(Listing)
        .join(Shop)
        .options(joinedload(Listing.shop))
        .filter(
            Listing.status == ListingStatus.active,
            Listing.pickup_end >= now,
            Shop.is_active == True,
            Shop.latitude.isnot(None),
            Shop.longitude.isnot(None),
        )
        .all()
    )

    sonuclar = []
    for listing in listings:
        mesafe = haversine_km(lat, lon, listing.shop.latitude, listing.shop.longitude)
        if mesafe <= radius:
            sonuclar.append({
                "id": listing.id,
                "kafe": listing.shop.name,
                "kategori": listing.shop.category,
                "urun": listing.title,
                "aciklama": listing.description,
                "indirim_orani": round(
                    (1 - listing.discounted_price / listing.original_price) * 100, 1
                ) if listing.original_price > 0 else 0,
                "fiyat": listing.discounted_price,
                "adet": listing.quantity,
                "konum": {
                    "lat": listing.shop.latitude,
                    "lon": listing.shop.longitude,
                },
                "mesafe_km": mesafe,
                "son_saat": listing.pickup_end.isoformat(),
            })

    # Mesafeye göre sırala (en yakın önce)
    sonuclar.sort(key=lambda x: x["mesafe_km"])

    return sonuclar