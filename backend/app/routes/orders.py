from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app.services.order_service import OrderService
from app.routes.garage import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

class OrderItemCreate(BaseModel):
    part_id: str
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    fulfillment_type: str = "delivery"
    delivery_address: Optional[str] = None
    delivery_phone: Optional[str] = None
    delivery_email: Optional[str] = None
    pickup_store_id: Optional[str] = None

@router.post("/", status_code=201)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_current_user)
):
    try:
        if data.fulfillment_type == "pickup" and not data.pickup_store_id:
            raise ValueError("Veuillez selectionner un magasin pour le retrait")
        if data.fulfillment_type == "delivery" and not data.delivery_address:
            raise ValueError("Veuillez indiquer une adresse de livraison")

        items = [item.model_dump() for item in data.items]
        order = await OrderService.create_order(
            db, user_id, items,
            delivery_address=data.delivery_address,
            delivery_phone=data.delivery_phone,
            delivery_email=data.delivery_email,
            fulfillment_type=data.fulfillment_type,
            pickup_store_id=data.pickup_store_id
        )
        return {
            "message": "Commande creee avec succes",
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
            "fulfillment_type": order.fulfillment_type,
            "delivery_address": order.delivery_address,
            "delivery_phone": order.delivery_phone,
            "delivery_email": order.delivery_email,
            "pickup_store_name": order.pickup_store.name if order.pickup_store else None,
            "pickup_store_address": order.pickup_store.address if order.pickup_store else None,
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