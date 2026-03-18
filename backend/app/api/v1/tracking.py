"""Real-time bus tracking — WebSocket and REST endpoints."""
from uuid import UUID

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.redis import publish_location, redis_client
from app.models.user import User
from app.models.trip import Trip
from app.models.location import Location
from app.schemas.schemas import LocationUpdate, LocationResponse

import asyncio
import json

router = APIRouter(prefix="/tracking", tags=["Tracking"])


@router.post("/{trip_id}/location", response_model=LocationResponse)
async def update_location(
    trip_id: UUID,
    data: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update bus location (conductor only)."""
    # Verify conductor is assigned to this trip
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id, Trip.conductor_id == current_user.id)
    )
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(
            status_code=403,
            detail="You are not the conductor of this trip",
        )

    # Save to database
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

    # Publish to Redis for WebSocket broadcast
    await publish_location(str(trip_id), {
        "trip_id": str(trip_id),
        "latitude": data.latitude,
        "longitude": data.longitude,
        "speed": data.speed,
        "heading": data.heading,
        "timestamp": location.timestamp.isoformat(),
    })

    return LocationResponse.model_validate(location)


@router.get("/{trip_id}/latest", response_model=LocationResponse)
async def get_latest_location(
    trip_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get the latest known location for a trip."""
    result = await db.execute(
        select(Location)
        .where(Location.trip_id == trip_id)
        .order_by(Location.timestamp.desc())
        .limit(1)
    )
    location = result.scalar_one_or_none()
    if not location:
        raise HTTPException(status_code=404, detail="No location data available")
    return LocationResponse.model_validate(location)


@router.websocket("/{trip_id}/ws")
async def tracking_websocket(websocket: WebSocket, trip_id: str):
    """WebSocket endpoint for live bus tracking.

    Clients connect here to receive real-time location updates.
    Uses Redis pub/sub to fan out location updates from conductor.
    """
    await websocket.accept()

    pubsub = redis_client.pubsub()
    channel = f"trip:{trip_id}:location"

    try:
        await pubsub.subscribe(channel)

        while True:
            message = await pubsub.get_message(
                ignore_subscribe_messages=True, timeout=1.0
            )
            if message and message["type"] == "message":
                await websocket.send_text(message["data"])
            else:
                # Send heartbeat to detect disconnected clients
                try:
                    await asyncio.wait_for(
                        websocket.receive_text(), timeout=0.1
                    )
                except asyncio.TimeoutError:
                    pass
                except WebSocketDisconnect:
                    break

    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()
