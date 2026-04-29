from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
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


class DestekMesaj(BaseModel):
    user_id: int
    mesaj: str
    konusma_gecmisi: List[Dict[str, Any]] = []


# ─── Endpoint'ler ─────────────────────────────────────────────────────────────

@router.post("/listings/ai-scores", status_code=200)
def save_ai_scores(
    payload: AiScoreBatch,
    db: Session = Depends(get_db),
):
    """
    AI'ın hesapladığı skorları, badge metinlerini ve açıklamaları kaydeder.
    Frontend GET /listings veya GET /listings/{id} ile bunları okur.
    """
    guncellenen = []
    for item in payload.scores:
        listing = db.query(Listing).filter(Listing.id == item.listing_id).first()
        if not listing:
            continue

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

    tum_siparisler = (
        db.query(Reservation)
        .filter(
            Reservation.user_id == payload.user_id,
            Reservation.status == ReservationStatus.picked_up,
        )
        .all()
    )

    toplam_tasarruf = sum(
        (r.listing.original_price - r.listing.discounted_price) * r.quantity
        for r in tum_siparisler
        if r.listing
    )

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


@router.post("/ai/destek")
def canli_destek(
    payload: DestekMesaj,
    db: Session = Depends(get_db),
):
    """
    Canlı destek endpoint'i. Lokma (AI) bu endpoint'ten veriyi alır.

    Backend otomatik olarak kullanıcının sipariş geçmişini çekip
    siparis_gecmisi alanında döner. Lokma bu veriyi görerek
    "Son siparişin X kafeden Y ürünüydü" gibi gerçek yanıtlar verebilir.

    Dönen format:
    {
        "user_id": 1,
        "kullanici_adi": "Ali",
        "mesaj": "Son siparişim ne?",
        "konusma_gecmisi": [...],
        "siparis_gecmisi": [
            {"urun": "Ekmek Sepeti", "kafe": "Ayşe'nin Fırını",
             "tarih": "2026-04-27", "fiyat": 25, "durum": "picked_up"}
        ]
    }
    """
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    # Kullanıcının son 10 siparişini çek
    son_siparisler = (
        db.query(Reservation)
        .options(
            joinedload(Reservation.listing).joinedload(Listing.shop)
        )
        .filter(Reservation.user_id == payload.user_id)
        .order_by(Reservation.created_at.desc())
        .limit(10)
        .all()
    )

    siparis_gecmisi = [
        {
            "urun": r.listing.title if r.listing else None,
            "kafe": r.listing.shop.name if r.listing and r.listing.shop else None,
            "tarih": r.created_at.strftime("%Y-%m-%d"),
            "fiyat": r.listing.discounted_price if r.listing else None,
            "durum": r.status,
            "adet": r.quantity,
        }
        for r in son_siparisler
    ]

    return {
        "user_id": payload.user_id,
        "kullanici_adi": user.full_name,
        "mesaj": payload.mesaj,
        "konusma_gecmisi": payload.konusma_gecmisi,
        "siparis_gecmisi": siparis_gecmisi,
    }