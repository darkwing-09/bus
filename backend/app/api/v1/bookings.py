"""Booking management API endpoints."""
import json
import io
import base64
from uuid import UUID

import qrcode
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.redis import get_seat_lock_holder, confirm_seat_booking
from app.models.user import User
from app.models.trip import Trip
from app.models.booking import Booking, BookingStatus
from app.schemas.schemas import (
    BookingCreate,
    BookingResponse,
    BookingDetailResponse,
    TripResponse,
    TripSearchResponse,
    BusResponse,
    RouteResponse,
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def generate_qr_code(data: dict) -> str:
    """Generate a base64-encoded QR code image."""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(json.dumps(data))
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode()


@router.post("", response_model=BookingResponse, status_code=201)
async def create_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a booking after seats are locked and payment is verified."""
    user_id = str(current_user.id)
    trip_id = str(data.trip_id)

    # Verify trip exists
    result = await db.execute(
        select(Trip)
        .where(Trip.id == data.trip_id)
        .options(selectinload(Trip.bus), selectinload(Trip.route))
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Verify all seats are locked by this user
    for seat_id in data.seat_ids:
        holder = await get_seat_lock_holder(trip_id, str(seat_id))
        if holder != user_id:
            raise HTTPException(
                status_code=409,
                detail=f"Seat {seat_id} is not locked by you. Please re-select seats.",
            )

    total_amount = trip.price * len(data.seat_ids)

    # Create booking
    booking = Booking(
        user_id=current_user.id,
        trip_id=data.trip_id,
        seat_ids=[str(sid) for sid in data.seat_ids],
        passenger_details=[p.model_dump() for p in data.passenger_details],
        total_amount=total_amount,
        status=BookingStatus.pending,
    )
    db.add(booking)
    await db.flush()
    await db.refresh(booking)

    # Generate QR code
    qr_data = {
        "booking_id": str(booking.id),
        "trip_id": str(booking.trip_id),
        "user": current_user.full_name,
        "seats": [str(sid) for sid in data.seat_ids],
    }
    booking.qr_code = generate_qr_code(qr_data)
    await db.flush()
    await db.refresh(booking)

    return BookingResponse.model_validate(booking)


@router.get("/history", response_model=list[BookingDetailResponse])
async def booking_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get booking history for the current user."""
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .options(
            selectinload(Booking.trip).selectinload(Trip.bus),
            selectinload(Booking.trip).selectinload(Trip.route),
        )
        .order_by(Booking.created_at.desc())
    )
    bookings = result.scalars().unique().all()

    results = []
    for b in bookings:
        trip_data = None
        if b.trip:
            trip_data = TripSearchResponse(
                **TripResponse.model_validate(b.trip).model_dump(),
                bus=BusResponse.model_validate(b.trip.bus),
                route=RouteResponse.model_validate(b.trip.route),
            )
        results.append(
            BookingDetailResponse(
                **BookingResponse.model_validate(b).model_dump(),
                trip=trip_data,
            )
        )
    return results


@router.get("/{booking_id}", response_model=BookingDetailResponse)
async def get_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific booking."""
    result = await db.execute(
        select(Booking)
        .where(and_(Booking.id == booking_id, Booking.user_id == current_user.id))
        .options(
            selectinload(Booking.trip).selectinload(Trip.bus),
            selectinload(Booking.trip).selectinload(Trip.route),
        )
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    trip_data = None
    if booking.trip:
        trip_data = TripSearchResponse(
            **TripResponse.model_validate(booking.trip).model_dump(),
            bus=BusResponse.model_validate(booking.trip.bus),
            route=RouteResponse.model_validate(booking.trip.route),
        )

    return BookingDetailResponse(
        **BookingResponse.model_validate(booking).model_dump(),
        trip=trip_data,
    )
