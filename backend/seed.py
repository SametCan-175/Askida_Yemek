"""
Geliştirme ortamı için örnek veri oluşturur. (Hafta 4'e Uyumlu)
Çalıştırmak için: python seed.py
"""
from datetime import datetime, timedelta, timezone
from database import SessionLocal, Base, engine
#ListingAiScore ve UserBadge eklendi
from models import User, Shop, Listing, UserRole, ListingStatus, ListingAiScore, UserBadge
from security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed():
    # Veritabanı doluysa atla
    if db.query(User).first():
        print("Veritabanında zaten veri var. Seed atlandı.")
        return

    # Kullanıcılar 
    customer = User(
        email="musteri@example.com",
        full_name="Ali Müşteri",
        hashed_password=hash_password("123456"),
        role=UserRole.customer,
    )
    business_user = User(
        email="isletme@example.com",
        full_name="Ayşe İşletmeci",
        hashed_password=hash_password("123456"),
        role=UserRole.business,
    )
    db.add_all([customer, business_user])
    db.commit()
    db.refresh(customer)  # Rozet için ID lazım
    db.refresh(business_user)

    # İşletme
    shop = Shop(
        owner_id=business_user.id,
        name="Ayşe'nin Fırını",
        description="Her gün taze ekmek ve pogaça",
        address="Bağdat Caddesi No:42",
        city="İstanbul",
        phone="0216 000 00 00",
        category="fırın",
        latitude=40.9612,
        longitude=29.0700,
    )
    db.add(shop)
    db.commit()
    db.refresh(shop)

    # Fırsatlar 
    now = datetime.now(timezone.utc)
    listing_1 = Listing(
        shop_id=shop.id,
        title="Günün Sonu Ekmek Sepeti",
        description="Çeşitli ekmek ve simit karışımı, yarı fiyatına!",
        original_price=60.0,
        discounted_price=25.0,
        quantity=5,
        pickup_start=now + timedelta(hours=1),
        pickup_end=now + timedelta(hours=4),
        status=ListingStatus.active,
    )
    listing_2 = Listing(
        shop_id=shop.id,
        title="Karma Poğaça Kutusu",
        description="Patatesli, peynirli ve zeytinli poğaça",
        original_price=120.0,
        discounted_price=50.0,
        quantity=3,
        pickup_start=now + timedelta(hours=2),
        pickup_end=now + timedelta(hours=5),
        status=ListingStatus.active,
    )
    db.add_all([listing_1, listing_2])
    db.commit()
    db.refresh(listing_1) 

    #AI Skorları
    ai_score = ListingAiScore(
        listing_id=listing_1.id,
        ai_score=0.92,
        badge_text="Günün Yıldızı",
        ai_description="Geçmiş sepet içeriklerine göre tam sana göre!"
    )
    db.add(ai_score)

    # Rozetler 
    badge = UserBadge(
        user_id=customer.id,
        name="İlk Adım",
        emoji="🌱",
        description="Gıda israfını önlemeye başladın!"
    )
    db.add(badge)

    db.commit()

    print(" Seed tamamlandı!")
    print("   Müşteri   → musteri@example.com  / 123456")
    print("   İşletmeci → isletme@example.com  / 123456")

seed()
db.close()