from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import List

from database import get_db
from models import Shop, Listing, Reservation, WithdrawRequest, ShopBank, User
from schemas import WalletBalance, WalletTransaction, WithdrawCreate, WithdrawOut
from security import require_business

router = APIRouter()


def _check_shop_owner(shop_id: int, db: Session, user: User) -> Shop:
    """Mağaza var mı + kullanıcı sahibi mi kontrol et."""
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Mağaza bulunamadı.")
    if shop.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Bu mağazanın bilgilerine erişim yetkiniz yok.")
    return shop


def _calculate_total_earned(shop_id: int, db: Session) -> float:
    """Mağazanın picked_up siparişlerinden toplam geliri hesapla."""
    reservations = (
        db.query(Reservation)
        .join(Listing, Reservation.listing_id == Listing.id)
        .filter(Listing.shop_id == shop_id, Reservation.status == "picked_up")
        .options(joinedload(Reservation.listing))
        .all()
    )
    total = 0.0
    for r in reservations:
        if r.listing:
            total += r.listing.discounted_price * r.quantity
    return round(total, 2)


@router.get("/{shop_id}/wallet/balance", response_model=WalletBalance)
def get_wallet_balance(
    shop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Cüzdan bakiyesini hesapla."""
    _check_shop_owner(shop_id, db, current_user)

    total_earned = _calculate_total_earned(shop_id, db)

    # Çekilen + bekleyen
    withdraws = db.query(WithdrawRequest).filter(WithdrawRequest.shop_id == shop_id).all()
    total_withdrawn = round(sum(w.amount for w in withdraws if w.status == "paid"), 2)
    pending_withdraw = round(sum(w.amount for w in withdraws if w.status in ("pending", "approved")), 2)

    available = round(total_earned - total_withdrawn - pending_withdraw, 2)

    return WalletBalance(
        shop_id=shop_id,
        total_earned=total_earned,
        total_withdrawn=total_withdrawn,
        pending_withdraw=pending_withdraw,
        available_balance=max(0.0, available),
    )


@router.get("/{shop_id}/wallet/transactions", response_model=List[WalletTransaction])
def get_wallet_transactions(
    shop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Cüzdan hareketlerini getir (gelirler + çekme talepleri, tarihe göre)."""
    _check_shop_owner(shop_id, db, current_user)

    transactions: List[WalletTransaction] = []

    # Gelirler (picked_up siparişler)
    reservations = (
        db.query(Reservation)
        .join(Listing, Reservation.listing_id == Listing.id)
        .filter(Listing.shop_id == shop_id, Reservation.status == "picked_up")
        .options(joinedload(Reservation.listing))
        .all()
    )
    for r in reservations:
        if r.listing:
            transactions.append(WalletTransaction(
                id=f"order-{r.id}",
                type="income",
                amount=round(r.listing.discounted_price * r.quantity, 2),
                description=f"{r.listing.title} · {r.quantity} adet",
                status="completed",
                created_at=r.created_at,
            ))

    # Çekme talepleri
    withdraws = db.query(WithdrawRequest).filter(WithdrawRequest.shop_id == shop_id).all()
    for w in withdraws:
        transactions.append(WalletTransaction(
            id=f"withdraw-{w.id}",
            type="withdraw",
            amount=-w.amount,
            description=f"Para Çekme · {w.iban[:8]}...{w.iban[-4:]}",
            status=w.status,
            created_at=w.created_at,
        ))

    # En yeniden eskiye sırala
    transactions.sort(key=lambda t: t.created_at, reverse=True)
    return transactions


@router.post("/{shop_id}/wallet/withdraw", response_model=WithdrawOut)
def create_withdraw(
    shop_id: int,
    payload: WithdrawCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Yeni para çekme talebi oluştur."""
    _check_shop_owner(shop_id, db, current_user)

    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Miktar 0'dan büyük olmalı.")

    # IBAN: payload'da yoksa shop'un kayıtlı bankasından al
    iban = payload.iban
    if not iban:
        bank = db.query(ShopBank).filter(ShopBank.shop_id == shop_id).first()
        if not bank:
            raise HTTPException(
                status_code=400, 
                detail="Önce IBAN bilgilerinizi kaydedin veya talepte IBAN belirtin."
            )
        iban = bank.iban

    # Bakiye kontrolü
    total_earned = _calculate_total_earned(shop_id, db)
    withdraws = db.query(WithdrawRequest).filter(WithdrawRequest.shop_id == shop_id).all()
    total_withdrawn = sum(w.amount for w in withdraws if w.status == "paid")
    pending_withdraw = sum(w.amount for w in withdraws if w.status in ("pending", "approved"))
    available = total_earned - total_withdrawn - pending_withdraw

    if payload.amount > available:
        raise HTTPException(
            status_code=400, 
            detail=f"Yetersiz bakiye. Çekilebilir: {available:.2f}₺"
        )

    new_withdraw = WithdrawRequest(
        shop_id=shop_id,
        amount=payload.amount,
        iban=iban,
        note=payload.note,
        status="pending",
    )
    db.add(new_withdraw)
    db.commit()
    db.refresh(new_withdraw)
    return WithdrawOut.model_validate(new_withdraw)


@router.get("/{shop_id}/wallet/withdraws", response_model=List[WithdrawOut])
def get_withdraws(
    shop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Mağazanın tüm çekme taleplerini getir."""
    _check_shop_owner(shop_id, db, current_user)
    withdraws = (
        db.query(WithdrawRequest)
        .filter(WithdrawRequest.shop_id == shop_id)
        .order_by(WithdrawRequest.created_at.desc())
        .all()
    )
    return [WithdrawOut.model_validate(w) for w in withdraws]