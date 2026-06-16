from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.order import Order, OrderItem, OrderStatus
from app.models.part import Part
import uuid

class OrderService:

    @staticmethod
    async def create_order(db: AsyncSession, user_id: str, items: list, delivery_address: str):
        # Calculer le total et vérifier le stock
        total = 0
        order_items = []

        for item in items:
            result = await db.execute(select(Part).where(Part.id == item["part_id"]))
            part = result.scalar_one_or_none()

            if not part:
                raise ValueError(f"Pièce {item['part_id']} non trouvée")
            if part.stock < item["quantity"]:
                raise ValueError(f"Stock insuffisant pour {part.name}")

            total += part.price * item["quantity"]
            order_items.append({
                "part_id": part.id,
                "quantity": item["quantity"],
                "unit_price": part.price
            })
            # Décrémenter le stock
            part.stock -= item["quantity"]

        # Créer la commande
        order = Order(
            id=uuid.uuid4(),
            user_id=user_id,
            status=OrderStatus.confirmed,
            total_price=total,
            delivery_address=delivery_address,
            is_free_return=True
        )
        db.add(order)
        await db.flush()

        # Créer les lignes de commande
        for oi in order_items:
            order_item = OrderItem(
                id=uuid.uuid4(),
                order_id=order.id,
                part_id=oi["part_id"],
                quantity=oi["quantity"],
                unit_price=oi["unit_price"]
            )
            db.add(order_item)

        await db.commit()
        await db.refresh(order)
        return order

    @staticmethod
    async def get_user_orders(db: AsyncSession, user_id: str):
        result = await db.execute(
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.part))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
        )
        return result.scalars().all()