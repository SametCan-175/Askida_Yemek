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