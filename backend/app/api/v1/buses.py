"""Bus search and details API endpoints."""
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.bus import Bus
from app.models.seat import Seat
from app.schemas.schemas import BusResponse, BusDetailResponse, SeatResponse

router = APIRouter(prefix="/buses", tags=["Buses"])


@router.get("", response_model=list[BusResponse])
async def list_buses(
    bus_type: Optional[str] = None,
    operator: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List all buses with optional filtering."""
    query = select(Bus)
    if bus_type:
        query = query.where(Bus.bus_type == bus_type)
    if operator:
        query = query.where(Bus.operator_name.ilike(f"%{operator}%"))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    buses = result.scalars().all()
    return [BusResponse.model_validate(b) for b in buses]


@router.get("/{bus_id}", response_model=BusDetailResponse)
async def get_bus_detail(bus_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get bus details with seat layout."""
    result = await db.execute(
        select(Bus).where(Bus.id == bus_id).options(selectinload(Bus.seats))
    )
    bus = result.scalar_one_or_none()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")

    return BusDetailResponse(
        **BusResponse.model_validate(bus).model_dump(),
        seats=[SeatResponse.model_validate(s) for s in bus.seats],
    )
