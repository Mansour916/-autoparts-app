from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.services.vehicle_service import VehicleService
from app.models.vehicle import FuelType

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

# Schémas
class VehicleCreate(BaseModel):
    vin: Optional[str] = None
    plate: Optional[str] = None
    brand: str
    model: str
    year: int
    fuel_type: FuelType
    engine: Optional[str] = None

class VehicleResponse(BaseModel):
    id: str
    vin: Optional[str]
    plate: Optional[str]
    brand: str
    model: str
    year: int
    fuel_type: str
    engine: Optional[str]

    class Config:
        from_attributes = True

# Endpoints
@router.get("/lookup")
async def lookup_vehicle(
    vin: Optional[str] = Query(None),
    plate: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if not vin and not plate:
        raise HTTPException(status_code=400, detail="Fournissez un VIN ou une plaque")

    vehicle = None
    if vin:
        vehicle = await VehicleService.get_by_vin(db, vin)
    elif plate:
        vehicle = await VehicleService.get_by_plate(db, plate)

    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")

    return vehicle

@router.post("/", status_code=201)
async def create_vehicle(
    data: VehicleCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        vehicle = await VehicleService.create(db, data.model_dump())
        return {"message": "Véhicule ajouté", "id": str(vehicle.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_vehicles(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.vehicle import Vehicle
    result = await db.execute(select(Vehicle))
    vehicles = result.scalars().all()
    return vehicles