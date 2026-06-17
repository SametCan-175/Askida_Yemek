from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import datetime, timezone
from math import radians, cos, sin, asin, sqrt
import logging

from database import get_db
from models import Listing, ListingStatus, ListingAiScore, Shop, User
from schemas import ListingCreate, ListingOut, ListingList
from security import get_current_user, require_business
from services.ai_service import AIService

router = APIRouter()
logger = logging.getLogger(__name__)

# AI servisi tek instance — module-level
ai_service = AIService()


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """İki koordinat arası km cinsinden mesafe."""
    R = 6371
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
    )
    return round(R * 2 * asin(sqrt(a)), 2)


def _to_listing_out(listing: Listing) -> ListingOut:
    """ORM nesnesini schema'ya çevirir, AI skorlarını da ekler."""
    
    # discount_percent hesapla
    if listing.original_price and listing.original_price > 0:
        discount_pct = round(
            (1 - listing.discounted_price / listing.original_price) * 100, 1
        )
    else:
        discount_pct = 0.0

    # AI skorlarını çek
    ai_score = None
    badge_text = None
    ai_description = None

    # Önce canlı AI çağrısından gelen değerleri kontrol et
    if hasattr(listing, "_ai_score"):
        ai_score = getattr(listing, "_ai_score", None)
        badge_text = getattr(listing, "_badge_text", None)
        ai_description = getattr(listing, "_ai_description", None)
    else:
        # DB'de cache'lenmiş AI skoru varsa onu kullan
        ai_data = listing.ai_score
        if ai_data:
            # ListingAiScore back_populates="ai_score" muhtemelen liste döner
            if isinstance(ai_data, list):
                if len(ai_data) > 0:
                    ai_record = ai_data[0]
                    ai_score = ai_record.ai_score
                    badge_text = ai_record.badge_text
                    ai_description = ai_record.ai_description
            else:
                # Tek nesne
                ai_score = ai_data.ai_score
                badge_text = ai_data.badge_text
                ai_description = ai_data.ai_description

    # Pydantic objeyi MANUEL olarak inşa et (model_validate yerine)
    return ListingOut(
        id=listing.id,
        shop_id=listing.shop_id,
        title=listing.title,
        description=listing.description,
        original_price=listing.original_price,
        discounted_price=listing.discounted_price,
        discount_percent=discount_pct,
        quantity=listing.quantity,
        pickup_start=listing.pickup_start,
        pickup_end=listing.pickup_end,
        image_url=listing.image_url,
        status=listing.status,
        created_at=listing.created_at,
        shop=listing.shop,
        ai_score=ai_score,
        badge_text=badge_text,
        ai_description=ai_description,
    )


@router.get("", response_model=ListingList)
def list_listings(
    shop_id: Optional[int] = Query(None, description="Belirli bir işletmenin fırsatları"),
    city: Optional[str] = Query(None, description="Şehre göre filtrele"),
    max_price: Optional[float] = Query(None, description="Maksimum indirimli fiyat"),
    status: Optional[ListingStatus] = Query(ListingStatus.active, description="Durum filtresi"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    # ── AI / KONUM PARAMETRELERİ ──
    lat: Optional[float] = Query(None, description="Kullanıcı enlemi"),
    lon: Optional[float] = Query(None, description="Kullanıcı boylamı"),
    radius: Optional[float] = Query(2.0, description="Yarıçap (km), default 2"),
    user_id: Optional[int] = Query(None, description="Kişiselleştirme için user_id"),
    db: Session = Depends(get_db),
):
    """
    Aktif fırsatları listele.

    - `lat` + `lon` verilirse: konuma göre `radius` km içindekiler döner, mesafeye göre sıralı
    - `lat` + `lon` + `user_id` verilirse: AI servisinden canlı skor çekilir
    - Hiçbiri verilmezse: standart liste (filtre destekli)

    AI servisi offline ise: skorlar `null` döner, endpoint çalışmaya devam eder.
    """
    now = datetime.now(timezone.utc)

    q = (
        db.query(Listing)
        .join(Shop)
        .options(joinedload(Listing.shop))
        .filter(
            Shop.is_active == True,
            Listing.pickup_end >= now,
        )
    )

    if status:
        q = q.filter(Listing.status == status)
    if shop_id:
        q = q.filter(Listing.shop_id == shop_id)
    if city:
        q = q.filter(Shop.city.ilike(f"%{city}%"))
    if max_price is not None:
        q = q.filter(Listing.discounted_price <= max_price)

    listings = q.order_by(Listing.created_at.desc()).all()

    # ── KONUM FİLTRESİ ──
    if lat is not None and lon is not None:
        in_radius = []
        for l in listings:
            if l.shop and l.shop.latitude is not None and l.shop.longitude is not None:
                dist = haversine_km(lat, lon, l.shop.latitude, l.shop.longitude)
                if dist <= radius:
                    l._distance = dist
                    in_radius.append(l)
        listings = sorted(in_radius, key=lambda x: x._distance)

    # Pagination (AI çağrısından önce)
    total = len(listings)
    listings = listings[skip : skip + limit]

    # ── AI ÇAĞRISI ──
    if user_id is not None and lat is not None and lon is not None and listings:
        ai_payload = [
            {
                "listing_id": l.id,
                "kafe": l.shop.name if l.shop else "",
                "kategori": l.shop.category if l.shop else "",
                "urun": l.title,
                "aciklama": l.description or "",
                "indirim_orani": round(
                    (1 - l.discounted_price / l.original_price) * 100, 1
                ) if l.original_price > 0 else 0.0,
                "fiyat": l.discounted_price,
                "mesafe_km": getattr(l, "_distance", 0.0),
            }
            for l in listings
        ]

        user_context = {
            "id": user_id,
            "location": {"latitude": lat, "longitude": lon},
            "preferred_radius_km": radius,
        }

        scored = ai_service.score_listings(user_context, ai_payload)

        # Skorları listing nesnelerine inject et + DB'ye kaydet
        scores_by_id = {s["listing_id"]: s for s in scored}
        for l in listings:
            s = scores_by_id.get(l.id)
            if s:
                l._ai_score = s.get("ai_score")
                l._badge_text = s.get("badge_text")
                l._ai_description = s.get("ai_description")

                # DB'ye yaz (cache amaçlı, AI offline olunca eski skor görünsün)
                existing = db.query(ListingAiScore).filter(
                    ListingAiScore.listing_id == l.id
                ).first()
                if existing:
                    existing.ai_score = s.get("ai_score")
                    existing.badge_text = s.get("badge_text")
                    existing.ai_description = s.get("ai_description")
                else:
                    db.add(ListingAiScore(
                        listing_id=l.id,
                        ai_score=s.get("ai_score"),
                        badge_text=s.get("badge_text"),
                        ai_description=s.get("ai_description"),
                    ))

        try:
            db.commit()
        except Exception as e:
            logger.error(f"AI skor DB kaydı hatası: {e}")
            db.rollback()

    return ListingList(
        total=total,
        listings=[_to_listing_out(l) for l in listings],
    )


@router.get("/{listing_id}", response_model=ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    """Belirli bir fırsatın detayını getir."""
    listing = (
        db.query(Listing)
        .options(joinedload(Listing.shop))
        .filter(Listing.id == listing_id)
        .first()
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Fırsat bulunamadı.")
    return _to_listing_out(listing)


@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Yeni fırsat ilanı oluştur. Sadece business rolü."""
    shop = db.query(Shop).filter(
        Shop.owner_id == current_user.id, Shop.is_active == True
    ).first()
    if not shop:
        raise HTTPException(
            status_code=404,
            detail="Aktif bir işletmeniz bulunamadı. Önce POST /shops ile işletme oluşturun.",
        )

    listing = Listing(shop_id=shop.id, **payload.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    listing.shop  # eager load
    return _to_listing_out(listing)


@router.patch("/{listing_id}/status", response_model=ListingOut)
def update_listing_status(
    listing_id: int,
    new_status: ListingStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Fırsatın durumunu güncelle: active, sold_out, expired."""
    listing = db.query(Listing).options(joinedload(Listing.shop)).filter(
        Listing.id == listing_id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Fırsat bulunamadı.")
    if listing.shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu fırsatı düzenleme yetkiniz yok.")
    listing.status = new_status
    db.commit()
    db.refresh(listing)
    return _to_listing_out(listing)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Fırsatı sil (sadece sahibi)."""
    listing = db.query(Listing).join(Shop).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Fırsat bulunamadı.")
    if listing.shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu fırsatı silme yetkiniz yok.")
    db.delete(listing)
    db.commit()