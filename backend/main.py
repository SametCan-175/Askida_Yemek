from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import Base, engine
from routers import (
    auth, shops, listings, ai_listings, 
    reservations, analytics, ai_integration, 
    users, notifications, wallet
)
from scheduler import start_scheduler

# Veritabanı tabloları
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Askıda Yemek API",
    description="AI destekli Gıda İsrafı Önleme Uygulaması",
    version="3.0.0",
)

# Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Server bilgisini gizle (önce eskisini sil, sonra yenisini ekle)
    if "server" in response.headers:
        del response.headers["server"]
    response.headers["server"] = "API"
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response


# CORS Ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Bağlantıları
app.include_router(auth.router,           prefix="/auth",          tags=["Authentication"])
app.include_router(shops.router,          prefix="/shops",         tags=["Shops"])
app.include_router(users.router,          prefix="/users",         tags=["Users"])
app.include_router(ai_listings.router,    prefix="/listings",      tags=["AI Listings"])
app.include_router(listings.router,       prefix="/listings",      tags=["Listings"])
app.include_router(reservations.router,   prefix="/reservations",  tags=["Reservations"])
app.include_router(analytics.router,      prefix="/analytics",     tags=["Analytics"])
app.include_router(notifications.router,  prefix="/notifications", tags=["Notifications"])
app.include_router(ai_integration.router, prefix="", tags=["AI Integration"])
app.include_router(wallet.router, prefix="/shops", tags=["Wallet"])


@app.on_event("startup")
def startup():
    start_scheduler()


@app.get("/", tags=["Health"])
def root():
    return {"message": "Askıda Yemek API çalışıyor 🍽️", "version": "3.0.0"}