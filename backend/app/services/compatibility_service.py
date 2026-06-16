from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.compatibility import CompatibilityMatrix
from app.models.part import Part

class CompatibilityService:

    @staticmethod
    async def get_compatible_parts(db: AsyncSession, vehicle_id: str):
        result = await db.execute(
            select(Part)
            .join(CompatibilityMatrix, CompatibilityMatrix.part_id == Part.id)
            .where(
                CompatibilityMatrix.vehicle_id == vehicle_id,
                CompatibilityMatrix.is_compatible == True,
                Part.is_active == True
            )
        )
        return result.scalars().all()

    @staticmethod
    async def add_compatibility(db: AsyncSession, part_id: str, vehicle_id: str, notes: str = ""):
        import uuid
        compat = CompatibilityMatrix(
            id=uuid.uuid4(),
            part_id=part_id,
            vehicle_id=vehicle_id,
            notes=notes
        )
        db.add(compat)
        await db.commit()
        return compat

    @staticmethod
    async def check_compatibility(db: AsyncSession, part_id: str, vehicle_id: str):
        result = await db.execute(
            select(CompatibilityMatrix).where(
                CompatibilityMatrix.part_id == part_id,
                CompatibilityMatrix.vehicle_id == vehicle_id,
                CompatibilityMatrix.is_compatible == True
            )
        )
        return result.scalar_one_or_none() is not None