from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base

class GarageVehicle(Base):
    __tablename__ = "garage_vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    nickname = Column(String(100), nullable=True)   # ex: "Ma Tesla"
    mileage = Column(Integer, default=0)            # kilométrage actuel
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    user = relationship("User", back_populates="garage_vehicles")
    vehicle = relationship("Vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="garage_vehicle")


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    garage_vehicle_id = Column(UUID(as_uuid=True), ForeignKey("garage_vehicles.id"), nullable=False)
    part_id = Column(UUID(as_uuid=True), ForeignKey("parts.id"), nullable=True)
    description = Column(String(255), nullable=False)  # ex: "Remplacement filtre"
    mileage_at_service = Column(Integer, nullable=True)
    next_service_mileage = Column(Integer, nullable=True)  # alerte prédictive
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    garage_vehicle = relationship("GarageVehicle", back_populates="maintenance_logs")
    part = relationship("Part")