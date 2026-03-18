"""FastAPI dependency injection helpers."""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.core.database import get_db
from app.core.redis import get_redis
from app.core.security import get_current_user, RoleChecker


# Re-export for clean imports in route handlers
__all__ = [
    "get_db",
    "get_redis",
    "get_current_user",
    "RoleChecker",
]
