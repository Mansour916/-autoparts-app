from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base

class PartCategory(str, enum.Enum):
    battery = "battery"
    motor = "motor"
    brakes = "brakes"
    cooling = "cooling"
    suspension = "suspension"
    electronics = "electronics"
    filters = "filters"
    tires = "tires"
    other = "other"

class Part(Base):
    __tablename__ = "parts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(PartCategory), nullable=False)
    oem_reference = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    weight_kg = Column(Float, nullable=True)
    warranty_months = Column(Integer, default=24)
    certification = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    compatibilities = relationship("CompatibilityMatrix", back_populates="part")
    images = relationship("PartImage", back_populates="part", cascade="all, delete-orphan", order_by="PartImage.position")