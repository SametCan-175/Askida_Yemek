from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import datetime, timezone

from database import get_db
from models import Listing, ListingStatus, Shop, User
from schemas import ListingCreate, ListingOut, ListingList
from security import get_current_user, require_business

router = APIRouter()


def _to_listing_out(listing: Listing) -> ListingOut:
    """ORM nesnesini discount_percent ile birlikte schema'ya çevirir."""
    obj = ListingOut.model_validate(listing)
    if listing.original_price > 0:
        obj.discount_percent = round(
            (1 - listing.discounted_price / listing.original_price) * 100, 1
        )
    else:
        obj.discount_percent = 0.0
    return obj


@router.get("", response_model=ListingList)
def list_listings(
    shop_id: Optional[int] = Query(None, description="Belirli bir işletmenin fırsatlarını getir"),
    city: Optional[str] = Query(None, description="Şehre göre filtrele"),
    max_price: Optional[float] = Query(None, description="Maksimum indirimli fiyat"),
    status: Optional[ListingStatus] = Query(ListingStatus.active, description="Durum filtresi"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Aktif fırsatları listele. Şehir, fiyat ve işletme filtreleri desteklenir.
    Sonuçlar oluşturulma tarihine göre yeniden eskiye sıralanır.
    """
    q = (
        db.query(Listing)
        .join(Shop)
        .options(joinedload(Listing.shop))
        .filter(Shop.is_active == True)
    )

    if status:
        q = q.filter(Listing.status == status)
    if shop_id:
        q = q.filter(Listing.shop_id == shop_id)
    if city:
        q = q.filter(Shop.city.ilike(f"%{city}%"))
    if max_price is not None:
        q = q.filter(Listing.discounted_price <= max_price)

    # Sadece teslim süresi geçmemiş fırsatlar
    now = datetime.now(timezone.utc)
    q = q.filter(Listing.pickup_end >= now)

    total = q.count()
    listings = q.order_by(Listing.created_at.desc()).offset(skip).limit(limit).all()

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
    """
    Yeni fırsat ilanı oluştur. Sadece **business** rolü ve işletmesi olan kullanıcılar kullanabilir.
    """
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

    # shop ilişkisini yükle
    db.refresh(listing)
    listing.shop  # eager load trigger
    return _to_listing_out(listing)


@router.patch("/{listing_id}/status", response_model=ListingOut)
def update_listing_status(
    listing_id: int,
    new_status: ListingStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Fırsatın durumunu güncelle: `active`, `sold_out`, `expired`."""
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
    """Fırsatı sil (sadece sahibi silebilir)."""
    listing = db.query(Listing).join(Shop).filter(
        Listing.id == listing_id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Fırsat bulunamadı.")
    if listing.shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu fırsatı silme yetkiniz yok.")

    db.delete(listing)
    db.commit()