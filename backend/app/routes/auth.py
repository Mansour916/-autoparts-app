from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from jose import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
import uuid

from app.database import get_db
from app.models.user import User
from app.models.store import Store
from app.config import settings
from app.routes.garage import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""
    phone: str = ""
    role: str = "user"
    store_name: Optional[str] = None
    store_address: Optional[str] = None
    store_latitude: Optional[float] = None
    store_longitude: Optional[float] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

def hash_password(password: str) -> str:
    password_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain[:72].encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        settings.secret_key,
        algorithm="HS256"
    )

@router.post("/register", status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(User).where(User.email == data.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email deja utilise")

        role = data.role if data.role in ["user", "seller"] else "user"
        store_id = None
        seller_status = "approved"

        if role == "seller":
            if not data.store_name or not data.store_address:
                raise HTTPException(status_code=400, detail="Nom et adresse du magasin requis pour un vendeur")

            store = Store(
                id=uuid.uuid4(),
                name=data.store_name,
                address=data.store_address,
                latitude=data.store_latitude or 0.0,
                longitude=data.store_longitude or 0.0,
                phone=data.phone
            )
            db.add(store)
            await db.flush()
            store_id = store.id
            seller_status = "pending"

        user = User(
            id=uuid.uuid4(),
            email=data.email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
            phone=data.phone,
            role=role,
            store_id=store_id,
            seller_status=seller_status
        )
        db.add(user)
        await db.commit()
        return {
            "message": "Compte cree avec succes",
            "email": user.email,
            "role": role,
            "seller_status": seller_status
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"ERREUR REGISTER: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

        token = create_token(str(user.id))
        return {"access_token": token}

    except HTTPException:
        raise
    except Exception as e:
        print(f"ERREUR LOGIN: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "role": user.role or "user",
        "store_id": str(user.store_id) if user.store_id else None,
        "seller_status": user.seller_status or "approved",
        "is_admin": user.is_admin,
        "loyalty_points": user.loyalty_points or 0
    }