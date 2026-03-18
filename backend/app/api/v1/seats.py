"""Seat locking API endpoints using Redis."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.redis import lock_seat, unlock_seat
from app.core.config import settings
from app.models.user import User
from app.schemas.schemas import SeatLockRequest, SeatLockResponse

router = APIRouter(prefix="/seats", tags=["Seats"])


@router.post("/lock", response_model=SeatLockResponse)
async def lock_seats(
    data: SeatLockRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lock selected seats for the current user (5-minute TTL)."""
    user_id = str(current_user.id)
    trip_id = str(data.trip_id)

    locked = []
    failed = []

    for seat_id in data.seat_ids:
        success = await lock_seat(trip_id, str(seat_id), user_id)
        if success:
            locked.append(seat_id)
        else:
            failed.append(seat_id)

    if not locked:
        raise HTTPException(
            status_code=409,
            detail="All requested seats are already locked by another user",
        )

    return SeatLockResponse(
        locked=locked,
        failed=failed,
        ttl_seconds=settings.SEAT_LOCK_TTL_SECONDS,
    )


@router.post("/unlock")
async def unlock_seats(
    data: SeatLockRequest,
    current_user: User = Depends(get_current_user),
):
    """Release seat locks held by the current user."""
    user_id = str(current_user.id)
    trip_id = str(data.trip_id)
    released = 0

    for seat_id in data.seat_ids:
        success = await unlock_seat(trip_id, str(seat_id), user_id)
        if success:
            released += 1

    return {"released": released, "total": len(data.seat_ids)}
