"""Pydantic schemas for request/response validation."""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ============================================================
# AUTH SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


# ============================================================
# BUS SCHEMAS
# ============================================================

class BusCreate(BaseModel):
    operator_name: str = Field(min_length=1, max_length=255)
    bus_number: str = Field(min_length=1, max_length=50)
    bus_type: str
    total_seats: int = Field(gt=0)
    amenities: dict = Field(default_factory=dict)
    layout_config: dict = Field(default_factory=dict)
    image_url: Optional[str] = None


class BusUpdate(BaseModel):
    operator_name: Optional[str] = None
    bus_number: Optional[str] = None
    bus_type: Optional[str] = None
    total_seats: Optional[int] = None
    amenities: Optional[dict] = None
    layout_config: Optional[dict] = None
    rating: Optional[float] = None
    image_url: Optional[str] = None


class BusResponse(BaseModel):
    id: UUID
    operator_name: str
    bus_number: str
    bus_type: str
    total_seats: int
    amenities: dict
    layout_config: dict
    rating: float
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SeatResponse(BaseModel):
    id: UUID
    bus_id: UUID
    seat_number: str
    seat_type: str
    deck: str
    row_num: int
    col_num: int
    is_available: bool

    class Config:
        from_attributes = True


class BusDetailResponse(BusResponse):
    seats: list[SeatResponse] = []


# ============================================================
# ROUTE SCHEMAS
# ============================================================

class RouteCreate(BaseModel):
    origin: str = Field(min_length=1, max_length=255)
    destination: str = Field(min_length=1, max_length=255)
    distance_km: float = Field(gt=0)
    estimated_duration_minutes: int = Field(gt=0)
    stops: list = Field(default_factory=list)


class RouteUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    distance_km: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    stops: Optional[list] = None
    is_active: Optional[bool] = None


class RouteResponse(BaseModel):
    id: UUID
    origin: str
    destination: str
    distance_km: float
    estimated_duration_minutes: int
    stops: list
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# TRIP SCHEMAS
# ============================================================

class TripCreate(BaseModel):
    bus_id: UUID
    route_id: UUID
    conductor_id: Optional[UUID] = None
    departure_time: datetime
    arrival_time: datetime
    price: Decimal = Field(gt=0)


class TripUpdate(BaseModel):
    conductor_id: Optional[UUID] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    price: Optional[Decimal] = None
    status: Optional[str] = None


class TripResponse(BaseModel):
    id: UUID
    bus_id: UUID
    route_id: UUID
    conductor_id: Optional[UUID]
    departure_time: datetime
    arrival_time: datetime
    price: Decimal
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TripSearchResponse(TripResponse):
    bus: BusResponse
    route: RouteResponse


class TripDetailResponse(TripSearchResponse):
    available_seats: int = 0
    seats: list[SeatResponse] = []


# ============================================================
# SEAT LOCK SCHEMAS
# ============================================================

class SeatLockRequest(BaseModel):
    trip_id: UUID
    seat_ids: list[UUID]


class SeatLockResponse(BaseModel):
    locked: list[UUID]
    failed: list[UUID]
    ttl_seconds: int


# ============================================================
# BOOKING SCHEMAS
# ============================================================

class PassengerDetail(BaseModel):
    name: str
    age: int
    gender: str
    seat_id: UUID


class BookingCreate(BaseModel):
    trip_id: UUID
    seat_ids: list[UUID]
    passenger_details: list[PassengerDetail]


class BookingResponse(BaseModel):
    id: UUID
    user_id: UUID
    trip_id: UUID
    seat_ids: list
    passenger_details: list
    total_amount: Decimal
    status: str
    boarded: bool
    qr_code: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BookingDetailResponse(BookingResponse):
    trip: Optional[TripSearchResponse] = None


# ============================================================
# PAYMENT SCHEMAS
# ============================================================

class PaymentCreateRequest(BaseModel):
    booking_id: UUID


class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    currency: str
    booking_id: UUID
    key_id: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_id: UUID


class PaymentResponse(BaseModel):
    id: UUID
    booking_id: UUID
    razorpay_order_id: Optional[str]
    razorpay_payment_id: Optional[str]
    amount: Decimal
    currency: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# LOCATION / TRACKING SCHEMAS
# ============================================================

class LocationUpdate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0


class LocationResponse(BaseModel):
    id: UUID
    trip_id: UUID
    latitude: float
    longitude: float
    speed: Optional[float]
    heading: Optional[float]
    timestamp: datetime

    class Config:
        from_attributes = True


# ============================================================
# CONDUCTOR SCHEMAS
# ============================================================

class TripStatusUpdate(BaseModel):
    status: str  # "in_progress", "completed"


class PassengerBoardRequest(BaseModel):
    booking_id: UUID


class AnnouncementRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)


# ============================================================
# ADMIN SCHEMAS
# ============================================================

class AdminCreateUser(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: str = "conductor"


class AnalyticsResponse(BaseModel):
    total_users: int
    total_bookings: int
    total_revenue: Decimal
    total_buses: int
    total_routes: int
    total_trips: int
    recent_bookings: list[BookingResponse] = []


class SeatCreate(BaseModel):
    seat_number: str
    seat_type: str
    deck: str = "lower"
    row_num: int
    col_num: int


# Resolve forward references
TokenResponse.model_rebuild()
