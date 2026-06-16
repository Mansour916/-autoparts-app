from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import os
import shutil

from app.database import get_db
from app.models.part_image import PartImage
from app.models.part import Part

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("/parts/{part_id}/images", status_code=201)
async def upload_part_image(
    part_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # Vérifier que la pièce existe
    result = await db.execute(select(Part).where(Part.id == part_id))
    part = result.scalar_one_or_none()
    if not part:
        raise HTTPException(status_code=404, detail="Pièce non trouvée")

    # Vérifier l'extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Format non supporté (jpg, png, webp uniquement)")

    # Vérifier la taille
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 5 MB)")

    # Générer un nom unique
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join("static", "parts", filename)

    with open(filepath, "wb") as f:
        f.write(content)

    image_url = f"/static/parts/{filename}"

    # Compter les images existantes pour position et is_primary
    result = await db.execute(select(PartImage).where(PartImage.part_id == part_id))
    existing_images = result.scalars().all()
    is_primary = len(existing_images) == 0

    image = PartImage(
        id=uuid.uuid4(),
        part_id=part_id,
        image_url=image_url,
        is_primary=is_primary,
        position=len(existing_images)
    )
    db.add(image)

    # Si c'est la première image, mettre à jour image_url de la pièce aussi
    if is_primary:
        part.image_url = image_url

    await db.commit()
    await db.refresh(image)

    return {
        "message": "Image uploadée",
        "id": str(image.id),
        "image_url": image_url,
        "is_primary": is_primary
    }

@router.delete("/parts/images/{image_id}")
async def delete_part_image(image_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PartImage).where(PartImage.id == image_id))
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image non trouvée")

    # Supprimer le fichier physique
    filepath = "." + image.image_url
    if os.path.exists(filepath):
        os.remove(filepath)

    await db.delete(image)
    await db.commit()
    return {"message": "Image supprimée"}