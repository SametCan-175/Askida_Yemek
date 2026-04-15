from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth, shops, listings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Askıda Yemek API",
    description="AI destekli Gıda İsrafı Önleme Uygulaması",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(shops.router, prefix="/shops", tags=["Shops"])
app.include_router(listings.router, prefix="/listings", tags=["Listings"])


@app.get("/", tags=["Health"])
def root():
    return {"message": "Askıda Yemek API çalışıyor 🍽️"}