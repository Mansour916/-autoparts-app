from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List

from app.database import get_db
from app.services.order_service import OrderService
from app.routes.garage import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

# Schémas
class OrderItemCreate(BaseModel):
    part_id: str
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    delivery_address: str

# Endpoints
@router.post("/", status_code=201)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    try:
        items = [item.model_dump() for item in data.items]
        order = await OrderService.create_order(db, user_id, items, data.delivery_address)
        return {
            "message": "Commande créée avec succès",
            "order_id": str(order.id),
            "total_price": order.total_price,
            "status": order.status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_orders(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    orders = await OrderService.get_user_orders(db, user_id)
    return [
        {
            "id": str(order.id),
            "status": order.status,
            "total_price": order.total_price,
            "delivery_address": order.delivery_address,
            "is_free_return": order.is_free_return,
            "created_at": order.created_at,
            "items": [
                {
                    "part_name": item.part.name,
                    "part_brand": item.part.brand,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price
                }
                for item in order.items
            ]
        }
        for order in orders
    ]