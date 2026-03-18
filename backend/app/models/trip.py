"""Trip model — a specific bus journey on a route."""
import uuid
import enum
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import String, Enum, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TripStatus(str, enum.Enum):
    scheduled = "scheduled"
    boarding = "boarding"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    bus_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("buses.id"), nullable=False, index=True
    )
    route_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("routes.id"), nullable=False, index=True
    )
    conductor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    departure_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    arrival_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False
    )
    status: Mapped[TripStatus] = mapped_column(
        Enum(TripStatus), default=TripStatus.scheduled, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    bus = relationship("Bus", back_populates="trips", lazy="selectin")
    route = relationship("Route", back_populates="trips", lazy="selectin")
    conductor = relationship("User", back_populates="conducted_trips", lazy="selectin")
    bookings = relationship("Booking", back_populates="trip", lazy="selectin")
    locations = relationship("Location", back_populates="trip", lazy="selectin",
                             order_by="Location.timestamp.desc()")

    def __repr__(self) -> str:
        return f"<Trip {self.id} ({self.status.value})>"
