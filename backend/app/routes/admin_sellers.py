from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.routes.garage import get_current_user

router = APIRouter(prefix="/admin/sellers", tags=["admin"])

async def require_admin(db: AsyncSession, user_id: str) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Acces reserve aux administrateurs")
    return user

@router.get("/")
async def list_sellers(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    await require_admin(db, user_id)
    result = await db.execute(select(User).where(User.role == "seller"))
    sellers = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "email": s.email,
            "full_name": s.full_name,
            "phone": s.phone,
            "seller_status": s.seller_status,
            "store_id": str(s.store_id) if s.store_id else None,
            "created_at": s.created_at
        }
        for s in sellers
    ]

@router.patch("/{seller_id}/approve")
async def approve_seller(
    seller_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    await require_admin(db, user_id)
    result = await db.execute(select(User).where(User.id == seller_id))
    seller = result.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=404, detail="Vendeur non trouve")
    seller.seller_status = "approved"
    await db.commit()
    return {"message": "Vendeur approuve"}

@router.patch("/{seller_id}/reject")
async def reject_seller(
    seller_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    await require_admin(db, user_id)
    result = await db.execute(select(User).where(User.id == seller_id))
    seller = result.scalar_one_or_none()
    if not seller:
        raise HTTPException(status_code=404, detail="Vendeur non trouve")
    seller.seller_status = "rejected"
    await db.commit()
    return {"message": "Vendeur refuse"}