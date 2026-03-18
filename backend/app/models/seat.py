"""Seat model — individual seats in a bus."""
import uuid
import enum

from sqlalchemy import String, Integer, Enum, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SeatType(str, enum.Enum):
    window = "window"
    aisle = "aisle"
    middle = "middle"


class DeckType(str, enum.Enum):
    lower = "lower"
    upper = "upper"


class Seat(Base):
    __tablename__ = "seats"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    bus_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("buses.id"), nullable=False, index=True
    )
    seat_number: Mapped[str] = mapped_column(String(10), nullable=False)
    seat_type: Mapped[SeatType] = mapped_column(Enum(SeatType), nullable=False)
    deck: Mapped[DeckType] = mapped_column(
        Enum(DeckType), default=DeckType.lower, nullable=False
    )
    row_num: Mapped[int] = mapped_column(Integer, nullable=False)
    col_num: Mapped[int] = mapped_column(Integer, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    bus = relationship("Bus", back_populates="seats")

    def __repr__(self) -> str:
        return f"<Seat {self.seat_number} (Bus: {self.bus_id})>"
