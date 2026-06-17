from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Shop, User
from schemas import ShopCreate, ShopOut, ShopList
from security import get_current_user, require_business
from models import ShopHours
from schemas import ShopHoursUpdate, ShopHoursOut, ShopHoursItem

router = APIRouter()


@router.get("", response_model=ShopList)
def list_shops(
    city: Optional[str] = Query(None, description="Şehre göre filtrele"),
    category: Optional[str] = Query(None, description="Kategoriye göre filtrele (restoran, fırın, market...)"),
    search: Optional[str] = Query(None, description="İşletme adı ile ara"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Aktif işletmeleri listele. Şehir, kategori ve isim filtreleri desteklenir.
    """
    q = db.query(Shop).filter(Shop.is_active == True)

    if city:
        q = q.filter(Shop.city.ilike(f"%{city}%"))
    if category:
        q = q.filter(Shop.category.ilike(f"%{category}%"))
    if search:
        q = q.filter(Shop.name.ilike(f"%{search}%"))

    total = q.count()
    shops = q.offset(skip).limit(limit).all()
    return ShopList(total=total, shops=shops)


@router.get("/{shop_id}", response_model=ShopOut)
def get_shop(shop_id: int, db: Session = Depends(get_db)):
    """Belirli bir işletmenin detayını getir."""
    shop = db.query(Shop).filter(Shop.id == shop_id, Shop.is_active == True).first()
    if not shop:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")
    return shop


@router.post("", response_model=ShopOut, status_code=status.HTTP_201_CREATED)
def create_shop(
    payload: ShopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """
    İşletme profili oluştur. Sadece **business** rolündeki kullanıcılar kullanabilir.
    Her kullanıcının yalnızca bir işletmesi olabilir.
    """
    existing = db.query(Shop).filter(Shop.owner_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Zaten bir işletmeniz mevcut. Düzenlemek için PUT /shops/{id} kullanın.",
        )

    shop = Shop(owner_id=current_user.id, **payload.model_dump())
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return shop


@router.put("/{shop_id}", response_model=ShopOut)
def update_shop(
    shop_id: int,
    payload: ShopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """İşletme bilgilerini güncelle (sadece sahibi yapabilir)."""
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")
    if shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu işletmeyi düzenleme yetkiniz yok.")

    for field, value in payload.model_dump().items():
        setattr(shop, field, value)

    db.commit()
    db.refresh(shop)
    return shop


@router.delete("/{shop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shop(
    shop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """İşletmeyi pasife al (soft delete)."""
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")
    if shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu işletmeyi silme yetkiniz yok.")

    shop.is_active = False
    db.commit()

@router.get("/{shop_id}/hours", response_model=ShopHoursOut)
def get_shop_hours(shop_id: int, db: Session = Depends(get_db)):
    """Mağazanın çalışma saatlerini getir."""
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Mağaza bulunamadı.")
    
    hours = db.query(ShopHours).filter(ShopHours.shop_id == shop_id).all()
    
    # Eğer hiç saat tanımlı değilse, default 7 gün boş döndür
    if not hours:
        default_hours = [
            ShopHoursItem(
                day_of_week=i,
                is_open=True,
                open_time="09:00",
                close_time="22:00",
                pickup_start="19:00",
                pickup_end="21:30",
            )
            for i in range(7)
        ]
        return ShopHoursOut(shop_id=shop_id, hours=default_hours)
    
    return ShopHoursOut(
        shop_id=shop_id,
        hours=[ShopHoursItem.model_validate(h) for h in hours]
    )
@router.put("/{shop_id}/hours", response_model=ShopHoursOut)
def update_shop_hours(
    shop_id: int,
    payload: ShopHoursUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Mağazanın çalışma saatlerini güncelle. Sadece sahibi."""
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Mağaza bulunamadı.")
    if shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu mağazayı düzenleme yetkiniz yok.")

    # Mevcut saatleri sil, yenilerini ekle
    db.query(ShopHours).filter(ShopHours.shop_id == shop_id).delete()
    
    for h in payload.hours:
        db.add(ShopHours(
            shop_id=shop_id,
            day_of_week=h.day_of_week,
            is_open=h.is_open,
            open_time=h.open_time,
            close_time=h.close_time,
            pickup_start=h.pickup_start,
            pickup_end=h.pickup_end,
        ))
    
    db.commit()
    
    new_hours = db.query(ShopHours).filter(ShopHours.shop_id == shop_id).all()
    return ShopHoursOut(
        shop_id=shop_id,
        hours=[ShopHoursItem.model_validate(h) for h in new_hours]
    )

from models import ShopBank
from schemas import ShopBankUpdate, ShopBankOut


@router.get("/{shop_id}/bank", response_model=Optional[ShopBankOut])
def get_shop_bank(
    shop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Mağazanın banka bilgilerini getir. Sadece sahibi görebilir."""
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Mağaza bulunamadı.")
    if shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu bilgiyi görme yetkiniz yok.")

    bank = db.query(ShopBank).filter(ShopBank.shop_id == shop_id).first()
    if not bank:
        return None
    return ShopBankOut.model_validate(bank)


@router.put("/{shop_id}/bank", response_model=ShopBankOut)
def update_shop_bank(
    shop_id: int,
    payload: ShopBankUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_business),
):
    """Mağaza banka bilgilerini güncelle veya ekle. Sadece sahibi."""
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Mağaza bulunamadı.")
    if shop.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu bilgiyi düzenleme yetkiniz yok.")

    # IBAN format temizle (boşlukları sil)
    iban_clean = payload.iban.replace(" ", "").upper()
    if not iban_clean.startswith("TR") or len(iban_clean) != 26:
        raise HTTPException(status_code=400, detail="Geçersiz IBAN formatı (TR + 24 hane olmalı).")

    bank = db.query(ShopBank).filter(ShopBank.shop_id == shop_id).first()
    if bank:
        bank.iban = iban_clean
        bank.account_holder = payload.account_holder
        bank.bank_name = payload.bank_name
    else:
        bank = ShopBank(
            shop_id=shop_id,
            iban=iban_clean,
            account_holder=payload.account_holder,
            bank_name=payload.bank_name,
        )
        db.add(bank)

    db.commit()
    db.refresh(bank)
    return ShopBankOut.model_validate(bank)