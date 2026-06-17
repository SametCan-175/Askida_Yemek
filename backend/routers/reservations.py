from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Reservation, ReservationStatus, Listing, ListingStatus, User
from schemas import ReservationCreate, ReservationOut, ReservationStatusUpdate
from security import get_current_user, require_business

router = APIRouter()


@router.post("", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
def create_reservation(
    payload: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Kullanıcı bir fırsat için rezervasyon yapar.
    - Stok kontrolü yapılır, stok düşürülür.
    - Stok sıfırlanırsa ilan otomatik `sold_out` olur.
    """
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="İlan bulunamadı.")
    if listing.status != ListingStatus.active:
        raise HTTPException(status_code=400, detail="Bu ilan artık aktif değil.")
    if listing.quantity < payload.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Yeterli stok yok. Mevcut adet: {listing.quantity}",
        )

    # Stok düş
    listing.quantity -= payload.quantity
    if listing.quantity == 0:
        listing.status = ListingStatus.sold_out

    reservation = Reservation(
        user_id=current_user.id,
        listing_id=payload.listing_id,
        quantity=payload.quantity,
        note=payload.note,
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("/my", response_model=list[ReservationOut])
def my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Giriş yapan kullanıcının kendi rezervasyonlarını listeler."""
    return (
        db.query(Reservation)
        .filter(Reservation.user_id == current_user.id)
        .order_by(Reservation.created_at.desc())
        .all()
    )


@router.get("/shop", response_model=list[ReservationOut])
def shop_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """
    İşletme sahibinin ilanlarına gelen tüm rezervasyonları listeler.
    Sadece `business` rolü görebilir.
    """
    reservations = (
        db.query(Reservation)
        .join(Listing)
        .options(joinedload(Reservation.listing))
        .filter(Listing.shop.has(owner_id=current_user.id))
        .order_by(Reservation.created_at.desc())
        .all()
    )
    return reservations


@router.patch("/{reservation_id}/status", response_model=ReservationOut)
def update_reservation_status(
    reservation_id: int,
    payload: ReservationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Rezervasyon durumunu güncelle.
    - Kullanıcı kendi rezervasyonunu `cancelled` yapabilir.
    - İşletme sahibi `confirmed` veya `picked_up` yapabilir.
    """
    reservation = (
        db.query(Reservation)
        .options(joinedload(Reservation.listing).joinedload(Listing.shop))
        .filter(Reservation.id == reservation_id)
        .first()
    )
    if not reservation:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")

    is_owner = reservation.listing.shop.owner_id == current_user.id
    is_customer = reservation.user_id == current_user.id

    # Kullanıcı sadece iptal edebilir
    if is_customer and payload.status == ReservationStatus.cancelled:
        # İptal edilirse stok geri ver
        if reservation.status == ReservationStatus.pending:
            reservation.listing.quantity += reservation.quantity
            if reservation.listing.status == ListingStatus.sold_out:
                reservation.listing.status = ListingStatus.active

    # İşletme sahibi confirmed veya picked_up yapabilir
    elif is_owner and payload.status in (
        ReservationStatus.confirmed,
        ReservationStatus.picked_up,
    ):
        pass

    else:
        raise HTTPException(
            status_code=403,
            detail="Bu işlemi yapmaya yetkiniz yok.",
        )

    reservation.status = payload.status
    db.commit()
    db.refresh(reservation)
    return reservation