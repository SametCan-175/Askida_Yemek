"""
POST /users/rozetler  → AI rozeti hesaplayıp gönderir, biz kaydederiz
GET  /users/rozetler  → Kullanıcı kendi rozetlerini görür
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

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