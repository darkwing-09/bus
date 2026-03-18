"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Global application settings loaded from environment variables."""

    # App
    APP_NAME: str = "BusBook"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://busbook:busbook_secret@localhost:5432/busbook"
    DATABASE_SYNC_URL: str = "postgresql+psycopg2://busbook:busbook_secret@localhost:5432/busbook"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Auth
    JWT_SECRET_KEY: str = "super-secret-change-in-production-32chars-min"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Seat Lock
    SEAT_LOCK_TTL_SECONDS: int = 300  # 5 minutes

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Admin seed
    ADMIN_EMAIL: str = "admin@busbook.com"
    ADMIN_PASSWORD: str = "Admin@123"
    ADMIN_NAME: str = "System Admin"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
