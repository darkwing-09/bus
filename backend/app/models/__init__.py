"""Import all models so SQLAlchemy and Alembic can detect them."""
from app.models.user import User, UserRole
from app.models.bus import Bus, BusType
from app.models.route import Route
from app.models.trip import Trip, TripStatus
from app.models.seat import Seat, SeatType, DeckType
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.models.location import Location

__all__ = [
    "User", "UserRole",
    "Bus", "BusType",
    "Route",
    "Trip", "TripStatus",
    "Seat", "SeatType", "DeckType",
    "Booking", "BookingStatus",
    "Payment", "PaymentStatus",
    "Location",
]
