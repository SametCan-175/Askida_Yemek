from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, ListingStatus


# ─────────────────────────────────────────
# giriş
# ─────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.customer

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Şifre en az 6 karakter olmalıdır.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─────────────────────────────────────────
# market
# ─────────────────────────────────────────

class ShopCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    city: str
    phone: Optional[str] = None
    category: Optional[str] = None
    logo_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ShopOut(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str]
    address: str
    city: str
    phone: Optional[str]
    category: Optional[str]
    logo_url: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ShopList(BaseModel):
    total: int
    shops: List[ShopOut]


# ─────────────────────────────────────────
# listeleme şemalar
# ─────────────────────────────────────────

class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    original_price: float
    discounted_price: float
    quantity: int = 1
    pickup_start: datetime
    pickup_end: datetime
    image_url: Optional[str] = None

    @field_validator("discounted_price")
    @classmethod
    def discounted_must_be_lower(cls, v: float, info) -> float:
        original = info.data.get("original_price")
        if original is not None and v >= original:
            raise ValueError("İndirimli fiyat, orijinal fiyattan düşük olmalıdır.")
        return v


class ListingOut(BaseModel):
    id: int
    shop_id: int
    title: str
    description: Optional[str]
    original_price: float
    discounted_price: float
    discount_percent: float   # Hesaplanmış alan
    quantity: int
    pickup_start: datetime
    pickup_end: datetime
    image_url: Optional[str]
    status: ListingStatus
    created_at: datetime
    shop: Optional[ShopOut] = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_discount(cls, listing):
        data = cls.model_validate(listing)
        if listing.original_price > 0:
            data.discount_percent = round(
                (1 - listing.discounted_price / listing.original_price) * 100, 1
            )
        return data


class ListingList(BaseModel):
    total: int
    listings: List[ListingOut]