from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.services.maintenance_service import MaintenanceService, MAINTENANCE_INTERVALS
from app.routes.garage import get_current_user
from app.models.garage import GarageVehicle

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

# Schémas
class MaintenanceCreate(BaseModel):
    garage_vehicle_id: str
    description: str
    mileage: int
    part_id: Optional[str] = None

# Endpoints
@router.get("/intervals")
async def get_intervals():
    """Liste des types d'entretien connus avec leur intervalle prédictif"""
    return MAINTENANCE_INTERVALS

@router.post("/", status_code=201)
async def add_maintenance(
    data: MaintenanceCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    # Vérifier que le véhicule appartient à l'utilisateur
    result = await db.execute(
        select(GarageVehicle).where(
            GarageVehicle.id == data.garage_vehicle_id,
            GarageVehicle.user_id == user_id
        )
    )
    garage_vehicle = result.scalar_one_or_none()
    if not garage_vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé dans votre garage")

    log = await MaintenanceService.add_log(
        db, data.garage_vehicle_id, data.description, data.mileage, data.part_id
    )
    return {
        "message": "Entretien enregistré",
        "id": str(log.id),
        "next_service_mileage": log.next_service_mileage
    }

@router.get("/{garage_vehicle_id}")
async def get_maintenance_history(
    garage_vehicle_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    # Vérifier propriété
    result = await db.execute(
        select(GarageVehicle).where(
            GarageVehicle.id == garage_vehicle_id,
            GarageVehicle.user_id == user_id
        )
    )
    garage_vehicle = result.scalar_one_or_none()
    if not garage_vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")

    logs = await MaintenanceService.get_logs(db, garage_vehicle_id)
    alerts = await MaintenanceService.get_alerts(db, garage_vehicle_id)

    return {
        "current_mileage": garage_vehicle.mileage,
        "alerts": alerts,
        "history": [
            {
                "id": str(log.id),
                "description": log.description,
                "mileage_at_service": log.mileage_at_service,
                "next_service_mileage": log.next_service_mileage,
                "created_at": log.created_at
            }
            for log in logs
        ]
    }