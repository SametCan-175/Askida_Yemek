from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import auth, shops, listings, ai_listings, reservations, analytics
from routers import ai_integration, users
from scheduler import start_scheduler
from routers import ai_integration, users, reservations, analytics,notifications

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Askıda Yemek API",
    description="AI destekli Gıda İsrafı Önleme Uygulaması",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,          prefix="/auth",tags=["Authentication"])
app.include_router(shops.router,         prefix="/shops",tags=["Shops"])
app.include_router(reservations.router,  prefix="/reservations",tags=["Reservations"])
app.include_router(users.router,         prefix="/users",tags=["Users"])
app.include_router(ai_listings.router,   prefix="/listings",tags=["AI"])
app.include_router(listings.router,      prefix="/listings",tags=["Listings"])
app.include_router(ai_integration.router, prefix="",tags=["AI Integration"])
app.include_router(analytics.router,     prefix="/analytics",tags=["Analytics"])
app.include_router(reservations.router,   prefix="/reservations", tags=["Reservations"])
app.include_router(users.router,          prefix="/users",        tags=["Users"])
app.include_router(ai_integration.router, prefix="",              tags=["AI Integration"])
app.include_router(analytics.router,      prefix="/analytics",    tags=["Analytics"]) 
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

@app.on_event("startup")
def startup():
    start_scheduler()
@app.get("/", tags=["Health"])
def root():
    return {"message": "Askıda Yemek API çalışıyor 🍽️", "version": "3.0.0"}