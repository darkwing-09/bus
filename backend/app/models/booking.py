"""Booking model — a user's bus ticket booking."""
import uuid
import enum
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import String, Enum, Boolean, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    refunded = "refunded"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    trip_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trips.id"), nullable=False, index=True
    )
    # List of seat IDs booked
    seat_ids: Mapped[list] = mapped_column(JSON, nullable=False)
    # Passenger details for each seat
    passenger_details: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus), default=BookingStatus.pending, nullable=False
    )
    boarded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    qr_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="bookings", lazy="selectin")
    trip = relationship("Trip", back_populates="bookings", lazy="selectin")
    payment = relationship("Payment", back_populates="booking", uselist=False, lazy="selectin")

    def __repr__(self) -> str:
        return f"<Booking {self.id} ({self.status.value})>"
