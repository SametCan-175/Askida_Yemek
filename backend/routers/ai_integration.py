from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from database import get_db
from models import Listing, ListingAiScore, Reservation, ReservationStatus, User

router = APIRouter()


# ─── Şemalar ──────────────────────────────────────────────────────────────────

class AiScoreItem(BaseModel):
    listing_id: int
    ai_score: float
    badge_text: Optional[str] = None
    ai_description: Optional[str] = None


class AiScoreBatch(BaseModel):
    scores: List[AiScoreItem]


class SiparisTamamlandi(BaseModel):
    user_id: int
    listing_id: int


# ─── Endpoint'ler ─────────────────────────────────────────────────────────────

@router.post("/listings/ai-scores", status_code=200)
def save_ai_scores(
    payload: AiScoreBatch,
    db: Session = Depends(get_db),
):
    """
    AI'ın hesapladığı skorları, badge metinlerini ve açıklamaları kaydeder.
    Frontend GET /listings veya GET /listings/{id} ile bunları okur.

    AI ekibi toplu gönderir:
    {
      "scores": [
        {"listing_id": 1, "ai_score": 0.95, "badge_text": "Günün Yıldızı", "ai_description": "..."},
        {"listing_id": 2, "ai_score": 0.78, "badge_text": "Sana Özel", "ai_description": "..."}
      ]
    }
    """
    guncellenen = []
    for item in payload.scores:
        listing = db.query(Listing).filter(Listing.id == item.listing_id).first()
        if not listing:
            continue  # Olmayan ilan varsa atla, hata döndürme

        existing = db.query(ListingAiScore).filter(
            ListingAiScore.listing_id == item.listing_id
        ).first()

        if existing:
            existing.ai_score = item.ai_score
            existing.badge_text = item.badge_text
            existing.ai_description = item.ai_description
        else:
            db.add(ListingAiScore(
                listing_id=item.listing_id,
                ai_score=item.ai_score,
                badge_text=item.badge_text,
                ai_description=item.ai_description,
            ))
        guncellenen.append(item.listing_id)

    db.commit()
    return {"mesaj": "Skorlar kaydedildi.", "guncellenen_ilanlar": guncellenen}


@router.post("/ai/siparis-tamamlandi")
def siparis_tamamlandi(
    payload: SiparisTamamlandi,
    db: Session = Depends(get_db),
):

    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı.")

    # Kullanıcının tüm tamamlanmış rezervasyonları
    tum_siparisler = (
        db.query(Reservation)
        .filter(
            Reservation.user_id == payload.user_id,
            Reservation.status == ReservationStatus.picked_up,
        )
        .all()
    )

    # Tasarruf hesabı
    toplam_tasarruf = sum(
        (r.listing.original_price - r.listing.discounted_price) * r.quantity
        for r in tum_siparisler
        if r.listing
    )

    # En çok sipariş verilen kategori
    kategori_sayac: dict = {}
    for r in tum_siparisler:
        if r.listing and r.listing.shop:
            kat = r.listing.shop.category or "bilinmiyor"
            kategori_sayac[kat] = kategori_sayac.get(kat, 0) + 1
    en_cok_kategori = max(kategori_sayac, key=kategori_sayac.get) if kategori_sayac else None

    return {
        "user_id": payload.user_id,
        "listing_id": payload.listing_id,
        "toplam_siparis": len(tum_siparisler),
        "toplam_tasarruf_tl": round(toplam_tasarruf, 2),
        "en_cok_siparis_kategori": en_cok_kategori,
        "kategori_dagilimi": kategori_sayac,
    }

class DestekMesaj(BaseModel):
    user_id: int
    mesaj: str
    konusma_gecmisi: List[Dict[str, Any]] = []


@router.post("/ai/destek")
def canli_destek(
    payload: DestekMesaj,
    db: Session = Depends(get_db),
):
    """
    Canlı destek endpoint'i. AI modülü bu endpoint'ten kullanıcı mesajını alır,
    konuşma geçmişiyle birlikte işler ve yanıt üretir.

    Örnek istek:
    {
        "user_id": 1,
        "mesaj": "Siparişim nerede?",
        "konusma_gecmisi": [
            {"rol": "kullanici", "icerik": "Merhaba"},
            {"rol": "asistan", "icerik": "Merhaba! Size nasıl yardımcı olabilirim?"}
        ]
    }

    Backend şunları ekler:
    - Kullanıcının son rezervasyonları (AI bağlam için kullanır)
    - Kullanıcı adı
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    # Kullanıcının son 5 rezervasyonunu bağlam olarak ekle
    from models import Reservation
    son_rezervasyonlar = (
        db.query(Reservation)
        .filter(Reservation.user_id == payload.user_id)
        .order_by(Reservation.created_at.desc())
        .limit(5)
        .all()
    )

    baglam = [
        {
            "rezervasyon_id": r.id,
            "durum": r.status,
            "listing_id": r.listing_id,
            "adet": r.quantity,
            "tarih": r.created_at.isoformat(),
        }
        for r in son_rezervasyonlar
    ]

    return {
        "user_id": payload.user_id,
        "kullanici_adi": user.full_name,
        "mesaj": payload.mesaj,
        "konusma_gecmisi": payload.konusma_gecmisi,
        "baglam": {
            "son_rezervasyonlar": baglam,
        },
    }