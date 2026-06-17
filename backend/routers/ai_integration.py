from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os
import requests

from database import get_db
from models import Listing, ListingAiScore, Reservation, ReservationStatus, User

router = APIRouter()

# AI servisinin URL'i (.env'den okur, yoksa localhost:5000)
AI_URL = os.environ.get("AI_URL", "http://127.0.0.1:5000")


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
    Canlı destek endpoint'i. Backend kullanıcının sipariş geçmişini DB'den
    çeker, mesajın başına ekleyip AI servisine (Lokma) yollar.
    AI'nın cevabını döner.
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
            "fiyat": float(r.listing.discounted_price) if r.listing else None,
            "durum": r.status.value if hasattr(r.status, "value") else str(r.status),
            "adet": r.quantity,
        }
        for r in son_siparisler
    ]

    # Sipariş geçmişini insan-okunur metne çevir, mesajın başına context olarak ekle
    if siparis_gecmisi:
        siparis_satirlari = []
        for s in siparis_gecmisi[:5]:  # Son 5 sipariş yeter
            satir = (
                f"- {s['tarih']}: {s['kafe']}'den {s['urun']} "
                f"({s['adet']} adet, {s['fiyat']}₺, durum: {s['durum']})"
            )
            siparis_satirlari.append(satir)
        siparis_metni = "\n".join(siparis_satirlari)
        zenginlestirilmis_mesaj = (
            f"[Sistem bilgisi: Kullanıcının adı '{user.full_name}'. "
            f"Son siparişleri:\n{siparis_metni}\n"
            f"Bu bilgileri kullanarak yanıt ver.]\n\n"
            f"Kullanıcı sorusu: {payload.mesaj}"
        )
    else:
        zenginlestirilmis_mesaj = (
            f"[Sistem bilgisi: Kullanıcının adı '{user.full_name}'. "
            f"Henüz hiç siparişi yok.]\n\n"
            f"Kullanıcı sorusu: {payload.mesaj}"
        )

    # AI servisine (port 5000) istek at
    try:
        ai_response = requests.post(
            f"{AI_URL}/support",
            json={
                "user_id": payload.user_id,
                "mesaj": zenginlestirilmis_mesaj,
                "konusma_gecmisi": payload.konusma_gecmisi,
            },
            timeout=15,
        )
        ai_response.raise_for_status()
        ai_data = ai_response.json()

        # AI'nın cevabını dön + DB'den çekilen sipariş geçmişini de dahil et (debug için)
        return {
            "yanit": ai_data.get("yanit", "Cevap üretilemedi."),
            "guncellenmis_gecmis": ai_data.get("guncellenmis_gecmis", []),
            "siparis_gecmisi": siparis_gecmisi,  # Frontend isterse görsün
        }

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="AI servisi yanıt vermedi.")
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="AI servisi şu an erişilemez.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI çağrısı hatası: {str(e)}")