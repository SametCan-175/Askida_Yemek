from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Shop, User
from schemas import ShopCreate, ShopOut, ShopList
from security import get_current_user, require_business

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