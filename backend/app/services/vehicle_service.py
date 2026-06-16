from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.vehicle import Vehicle

class VehicleService:

    @staticmethod
    async def get_by_vin(db: AsyncSession, vin: str):
        result = await db.execute(
            select(Vehicle).where(Vehicle.vin == vin.upper())
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_plate(db: AsyncSession, plate: str):
        result = await db.execute(
            select(Vehicle).where(Vehicle.plate == plate.upper())
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, data: dict):
        import uuid
        vehicle = Vehicle(
            id=uuid.uuid4(),
            vin=data.get("vin", "").upper() or None,
            plate=data.get("plate", "").upper() or None,
            brand=data["brand"],
            model=data["model"],
            year=data["year"],
            fuel_type=data["fuel_type"],
            engine=data.get("engine", ""),
        )
        db.add(vehicle)
        await db.commit()
        await db.refresh(vehicle)
        return vehicle