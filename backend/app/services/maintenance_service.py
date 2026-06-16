from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.garage import GarageVehicle, MaintenanceLog
import uuid

# Intervalles de maintenance prédictive (en km)
MAINTENANCE_INTERVALS = {
    "Filtre d'habitacle": 15000,
    "Pneus (vérification)": 10000,
    "Liquide de refroidissement batterie": 60000,
    "Plaquettes de frein": 30000,
    "Révision générale": 20000,
}

class MaintenanceService:

    @staticmethod
    async def add_log(db: AsyncSession, garage_vehicle_id: str, description: str, mileage: int, part_id: str = None):
        # Calculer le prochain entretien si la description correspond à un intervalle connu
        next_mileage = None
        for key, interval in MAINTENANCE_INTERVALS.items():
            if key.lower() in description.lower():
                next_mileage = mileage + interval
                break

        log = MaintenanceLog(
            id=uuid.uuid4(),
            garage_vehicle_id=garage_vehicle_id,
            part_id=part_id,
            description=description,
            mileage_at_service=mileage,
            next_service_mileage=next_mileage
        )
        db.add(log)

        # Mettre à jour le kilométrage du véhicule si plus récent
        result = await db.execute(select(GarageVehicle).where(GarageVehicle.id == garage_vehicle_id))
        garage_vehicle = result.scalar_one_or_none()
        if garage_vehicle and mileage > garage_vehicle.mileage:
            garage_vehicle.mileage = mileage

        await db.commit()
        await db.refresh(log)
        return log

    @staticmethod
    async def get_logs(db: AsyncSession, garage_vehicle_id: str):
        result = await db.execute(
            select(MaintenanceLog)
            .where(MaintenanceLog.garage_vehicle_id == garage_vehicle_id)
            .order_by(MaintenanceLog.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_alerts(db: AsyncSession, garage_vehicle_id: str):
        # Récupérer le véhicule pour son kilométrage actuel
        result = await db.execute(select(GarageVehicle).where(GarageVehicle.id == garage_vehicle_id))
        garage_vehicle = result.scalar_one_or_none()
        if not garage_vehicle:
            return []

        current_mileage = garage_vehicle.mileage

        # Récupérer les logs avec next_service_mileage
        result = await db.execute(
            select(MaintenanceLog)
            .where(
                MaintenanceLog.garage_vehicle_id == garage_vehicle_id,
                MaintenanceLog.next_service_mileage.isnot(None)
            )
            .order_by(MaintenanceLog.created_at.desc())
        )
        logs = result.scalars().all()

        # Garder le dernier log par type de description
        seen = set()
        alerts = []
        for log in logs:
            if log.description in seen:
                continue
            seen.add(log.description)

            remaining = log.next_service_mileage - current_mileage
            if remaining <= 2000:  # alerte si moins de 2000 km restants
                alerts.append({
                    "description": log.description,
                    "next_service_mileage": log.next_service_mileage,
                    "current_mileage": current_mileage,
                    "remaining_km": remaining,
                    "urgent": remaining <= 0
                })

        return alerts