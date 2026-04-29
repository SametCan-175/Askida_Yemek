from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from typing import Optional, List
import math

from database import get_db
from models import Listing, ListingStatus, Shop, Reservation, ReservationStatus

router = APIRouter()


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
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
    user_id: Optional[int] = Query(None, description="Kullanıcı ID — AI kişiselleştirme için"),
    current_cart: Optional[str] = Query(None, description="Sepetteki kategori/ürün listesi (virgülle ayrılmış)"),
    db: Session = Depends(get_db),
):
    """
    AI modülü için endpoint.

    Verilen koordinat etrafındaki aktif fırsatları döndürür.
    - user_id: AI bu ID ile kullanıcının geçmiş siparişlerine bakarak kişiselleştirme yapabilir.
    - current_cart: Sepetteki ürünler — AI tamamlayıcı öneriler için kullanır.
    - ai_score, badge_text, ai_description alanları AI tarafından doldurulacak, 
      backend null olarak gönderir.

    AI ekibi bu endpoint'i şöyle çağırır:
        GET /listings/ai-fırsatlar?lat=41.010&lon=29.010&radius=2&user_id=5&current_cart=kebap,ayran
    """
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

    # Sepeti listeye çevir (AI'a göndermek için)
    cart_items = [x.strip() for x in current_cart.split(",")] if current_cart else []

    sonuclar = []
    for listing in listings:
        mesafe = haversine_km(lat, lon, listing.shop.latitude, listing.shop.longitude)
        if mesafe <= radius:
            sonuclar.append({
                "listing_id": listing.id,
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
                # --- AI tarafından doldurulacak alanlar ---
                # AI bu endpoint'ten veriyi aldıktan sonra kendi modeliyle
                # aşağıdaki alanları hesaplayıp frontend'e döner.
                "ai_score": None,           # 0.0 - 1.0 arası AI skoru
                "badge_text": None,         # "Günün Yıldızı", "Sana Özel" vb.
                "ai_description": None,     # Kişiselleştirilmiş açıklama
            })

    sonuclar.sort(key=lambda x: x["mesafe_km"])

    # AI'ın ihtiyaç duyduğu meta bilgileri de üst seviyede gönder
    return {
        "user_id": user_id,
        "current_cart": cart_items,
        "listings": sonuclar,
    }