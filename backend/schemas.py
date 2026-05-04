from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, ListingStatus, ReservationStatus
from typing import Optional, List
from pydantic import BaseModel


# ─────────────────────────────────────────
# RESERVATION SCHEMAS
# ─────────────────────────────────────────

class ReservationCreate(BaseModel):
    listing_id: int
    quantity: int = 1
    note: Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Adet en az 1 olmalıdır.")
        return v


class ReservationOut(BaseModel):
    id: int
    user_id: int
    listing_id: int
    quantity: int
    status: ReservationStatus
    note: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class ReservationStatusUpdate(BaseModel):
    status: ReservationStatus


# ─────────────────────────────────────────
# AUTH SCHEMAS
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
    role: str
    is_active: bool
    created_at: datetime
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    
    model_config = {"from_attributes": True}

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─────────────────────────────────────────
# SHOP SCHEMAS
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
# LISTING SCHEMAS
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
    discount_percent: float
    quantity: int
    pickup_start: datetime
    pickup_end: datetime
    image_url: Optional[str]
    status: ListingStatus
    created_at: datetime
    shop: Optional[ShopOut] = None

    # ── AI ALANLARI (opsiyonel) ──
    ai_score: Optional[float] = None
    badge_text: Optional[str] = None
    ai_description: Optional[str] = None

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
class ShopHoursItem(BaseModel):
    day_of_week: int  # 0-6
    is_open: bool
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    pickup_start: Optional[str] = None
    pickup_end: Optional[str] = None

    model_config = {"from_attributes": True}


class ShopHoursUpdate(BaseModel):
    """7 günlük saatlerin tamamı bir seferde gönderilir."""
    hours: List[ShopHoursItem]


class ShopHoursOut(BaseModel):
    shop_id: int
    hours: List[ShopHoursItem]

class ShopBankUpdate(BaseModel):
    iban: str
    account_holder: str
    bank_name: Optional[str] = None


class ShopBankOut(BaseModel):
    shop_id: int
    iban: str
    account_holder: str
    bank_name: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}
    
class WithdrawCreate(BaseModel):
    amount: float
    iban: Optional[str] = None  # Yoksa shop'un kayıtlı IBAN'ı kullanılır
    note: Optional[str] = None


class WithdrawOut(BaseModel):
    id: int
    shop_id: int
    amount: float
    iban: str
    status: str
    note: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class WalletBalance(BaseModel):
    shop_id: int
    total_earned: float          # Toplam picked_up gelir
    total_withdrawn: float       # Toplam çekilen
    pending_withdraw: float      # İşlemde olan çekme
    available_balance: float     # Çekilebilir bakiye


class WalletTransaction(BaseModel):
    """Tek bir cüzdan hareketi (gelir veya çekme)."""
    id: str                      # "order-123" veya "withdraw-5"
    type: str                    # "income" | "withdraw"
    amount: float                # gelir +, çekme -
    description: str
    status: str
    created_at: datetime