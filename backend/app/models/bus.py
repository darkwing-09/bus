"""Bus model with layout configuration and amenities."""
import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import String, Integer, Float, Enum, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BusType(str, enum.Enum):
    ac_seater = "ac_seater"
    non_ac_seater = "non_ac_seater"
    ac_sleeper = "ac_sleeper"
    non_ac_sleeper = "non_ac_sleeper"
    volvo = "volvo"


class Bus(Base):
    __tablename__ = "buses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    operator_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bus_number: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    bus_type: Mapped[BusType] = mapped_column(Enum(BusType), nullable=False)
    total_seats: Mapped[int] = mapped_column(Integer, nullable=False)
    amenities: Mapped[dict] = mapped_column(
        JSON, default=dict, nullable=False
    )
    # Layout config defines seat grid: rows, columns, and individual seat positions
    layout_config: Mapped[dict] = mapped_column(
        JSON, default=dict, nullable=False
    )
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    seats = relationship("Seat", back_populates="bus", lazy="selectin", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="bus", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Bus {self.bus_number} ({self.bus_type.value})>"
