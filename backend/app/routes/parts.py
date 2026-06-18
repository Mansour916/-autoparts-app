from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid

from app.database import get_db
from app.models.part import Part, PartCategory
from app.models.part_image import PartImage
from app.services.compatibility_service import CompatibilityService

router = APIRouter(prefix="/parts", tags=["parts"])

class PartCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: PartCategory
    oem_reference: Optional[str] = None
    brand: str
    price: float
    stock: int = 0
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    weight_kg: Optional[float] = None
    warranty_months: Optional[int] = 24
    certification: Optional[str] = None

class PartUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[PartCategory] = None
    oem_reference: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    video_url: Optional[str] = None
    weight_kg: Optional[float] = None
    warranty_months: Optional[int] = None
    certification: Optional[str] = None

class CompatibilityAdd(BaseModel):
    part_id: str
    vehicle_id: str
    notes: Optional[str] = ""

@router.get("/")
async def list_parts(
    vehicle_id: Optional[str] = Query(None),
    category: Optional[PartCategory] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    if vehicle_id:
        parts = await CompatibilityService.get_compatible_parts(db, vehicle_id)
        return parts

    query = select(Part).where(Part.is_active == True)
    if category:
        query = query.where(Part.category == category)

    result = await db.execute(query)
    return result.scalars().all()

@router.get("/compare/{oem_reference}")
async def compare_by_oem(
    oem_reference: str,
    vehicle_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Part).where(
        Part.oem_reference == oem_reference,
        Part.is_active == True
    )
    result = await db.execute(query)
    parts = result.scalars().all()

    if not parts:
        raise HTTPException(status_code=404, detail="Aucune piece trouvee pour cette reference")

    response = []
    for part in parts:
        item = {
            "id": str(part.id),
            "name": part.name,
            "brand": part.brand,
            "price": part.price,
            "stock": part.stock,
            "warranty_months": part.warranty_months,
            "certification": part.certification,
            "description": part.description,
            "oem_reference": part.oem_reference,
            "category": part.category
        }
        if vehicle_id:
            item["is_compatible"] = await CompatibilityService.check_compatibility(db, str(part.id), vehicle_id)
        response.append(item)

    response.sort(key=lambda x: x["price"])
    return response

@router.get("/{part_id}/images")
async def get_part_images(part_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PartImage).where(PartImage.part_id == part_id).order_by(PartImage.position)
    )
    images = result.scalars().all()
    return [
        {"id": str(img.id), "image_url": img.image_url, "is_primary": img.is_primary}
        for img in images
    ]

@router.get("/{part_id}")
async def get_part(part_id: str, vehicle_id: Optional[str] = Query(None), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Part).where(Part.id == part_id))
    part = result.scalar_one_or_none()

    if not part:
        raise HTTPException(status_code=404, detail="Piece non trouvee")

    response = {
        "id": str(part.id),
        "name": part.name,
        "description": part.description,
        "category": part.category,
        "oem_reference": part.oem_reference,
        "brand": part.brand,
        "price": part.price,
        "stock": part.stock,
        "image_url": part.image_url,
        "video_url": part.video_url,
        "warranty_months": part.warranty_months,
        "certification": part.certification,
    }

    if vehicle_id:
        is_compatible = await CompatibilityService.check_compatibility(db, part_id, vehicle_id)
        response["is_compatible"] = is_compatible

    return response

@router.post("/", status_code=201)
async def create_part(data: PartCreate, db: AsyncSession = Depends(get_db)):
    try:
        part = Part(
            id=uuid.uuid4(),
            **data.model_dump()
        )
        db.add(part)
        await db.commit()
        await db.refresh(part)
        return {"message": "Piece ajoutee", "id": str(part.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{part_id}")
async def update_part(part_id: str, data: PartUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Part).where(Part.id == part_id))
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="Piece non trouvee")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(part, key, value)

    await db.commit()
    await db.refresh(part)
    return {"message": "Piece mise a jour", "id": str(part.id)}

@router.delete("/{part_id}")
async def delete_part(part_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Part).where(Part.id == part_id))
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="Piece non trouvee")
    part.is_active = False
    await db.commit()
    return {"message": "Piece supprimee"}

@router.post("/compatibility", status_code=201)
async def add_compatibility(data: CompatibilityAdd, db: AsyncSession = Depends(get_db)):
    try:
        compat = await CompatibilityService.add_compatibility(
            db, data.part_id, data.vehicle_id, data.notes
        )
        return {"message": "Compatibilite ajoutee", "id": str(compat.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))