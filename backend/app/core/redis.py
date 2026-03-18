"""Redis connection for seat locking, pub/sub, and caching."""
import redis.asyncio as aioredis
from app.core.config import settings

# Async Redis connection pool
redis_pool = aioredis.ConnectionPool.from_url(
    settings.REDIS_URL,
    max_connections=50,
    decode_responses=True,
)

redis_client = aioredis.Redis(connection_pool=redis_pool)


async def get_redis() -> aioredis.Redis:
    """FastAPI dependency for Redis client."""
    return redis_client


# --- Seat Locking Helpers ---

async def lock_seat(trip_id: str, seat_id: str, user_id: str) -> bool:
    """
    Attempt to lock a seat for a user.
    Returns True if lock acquired, False if already locked by another user.
    """
    key = f"seat_lock:{trip_id}:{seat_id}"
    # NX = only set if not exists, EX = expiry in seconds
    result = await redis_client.set(
        key, user_id, nx=True, ex=settings.SEAT_LOCK_TTL_SECONDS
    )
    if result:
        return True
    # Check if current user already holds the lock
    holder = await redis_client.get(key)
    return holder == user_id


async def unlock_seat(trip_id: str, seat_id: str, user_id: str) -> bool:
    """Release a seat lock if owned by this user."""
    key = f"seat_lock:{trip_id}:{seat_id}"
    holder = await redis_client.get(key)
    if holder == user_id:
        await redis_client.delete(key)
        return True
    return False


async def get_seat_lock_holder(trip_id: str, seat_id: str) -> str | None:
    """Get the user_id holding the lock, or None if unlocked."""
    key = f"seat_lock:{trip_id}:{seat_id}"
    return await redis_client.get(key)


async def confirm_seat_booking(trip_id: str, seat_id: str) -> None:
    """Remove the temporary lock after successful booking."""
    key = f"seat_lock:{trip_id}:{seat_id}"
    await redis_client.delete(key)


# --- Pub/Sub for Live Tracking ---

async def publish_location(trip_id: str, location_data: dict) -> None:
    """Publish bus location update to Redis channel."""
    import json
    channel = f"trip:{trip_id}:location"
    await redis_client.publish(channel, json.dumps(location_data))
