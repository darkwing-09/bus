"""Route model for bus routes between cities."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Float, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    origin: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    destination: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    # List of intermediate stops: [{"name": "CityX", "km_from_origin": 100, "duration_minutes": 60}]
    stops: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    trips = relationship("Trip", back_populates="route", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Route {self.origin} → {self.destination}>"
