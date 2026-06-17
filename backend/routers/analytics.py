from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from database import get_db
from models import Reservation, ReservationStatus, Listing, Shop

router = APIRouter()


@router.get("/order-history")
def order_history(
    limit: int = Query(500, ge=1, le=2000, description="Kaç kayıt dönsün"),
    kategori: Optional[str] = Query(None, description="Kategoriye göre filtrele"),
    db: Session = Depends(get_db),
):
    q = (
        db.query(Reservation)
        .join(Listing)
        .join(Shop)
        .options(
            joinedload(Reservation.listing).joinedload(Listing.shop)
        )
        .filter(Reservation.status == ReservationStatus.picked_up)
    )

    if kategori:
        q = q.filter(Shop.category.ilike(f"%{kategori}%"))

    rezervasyonlar = q.order_by(Reservation.created_at.desc()).limit(limit).all()

    return {
        "toplam": len(rezervasyonlar),
        "order_history": [
            {
                "user_id": r.user_id,          
                "listing_id": r.listing_id,
                "kategori": r.listing.shop.category,
                "urun": r.listing.title,
                "fiyat": r.listing.discounted_price,
                "adet": r.quantity,
                "tarih": r.created_at.isoformat(),
                "konum": {
                    "lat": r.listing.shop.latitude,
                    "lon": r.listing.shop.longitude,
                    "sehir": r.listing.shop.city,
                },
            }
            for r in rezervasyonlar
        ],
    }