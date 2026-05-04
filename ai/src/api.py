from __future__ import annotations

import os
import sys
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(CURRENT_DIR, "src")
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from ml.ranker import feed_ranker
from ml.recommender import get_personalized_recommendations
from ml.text_processor import urunleri_isle


class Location(BaseModel):
    latitude: float
    longitude: float


class UserContext(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    ad: Optional[str] = None
    location: Optional[Location] = None
    preferred_radius_km: float = 2.0
    tercihler: List[str] = Field(default_factory=list)


class ScoreRequest(BaseModel):
    user_context: UserContext
    listings: List[Dict[str, Any]]


class SupportRequest(BaseModel):
    user_id: int
    mesaj: str
    konusma_gecmisi: List[Dict[str, Any]] = Field(default_factory=list)


app = FastAPI(title="Askida Yemek AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _badge_for(item: Dict[str, Any]) -> str:
    score = float(item.get("ai_score") or item.get("skor") or 0)
    discount = float(item.get("indirim_orani") or 0)
    stock = int(item.get("adet") or item.get("quantity") or 99)
    if stock <= 2:
        return "Son Porsiyon"
    if score >= 8:
        return "Sana Ozel"
    if discount >= 50:
        return "Yuksek Indirim"
    return "Akilli Firsat"


def _description_for(item: Dict[str, Any]) -> str:
    shop = item.get("kafe") or item.get("shop_name") or "Bu isletme"
    product = item.get("urun") or item.get("title") or "bu urun"
    discount = item.get("indirim_orani")
    distance = item.get("mesafe_km")
    parts = [f"{shop} icin {product} iyi bir secim gibi gorunuyor"]
    if discount is not None:
        parts.append(f"%{discount} indirimli")
    if distance is not None:
        parts.append(f"yaklasik {distance} km uzakta")
    return ", ".join(parts) + "."


def _normalize_history(history: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    normalized: List[Dict[str, str]] = []
    for item in history:
        role = item.get("rol") or item.get("role")
        content = item.get("mesaj") or item.get("content") or item.get("text") or ""
        if role in {"user", "kullanici"}:
            normalized.append({"rol": "kullanici", "mesaj": content})
        elif role in {"agent", "assistant", "asistan"}:
            normalized.append({"rol": "asistan", "mesaj": content})
    return normalized[-20:]


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai"}


@app.post("/score")
def score_listings(payload: ScoreRequest):
    processed = urunleri_isle(payload.listings)
    ranked = feed_ranker(processed)
    user = payload.user_context.model_dump()
    personalized = get_personalized_recommendations(user, ranked) or ranked

    scored_listings = []
    for item in personalized:
        scored = dict(item)
        scored["skor"] = scored.get("ai_score", 0)
        scored["badge_text"] = scored.get("badge_text") or _badge_for(scored)
        scored["ai_description"] = scored.get("ai_description") or _description_for(scored)
        scored_listings.append(scored)

    return {
        "status": "success",
        "scored_listings": scored_listings,
        "scores": [
            {
                "listing_id": item.get("listing_id") or item.get("id"),
                "ai_score": item.get("ai_score", 0),
                "badge_text": item.get("badge_text"),
                "ai_description": item.get("ai_description"),
            }
            for item in scored_listings
            if item.get("listing_id") or item.get("id")
        ],
    }


@app.post("/support")
def support_chat(payload: SupportRequest):
    history = _normalize_history(payload.konusma_gecmisi)
    try:
        from ml.support import destek_ajani_yanit

        return destek_ajani_yanit(
            user_id=payload.user_id,
            yeni_mesaj=payload.mesaj,
            konusma_gecmisi=history,
        )
    except Exception as exc:
        print(f"support.py cagrilamadi, yerel cevap kullaniliyor: {exc}")

    answer = (
        "Mesajini aldim. Siparis, rezervasyon veya uygulama kullanimi icin "
        "yardimci olabilirim; daha net bakmam icin kisaca ne yapmak istedigini yaz."
    )
    updated = history + [
        {"rol": "kullanici", "mesaj": payload.mesaj},
        {"rol": "asistan", "mesaj": answer},
    ]
    return {"yanit": answer, "guncellenmis_gecmis": updated[-20:]}