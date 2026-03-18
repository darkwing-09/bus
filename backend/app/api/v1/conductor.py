"""Conductor panel API endpoints."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import require_conductor
from app.core.redis import publish_location
from app.models.user import User
from app.models.trip import Trip, TripStatus
from app.models.booking import Booking, BookingStatus
from app.models.location import Location
from app.schemas.schemas import (
    TripResponse,
    TripSearchResponse,
    TripStatusUpdate,
    LocationUpdate,
    LocationResponse,
    PassengerBoardRequest,
    AnnouncementRequest,
    BookingResponse,
    BusResponse,
    RouteResponse,
)

router = APIRouter(prefix="/conductor", tags=["Conductor"])


@router.get("/trip", response_model=TripSearchResponse | None)
async def get_current_trip(
    current_user: User = Depends(require_conductor),
    db: AsyncSession = Depends(get_db),
):
    """Get the conductor's current active trip."""
    result = await db.execute(
        select(Trip)
        .where(
            and_(
                Trip.conductor_id == current_user.id,
                Trip.status.in_([TripStatus.scheduled, TripStatus.boarding, TripStatus.in_progress]),
            )
        )
        .options(selectinload(Trip.bus), selectinload(Trip.route))
        .order_by(Trip.departure_time)
        .limit(1)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        return None

    return TripSearchResponse(
        **TripResponse.model_validate(trip).model_dump(),
        bus=BusResponse.model_validate(trip.bus),
        route=RouteResponse.model_validate(trip.route),
    )


@router.put("/trip/{trip_id}/status", response_model=TripResponse)
async def update_trip_status(
    trip_id: UUID,
    data: TripStatusUpdate,
    current_user: User = Depends(require_conductor),
    db: AsyncSession = Depends(get_db),
):
    """Start or end a trip."""
    result = await db.execute(
        select(Trip).where(
            Trip.id == trip_id,
            Trip.conductor_id == current_user.id,
        )
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or not assigned to you")

    valid_transitions = {
        "scheduled": ["boarding", "in_progress"],
        "boarding": ["in_progress"],
        "in_progress": ["completed"],
    }

    current = trip.status.value
    target = data.status
    if target not in valid_transitions.get(current, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{current}' to '{target}'",
        )

    trip.status = TripStatus(target)
    await db.flush()
    await db.refresh(trip)
    return TripResponse.model_validate(trip)


@router.post("/trip/{trip_id}/location", response_model=LocationResponse)
async def post_location(
    trip_id: UUID,
    data: LocationUpdate,
    current_user: User = Depends(require_conductor),
    db: AsyncSession = Depends(get_db),
):
    """Update bus location during trip."""
    result = await db.execute(
        select(Trip).where(
            Trip.id == trip_id,
            Trip.conductor_id == current_user.id,
            Trip.status == TripStatus.in_progress,
        )
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=403, detail="No active trip found for you")

    location = Location(
        trip_id=trip_id,
        latitude=data.latitude,
        longitude=data.longitude,
        speed=data.speed,
        heading=data.heading,
    )
    db.add(location)
    await db.flush()
    await db.refresh(location)

    await publish_location(str(trip_id), {
        "trip_id": str(trip_id),
        "latitude": data.latitude,
        "longitude": data.longitude,
        "speed": data.speed,
        "heading": data.heading,
        "timestamp": location.timestamp.isoformat(),
    })

    return LocationResponse.model_validate(location)


@router.get("/trip/{trip_id}/passengers", response_model=list[BookingResponse])
async def get_passengers(
    trip_id: UUID,
    current_user: User = Depends(require_conductor),
    db: AsyncSession = Depends(get_db),
):
    """Get passenger list for a trip."""
    # Verify conductor's trip
    trip_result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.conductor_id == current_user.id)
    )
    if not trip_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not your trip")

    result = await db.execute(
        select(Booking)
        .where(
            Booking.trip_id == trip_id,
            Booking.status == BookingStatus.confirmed,
        )
        .options(selectinload(Booking.user))
        .order_by(Booking.created_at)
    )
    bookings = result.scalars().all()
    return [BookingResponse.model_validate(b) for b in bookings]


@router.post("/scan", response_model=BookingResponse)
async def scan_ticket(
    data: PassengerBoardRequest,
    current_user: User = Depends(require_conductor),
    db: AsyncSession = Depends(get_db),
):
    """Scan QR code and mark passenger as boarded."""
    result = await db.execute(
        select(Booking)
        .where(Booking.id == data.booking_id, Booking.status == BookingStatus.confirmed)
        .options(selectinload(Booking.trip))
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or not confirmed")

    if booking.trip.conductor_id != current_user.id:
        raise HTTPException(status_code=403, detail="This booking is not on your trip")

    booking.boarded = True
    await db.flush()
    await db.refresh(booking)
    return BookingResponse.model_validate(booking)


@router.post("/trip/{trip_id}/announce")
async def send_announcement(
    trip_id: UUID,
    data: AnnouncementRequest,
    current_user: User = Depends(require_conductor),
    db: AsyncSession = Depends(get_db),
):
    """Broadcast an announcement to passengers."""
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.conductor_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not your trip")

    # Publish announcement via Redis
    import json
    from app.core.redis import redis_client
    await redis_client.publish(
        f"trip:{trip_id}:announcements",
        json.dumps({
            "type": "announcement",
            "message": data.message,
            "from": current_user.full_name,
        }),
    )

    return {"status": "sent", "message": data.message}
