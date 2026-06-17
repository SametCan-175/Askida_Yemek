from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models import Notification, User
from security import get_current_user

router = APIRouter()


class NotificationSend(BaseModel):
    user_id: int
    title: str
    body: str
    listing_id: Optional[int] = None
    ai_score: Optional[str] = None
    badge_text: Optional[str] = None


class NotificationOut(BaseModel):
    id: int
    title: str
    body: str
    listing_id: Optional[int]
    ai_score: Optional[str]
    badge_text: Optional[str]
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


@router.post("/send", status_code=201)
def bildirim_gonder(
    payload: NotificationSend,
    db: Session = Depends(get_db),
):
    """
    AI bu endpoint'e bildirim atar, backend kullanıcıya iletir.

    Örnek:
    {
        "user_id": 5,
        "title": "Sana Özel Fırsat!",
        "body": "Kebap seversin, bu ayran tam sana göre!",
        "listing_id": 23,
        "ai_score": "0.95",
        "badge_text": "Günün Yıldızı"
    }
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    notif = Notification(
        user_id=payload.user_id,
        listing_id=payload.listing_id,
        title=payload.title,
        body=payload.body,
        ai_score=payload.ai_score,
        badge_text=payload.badge_text,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    return {
        "mesaj": "Bildirim gönderildi.",
        "notification_id": notif.id,
        "user_id": payload.user_id,
    }


@router.get("/my", response_model=List[NotificationOut])
def benim_bildirimlerim(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Kullanıcının bildirimlerini yeniden eskiye sıralar."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.patch("/{notification_id}/read")
def okundu_isaretle(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bildirimi okundu olarak işaretle."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı.")
    notif.is_read = True
    db.commit()
    return {"mesaj": "Bildirim okundu olarak işaretlendi."}