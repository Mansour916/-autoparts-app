from sqlalchemy import Column, String, Integer, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base

class FuelType(str, enum.Enum):
    electric = "electric"
    hybrid = "hybrid"
    thermal = "thermal"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vin = Column(String(17), unique=True, nullable=True)
    plate = Column(String(20), nullable=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    fuel_type = Column(Enum(FuelType), nullable=False)
    engine = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())