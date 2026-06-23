from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderItem
from app.models.part import Part
from app.models.store import Store
from app.routes.garage import get_current_user

router = APIRouter(prefix="/admin/dashboard", tags=["admin"])

async def require_admin(db: AsyncSession, user_id: str):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Acces reserve aux administrateurs")
    return user

@router.get("/stats")
async def get_global_stats(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    await require_admin(db, user_id)

    result_orders = await db.execute(select(Order))
    orders = result_orders.scalars().all()
    total_revenue = sum(o.total_price for o in orders)
    total_orders = len(orders)

    result_users = await db.execute(select(User).where(User.role == "user"))
    total_buyers = len(result_users.scalars().all())

    result_sellers = await db.execute(select(User).where(User.role == "seller"))
    sellers = result_sellers.scalars().all()
    total_sellers = len(sellers)
    approved_sellers = len([s for s in sellers if s.seller_status == "approved"])
    pending_sellers = len([s for s in sellers if s.seller_status == "pending"])

    result_parts = await db.execute(select(Part).where(Part.is_active == True))
    total_parts = len(result_parts.scalars().all())

    return {
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "total_buyers": total_buyers,
        "total_sellers": total_sellers,
        "approved_sellers": approved_sellers,
        "pending_sellers": pending_sellers,
        "total_parts": total_parts
    }

@router.get("/transactions")
async def get_all_transactions(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    await require_admin(db, user_id)

    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.part),
            selectinload(Order.user),
            selectinload(Order.pickup_store)
        )
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()

    return [
        {
            "id": str(order.id),
            "status": order.status,
            "total_price": order.total_price,
            "fulfillment_type": order.fulfillment_type,
            "delivery_address": order.delivery_address,
            "delivery_phone": order.delivery_phone,
            "delivery_email": order.delivery_email,
            "pickup_store_name": order.pickup_store.name if order.pickup_store else None,
            "created_at": order.created_at,
            "buyer_name": order.user.full_name if order.user else None,
            "buyer_email": order.user.email if order.user else None,
            "items": [
                {
                    "part_name": item.part.name if item.part else "Inconnu",
                    "part_brand": item.part.brand if item.part else "",
                    "quantity": item.quantity,
                    "unit_price": item.unit_price
                }
                for item in order.items
            ]
        }
        for order in orders
    ]

@router.get("/low-stock")
async def get_low_stock(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    await require_admin(db, user_id)

    result = await db.execute(
        select(Part).where(Part.is_active == True, Part.stock <= 5)
    )
    parts = result.scalars().all()

    return [
        {
            "id": str(p.id),
            "name": p.name,
            "brand": p.brand,
            "stock": p.stock,
            "store_id": str(p.store_id) if p.store_id else None
        }
        for p in parts
    ]

@router.patch("/transactions/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    await require_admin(db, user_id)

    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Commande non trouvee")

    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "returned", "refunded"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Statut invalide")

    order.status = status
    await db.commit()
    return {"message": "Statut mis a jour", "status": status}