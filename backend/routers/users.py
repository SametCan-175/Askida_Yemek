"""
POST /users/rozetler  → AI rozeti hesaplayıp gönderir, biz kaydederiz
GET  /users/rozetler  → Kullanıcı kendi rozetlerini görür
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from schemas import UserUpdate, UserOut
from database import get_db
from models import User, UserBadge
from security import get_current_user

router = APIRouter()


# ─── Şemalar ──────────────────────────────────────────────────────────────────

class RozetEkle(BaseModel):
    user_id: int
    name: str
    emoji: Optional[str] = None
    description: Optional[str] = None


class RozetOut(BaseModel):
    id: int
    name: str
    emoji: Optional[str]
    description: Optional[str]
    earned_at: datetime

    model_config = {"from_attributes": True}


# ─── Endpoint'ler ─────────────────────────────────────────────────────────────

@router.post("/rozetler", status_code=201)
def rozet_ekle(
    payload: RozetEkle,
    db: Session = Depends(get_db),
):

    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    # Aynı rozeti tekrar ekleme
    mevcut = db.query(UserBadge).filter(
        UserBadge.user_id == payload.user_id,
        UserBadge.name == payload.name,
    ).first()
    if mevcut:
        return {"mesaj": "Bu rozet zaten mevcut.", "rozet_id": mevcut.id}

    rozet = UserBadge(
        user_id=payload.user_id,
        name=payload.name,
        emoji=payload.emoji,
        description=payload.description,
    )
    db.add(rozet)
    db.commit()
    db.refresh(rozet)

    return {
        "mesaj": "Rozet başarıyla eklendi.",
        "rozet_id": rozet.id,
        "user_id": payload.user_id,
        "name": rozet.name,
        "emoji": rozet.emoji,
    }


@router.get("/rozetler", response_model=List[RozetOut])
def benim_rozetlerim(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Giriş yapan kullanıcının tüm rozetlerini döner."""
    return (
        db.query(UserBadge)
        .filter(UserBadge.user_id == current_user.id)
        .order_by(UserBadge.earned_at.desc())
        .all()
    )

from schemas import UserUpdate


@router.put("/me", response_model=UserOut)
def update_my_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kendi profilimi güncelle."""
    if payload.full_name is not None:
        if len(payload.full_name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Ad çok kısa.")
        current_user.full_name = payload.full_name.strip()
    
    if payload.phone is not None:
        current_user.phone = payload.phone.strip() or None
    if payload.birth_date is not None:
        current_user.birth_date = payload.birth_date.strip() or None
    if payload.gender is not None:
        current_user.gender = payload.gender.strip() or None
    if payload.city is not None:
        current_user.city = payload.city.strip() or None
    if payload.district is not None:
        current_user.district = payload.district.strip() or None
    if payload.address is not None:
        current_user.address = payload.address.strip() or None
    
    db.commit()
    db.refresh(current_user)    
    return current_user
@router.delete("/me")
def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Kendi hesabımı kalıcı olarak sil.
    İşletme hesapları için: önce mağaza ve bağlı kayıtlar silinmeli.
    """
    user_id = current_user.id
    role = current_user.role
    
    # Eğer işletme hesabıysa, mağazasını ve bağlı her şeyi sil
    if role == "business":
        from models import Shop, Listing, Reservation, ShopHours, ShopBank, WithdrawRequest, ListingAiScore
        
        shop = db.query(Shop).filter(Shop.owner_id == user_id).first()
        if shop:
            # AI skorları sil
            listing_ids = [l.id for l in db.query(Listing).filter(Listing.shop_id == shop.id).all()]
            if listing_ids:
                db.query(ListingAiScore).filter(ListingAiScore.listing_id.in_(listing_ids)).delete(synchronize_session=False)
                db.query(Reservation).filter(Reservation.listing_id.in_(listing_ids)).delete(synchronize_session=False)
            
            # Listings sil
            db.query(Listing).filter(Listing.shop_id == shop.id).delete(synchronize_session=False)
            
            # Shop'a bağlı diğerleri
            db.query(ShopHours).filter(ShopHours.shop_id == shop.id).delete(synchronize_session=False)
            db.query(ShopBank).filter(ShopBank.shop_id == shop.id).delete(synchronize_session=False)
            db.query(WithdrawRequest).filter(WithdrawRequest.shop_id == shop.id).delete(synchronize_session=False)
            
            # Shop sil
            db.delete(shop)
    
    # Müşteri ise rezervasyonlarını sil
    else:
        from models import Reservation
        db.query(Reservation).filter(Reservation.user_id == user_id).delete(synchronize_session=False)
    
    # Bildirimleri ve rozetleri sil
    from models import Notification
    db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
    
    try:
        from models import UserBadge
        db.query(UserBadge).filter(UserBadge.user_id == user_id).delete(synchronize_session=False)
    except Exception:
        pass  # Eğer UserBadge yoksa skip
    
    # Son olarak kullanıcıyı sil
    db.delete(current_user)
    db.commit()
    
    return {"message": "Hesabınız kalıcı olarak silindi."}