from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uuid

from app.database import get_db
from app.models.garage import GarageVehicle
from app.models.vehicle import Vehicle
from app.config import settings

router = APIRouter(prefix="/garage", tags=["garage"])
security = HTTPBearer()

# Récupérer l'utilisateur depuis le token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalide")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

# Schémas
class GarageVehicleCreate(BaseModel):
    vehicle_id: str
    nickname: Optional[str] = None
    mileage: Optional[int] = 0

class GarageVehicleUpdate(BaseModel):
    mileage: Optional[int] = None
    nickname: Optional[str] = None

# Endpoints
@router.post("/", status_code=201)
async def add_to_garage(
    data: GarageVehicleCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    try:
        # Vérifier que le véhicule existe
        result = await db.execute(select(Vehicle).where(Vehicle.id == data.vehicle_id))
        vehicle = result.scalar_one_or_none()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Véhicule non trouvé")

        garage_vehicle = GarageVehicle(
            id=uuid.uuid4(),
            user_id=user_id,
            vehicle_id=data.vehicle_id,
            nickname=data.nickname,
            mileage=data.mileage
        )
        db.add(garage_vehicle)
        await db.commit()
        await db.refresh(garage_vehicle)
        return {"message": "Véhicule ajouté au garage", "id": str(garage_vehicle.id)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_garage(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    result = await db.execute(
        select(GarageVehicle, Vehicle)
        .join(Vehicle, Vehicle.id == GarageVehicle.vehicle_id)
        .where(GarageVehicle.user_id == user_id)
    )
    rows = result.all()
    return [
        {
            "garage_id": str(row.GarageVehicle.id),
            "vehicle_id": str(row.Vehicle.id),
            "nickname": row.GarageVehicle.nickname,
            "mileage": row.GarageVehicle.mileage,
            "brand": row.Vehicle.brand,
            "model": row.Vehicle.model,
            "year": row.Vehicle.year,
            "fuel_type": row.Vehicle.fuel_type,
            "plate": row.Vehicle.plate,
            "vin": row.Vehicle.vin
        }
        for row in rows
    ]

@router.delete("/{garage_id}")
async def remove_from_garage(
    garage_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    result = await db.execute(
        select(GarageVehicle).where(
            GarageVehicle.id == garage_id,
            GarageVehicle.user_id == user_id
        )
    )
    garage_vehicle = result.scalar_one_or_none()
    if not garage_vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé dans le garage")

    await db.delete(garage_vehicle)
    await db.commit()
    return {"message": "Véhicule supprimé du garage"}

@router.patch("/{garage_id}")
async def update_mileage(
    garage_id: str,
    data: GarageVehicleUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    result = await db.execute(
        select(GarageVehicle).where(
            GarageVehicle.id == garage_id,
            GarageVehicle.user_id == user_id
        )
    )
    garage_vehicle = result.scalar_one_or_none()
    if not garage_vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")

    if data.mileage is not None:
        garage_vehicle.mileage = data.mileage
    if data.nickname is not None:
        garage_vehicle.nickname = data.nickname

    await db.commit()
    return {"message": "Garage mis à jour"}