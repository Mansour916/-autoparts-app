from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.part import Part
from app.models.order import Order, OrderItem
from app.models.user import User
from app.routes.garage import get_current_user

router = APIRouter(prefix="/seller", tags=["seller"])

@router.get("/stats")
async def get_seller_stats(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    result_user = await db.execute(select(User).where(User.id == user_id))
    user = result_user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    if not user.is_admin and user.role != "seller":
        raise HTTPException(status_code=403, detail="Acces reserve aux vendeurs")

    parts_query = select(Part).where(Part.is_active == True)
    if not user.is_admin:
        parts_query = parts_query.where(Part.seller_id == user.id)
    result_parts = await db.execute(parts_query)
    my_parts = result_parts.scalars().all()
    my_part_ids = [p.id for p in my_parts]

    total_revenue = 0.0
    total_units_sold = 0
    sales_count = {}

    if my_part_ids:
        result_items = await db.execute(
            select(OrderItem).where(OrderItem.part_id.in_(my_part_ids))
        )
        items = result_items.scalars().all()

        for item in items:
            total_revenue += item.unit_price * item.quantity
            total_units_sold += item.quantity
            sales_count[str(item.part_id)] = sales_count.get(str(item.part_id), 0) + item.quantity

    top_parts = sorted(sales_count.items(), key=lambda x: x[1], reverse=True)[:5]
    top_parts_details = []
    for part_id, qty in top_parts:
        part = next((p for p in my_parts if str(p.id) == part_id), None)
        if part:
            top_parts_details.append({
                "id": str(part.id),
                "name": part.name,
                "units_sold": qty,
                "revenue": qty * part.price
            })

    low_stock = [
        {"id": str(p.id), "name": p.name, "stock": p.stock}
        for p in my_parts if p.stock <= 5
    ]

    return {
        "total_parts": len(my_parts),
        "total_revenue": round(total_revenue, 2),
        "total_units_sold": total_units_sold,
        "top_parts": top_parts_details,
        "low_stock_parts": low_stock
    }
