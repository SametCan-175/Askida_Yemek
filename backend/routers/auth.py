from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from database import get_db
from models import User
from schemas import UserRegister, UserLogin, UserOut, Token
from security import hash_password, verify_password, create_access_token, get_current_user

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()


@router.post("/register")
@limiter.limit("3/minute")
def register(request: Request, payload: UserRegister, db: Session = Depends(get_db)):
    """
    Yeni kullanıcı kaydı.
    - **role**: `customer` (varsayılan) veya `business`
    """
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta zaten kayıtlı.",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    """
    E-posta ve şifre ile giriş yapın. JWT access token döner.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.is_active or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı.",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Token ile mevcut kullanıcı bilgisini getir."""
    return current_user