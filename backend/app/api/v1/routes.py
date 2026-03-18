"""Route management API endpoints."""
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.route import Route
from app.schemas.schemas import RouteResponse

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.get("", response_model=list[RouteResponse])
async def list_routes(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List routes with optional origin/destination filters."""
    query = select(Route).where(Route.is_active == True)
    if origin:
        query = query.where(Route.origin.ilike(f"%{origin}%"))
    if destination:
        query = query.where(Route.destination.ilike(f"%{destination}%"))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    routes = result.scalars().all()
    return [RouteResponse.model_validate(r) for r in routes]


@router.get("/{route_id}", response_model=RouteResponse)
async def get_route(route_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a specific route."""
    result = await db.execute(select(Route).where(Route.id == route_id))
    route = result.scalar_one_or_none()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return RouteResponse.model_validate(route)
