"""Admin panel API endpoints — full system management."""
from uuid import UUID
from typing import Optional
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import require_admin, hash_password
from app.models.user import User, UserRole
from app.models.bus import Bus
from app.models.route import Route
from app.models.trip import Trip, TripStatus
from app.models.seat import Seat
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.schemas.schemas import (
    AdminCreateUser,
    UserResponse,
    BusCreate,
    BusUpdate,
    BusResponse,
    RouteCreate,
    RouteUpdate,
    RouteResponse,
    TripCreate,
    TripUpdate,
    TripResponse,
    TripSearchResponse,
    BookingResponse,
    AnalyticsResponse,
    SeatCreate,
    SeatResponse,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ============================================================
#  USER MANAGEMENT
# ============================================================

@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    data: AdminCreateUser,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a conductor or admin user."""
    if data.role not in ("conductor", "admin"):
        raise HTTPException(status_code=400, detail="Only conductor or admin roles can be created")

    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=UserRole(data.role),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    role: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users with optional role filter."""
    query = select(User)
    if role:
        query = query.where(User.role == UserRole(role))
    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.is_active = False
    await db.flush()
    return {"status": "deactivated", "user_id": str(user_id)}


# ============================================================
#  BUS MANAGEMENT
# ============================================================

@router.post("/buses", response_model=BusResponse, status_code=201)
async def create_bus(
    data: BusCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new bus."""
    bus = Bus(**data.model_dump())
    db.add(bus)
    await db.flush()
    await db.refresh(bus)
    return BusResponse.model_validate(bus)


@router.put("/buses/{bus_id}", response_model=BusResponse)
async def update_bus(
    bus_id: UUID,
    data: BusUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a bus."""
    result = await db.execute(select(Bus).where(Bus.id == bus_id))
    bus = result.scalar_one_or_none()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bus, field, value)
    await db.flush()
    await db.refresh(bus)
    return BusResponse.model_validate(bus)


@router.delete("/buses/{bus_id}")
async def delete_bus(
    bus_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a bus."""
    result = await db.execute(select(Bus).where(Bus.id == bus_id))
    bus = result.scalar_one_or_none()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    await db.delete(bus)
    return {"status": "deleted", "bus_id": str(bus_id)}


@router.post("/buses/{bus_id}/seats", response_model=list[SeatResponse], status_code=201)
async def create_seats(
    bus_id: UUID,
    seats: list[SeatCreate],
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create seats for a bus."""
    result = await db.execute(select(Bus).where(Bus.id == bus_id))
    bus = result.scalar_one_or_none()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")

    created_seats = []
    for s in seats:
        seat = Seat(bus_id=bus_id, **s.model_dump())
        db.add(seat)
        created_seats.append(seat)

    await db.flush()
    for seat in created_seats:
        await db.refresh(seat)

    return [SeatResponse.model_validate(s) for s in created_seats]


# ============================================================
#  ROUTE MANAGEMENT
# ============================================================

@router.post("/routes", response_model=RouteResponse, status_code=201)
async def create_route(
    data: RouteCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new route."""
    route = Route(**data.model_dump())
    db.add(route)
    await db.flush()
    await db.refresh(route)
    return RouteResponse.model_validate(route)


@router.put("/routes/{route_id}", response_model=RouteResponse)
async def update_route(
    route_id: UUID,
    data: RouteUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a route."""
    result = await db.execute(select(Route).where(Route.id == route_id))
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(route, field, value)
    await db.flush()
    await db.refresh(route)
    return RouteResponse.model_validate(route)


@router.delete("/routes/{route_id}")
async def delete_route(
    route_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a route."""
    result = await db.execute(select(Route).where(Route.id == route_id))
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    await db.delete(route)
    return {"status": "deleted", "route_id": str(route_id)}


# ============================================================
#  TRIP MANAGEMENT
# ============================================================

@router.post("/trips", response_model=TripResponse, status_code=201)
async def create_trip(
    data: TripCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new trip."""
    trip = Trip(**data.model_dump())
    db.add(trip)
    await db.flush()
    await db.refresh(trip)
    return TripResponse.model_validate(trip)


@router.get("/trips", response_model=list[TripSearchResponse])
async def list_trips(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all trips."""
    query = select(Trip).options(selectinload(Trip.bus), selectinload(Trip.route))
    if status:
        query = query.where(Trip.status == TripStatus(status))
    query = query.order_by(Trip.departure_time.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    trips = result.scalars().unique().all()
    return [
        TripSearchResponse(
            **TripResponse.model_validate(t).model_dump(),
            bus=BusResponse.model_validate(t.bus),
            route=RouteResponse.model_validate(t.route),
        )
        for t in trips
    ]


@router.put("/trips/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: UUID,
    data: TripUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a trip."""
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "status":
            setattr(trip, field, TripStatus(value))
        else:
            setattr(trip, field, value)
    await db.flush()
    await db.refresh(trip)
    return TripResponse.model_validate(trip)


# ============================================================
#  BOOKING MANAGEMENT
# ============================================================

@router.get("/bookings", response_model=list[BookingResponse])
async def list_bookings(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all bookings."""
    query = select(Booking)
    if status:
        query = query.where(Booking.status == BookingStatus(status))
    query = query.order_by(Booking.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [BookingResponse.model_validate(b) for b in result.scalars().all()]


@router.put("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a booking (admin)."""
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status == BookingStatus.cancelled:
        raise HTTPException(status_code=400, detail="Already cancelled")
    booking.status = BookingStatus.cancelled
    await db.flush()
    return {"status": "cancelled", "booking_id": str(booking_id)}


@router.put("/bookings/{booking_id}/refund")
async def refund_booking(
    booking_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Initiate refund for a booking."""
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id).options(selectinload(Booking.payment))
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = BookingStatus.refunded
    if booking.payment:
        booking.payment.status = PaymentStatus.refunded
    await db.flush()
    return {"status": "refunded", "booking_id": str(booking_id)}


# ============================================================
#  ANALYTICS
# ============================================================

@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get platform analytics dashboard data."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_bookings = (await db.execute(select(func.count(Booking.id)))).scalar() or 0
    total_revenue = (
        await db.execute(
            select(func.coalesce(func.sum(Booking.total_amount), 0)).where(
                Booking.status == BookingStatus.confirmed
            )
        )
    ).scalar() or Decimal("0")
    total_buses = (await db.execute(select(func.count(Bus.id)))).scalar() or 0
    total_routes = (await db.execute(select(func.count(Route.id)))).scalar() or 0
    total_trips = (await db.execute(select(func.count(Trip.id)))).scalar() or 0

    # Recent bookings
    recent_result = await db.execute(
        select(Booking).order_by(Booking.created_at.desc()).limit(10)
    )
    recent_bookings = [BookingResponse.model_validate(b) for b in recent_result.scalars().all()]

    return AnalyticsResponse(
        total_users=total_users,
        total_bookings=total_bookings,
        total_revenue=total_revenue,
        total_buses=total_buses,
        total_routes=total_routes,
        total_trips=total_trips,
        recent_bookings=recent_bookings,
    )
