"""Trip search and management API endpoints."""
from uuid import UUID
from datetime import datetime, date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.redis import get_seat_lock_holder
from app.models.trip import Trip, TripStatus
from app.models.route import Route
from app.models.bus import Bus
from app.models.seat import Seat
from app.models.booking import Booking, BookingStatus
from app.schemas.schemas import (
    TripResponse,
    TripSearchResponse,
    TripDetailResponse,
    BusResponse,
    RouteResponse,
    SeatResponse,
)

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("/search", response_model=list[TripSearchResponse])
async def search_trips(
    origin: str = Query(..., min_length=1),
    destination: str = Query(..., min_length=1),
    travel_date: date = Query(...),
    bus_type: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Search available trips by origin, destination, and date."""
    query = (
        select(Trip)
        .join(Route, Trip.route_id == Route.id)
        .join(Bus, Trip.bus_id == Bus.id)
        .where(
            and_(
                Route.origin.ilike(f"%{origin}%"),
                Route.destination.ilike(f"%{destination}%"),
                func.date(Trip.departure_time) == travel_date,
                Trip.status.in_([TripStatus.scheduled, TripStatus.boarding]),
            )
        )
        .options(selectinload(Trip.bus), selectinload(Trip.route))
    )

    if bus_type:
        query = query.where(Bus.bus_type == bus_type)

    query = query.order_by(Trip.departure_time).offset(skip).limit(limit)
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


@router.get("/{trip_id}", response_model=TripDetailResponse)
async def get_trip_detail(trip_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get trip details with available seats."""
    result = await db.execute(
        select(Trip)
        .where(Trip.id == trip_id)
        .options(
            selectinload(Trip.bus).selectinload(Bus.seats),
            selectinload(Trip.route),
        )
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Get booked seat IDs for this trip
    booking_result = await db.execute(
        select(Booking.seat_ids).where(
            and_(
                Booking.trip_id == trip_id,
                Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending]),
            )
        )
    )
    booked_seat_ids = set()
    for row in booking_result.all():
        if row[0]:
            booked_seat_ids.update(row[0])

    # Check Redis locks for each seat
    seats_with_status = []
    for seat in trip.bus.seats:
        seat_data = SeatResponse.model_validate(seat)
        seat_id_str = str(seat.id)
        # Check if seat is booked or locked
        if seat_id_str in booked_seat_ids:
            seat_data.is_available = False
        else:
            lock_holder = await get_seat_lock_holder(str(trip_id), seat_id_str)
            if lock_holder:
                seat_data.is_available = False
        seats_with_status.append(seat_data)

    available_count = sum(1 for s in seats_with_status if s.is_available)

    return TripDetailResponse(
        **TripResponse.model_validate(trip).model_dump(),
        bus=BusResponse.model_validate(trip.bus),
        route=RouteResponse.model_validate(trip.route),
        available_seats=available_count,
        seats=seats_with_status,
    )
