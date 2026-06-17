from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base


class UserRole(str, enum.Enum):
    customer = "customer"   # Yemek alan kullanıcı
    business = "business"   # İşletme sahibi
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    is_active = Column(Boolean, default=True)
    phone = Column(String(20), nullable=True)
    birth_date = Column(String(10), nullable=True)  # "01.01.2004" formatı
    gender = Column(String(20), nullable=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    address = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler
    shop = relationship("Shop", back_populates="owner", uselist=False)


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    category = Column(String, nullable=True)   # restoran, fırın, market, vs.
    logo_url = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="shop")
    listings = relationship("Listing", back_populates="shop")


class ReservationStatus(str, enum.Enum):
    pending = "pending"       # Rezervasyon yapıldı
    confirmed = "confirmed"   # İşletme onayladı
    picked_up = "picked_up"   # Kullanıcı teslim aldı
    cancelled = "cancelled"   # İptal edildi


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.pending)
    note = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="reservations")
    listing = relationship("Listing", backref="reservations")


class ListingStatus(str, enum.Enum):
    active = "active"
    sold_out = "sold_out"
    expired = "expired"


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    original_price = Column(Float, nullable=False)
    discounted_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    pickup_start = Column(DateTime(timezone=True), nullable=False)
    pickup_end = Column(DateTime(timezone=True), nullable=False)
    image_url = Column(String, nullable=True)
    status = Column(Enum(ListingStatus), default=ListingStatus.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shop = relationship("Shop", back_populates="listings")


class ListingAiScore(Base):
    #AI tarafından hesaplanan ilan skorlarını ve özel etiketleri tutar.
    __tablename__ = "listing_ai_scores"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), unique=True, nullable=False)
    ai_score = Column(Float, nullable=False)
    badge_text = Column(String, nullable=True)
    ai_description = Column(Text, nullable=True)

    listing = relationship("Listing", backref="ai_score")


class UserBadge(Base):
    #Kullanıcıların kazandığı başarı rozetlerini tutar.
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    emoji = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="badges")


class Notification(Base):
    """AI tarafından tetiklenen kullanıcı bildirimleri."""
    __tablename__ = "notifications"
 
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)
    ai_score = Column(String, nullable=True)
    badge_text = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="notifications")


class ShopHours(Base):
    """
    Mağazanın her gün için çalışma/teslimat saatleri.
    day_of_week: 0=Pazartesi, 1=Salı, ..., 6=Pazar
    """
    __tablename__ = "shop_hours"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    is_open = Column(Boolean, default=True, nullable=False)
    open_time = Column(String(5), nullable=True)
    close_time = Column(String(5), nullable=True)
    pickup_start = Column(String(5), nullable=True)
    pickup_end = Column(String(5), nullable=True)

    shop = relationship("Shop", backref="hours")

class ShopBank(Base):
    __tablename__ = "shop_bank"
    
    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), unique=True, nullable=False)
    iban = Column(String(34), nullable=False)
    account_holder = Column(String(150), nullable=False)
    bank_name = Column(String(100), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    shop = relationship("Shop", backref="bank_info", uselist=False)

class WithdrawRequest(Base):
    """
    İşletmenin bakiyesinden yapılan para çekme talepleri.
    """
    __tablename__ = "withdraw_requests"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    iban = Column(String(34), nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, approved, paid, rejected
    note = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    shop = relationship("Shop", backref="withdraws")
