from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid

from app.database import get_db
from app.models.store import Store

router = APIRouter(prefix="/stores", tags=["stores"])

class StoreCreate(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    hours: Optional[str] = None
    latitude: float
    longitude: float
    services: Optional[str] = None

@router.get("/")
async def list_stores(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Store).where(Store.is_active == True))
    stores = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "address": s.address,
            "phone": s.phone,
            "hours": s.hours,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "services": s.services.split(",") if s.services else []
        }
        for s in stores
    ]

@router.post("/", status_code=201)
async def create_store(data: StoreCreate, db: AsyncSession = Depends(get_db)):
    try:
        store = Store(
            id=uuid.uuid4(),
            name=data.name,
            address=data.address,
            phone=data.phone,
            hours=data.hours,
            latitude=data.latitude,
            longitude=data.longitude,
            services=data.services
        )
        db.add(store)
        await db.commit()
        await db.refresh(store)
        return {"message": "Magasin cree", "id": str(store.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{store_id}")
async def delete_store(store_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Store).where(Store.id == store_id))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="Magasin non trouve")
    store.is_active = False
    await db.commit()
    return {"message": "Magasin supprime"}