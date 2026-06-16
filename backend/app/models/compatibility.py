from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base

class CompatibilityMatrix(Base):
    __tablename__ = "compatibility_matrix"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    part_id = Column(UUID(as_uuid=True), ForeignKey("parts.id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    is_compatible = Column(Boolean, default=True)
    notes = Column(String(255), nullable=True)  # ex: "Valable uniquement moteur 75kWh"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    part = relationship("Part", back_populates="compatibilities")
    vehicle = relationship("Vehicle")