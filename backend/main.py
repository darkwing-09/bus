"""FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.core.seed import run_seeds

# Import all models so Base.metadata has them for create_all
import app.models  # noqa: F401

# Import all API routers
from app.api.v1.auth import router as auth_router
from app.api.v1.buses import router as buses_router
from app.api.v1.routes import router as routes_router
from app.api.v1.trips import router as trips_router
from app.api.v1.seats import router as seats_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.payments import router as payments_router
from app.api.v1.tracking import router as tracking_router
from app.api.v1.conductor import router as conductor_router
from app.api.v1.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    # Startup: create tables (safe if they already exist) and seed data
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables ready")
    except Exception as e:
        print(f"⚠️  Table creation error: {e}")

    try:
        await run_seeds()
    except Exception as e:
        print(f"⚠️  Seed error (may be OK on first run): {e}")
    yield
    # Shutdown: cleanup
    from app.core.redis import redis_client
    await redis_client.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade bus booking and live tracking platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(buses_router, prefix=API_PREFIX)
app.include_router(routes_router, prefix=API_PREFIX)
app.include_router(trips_router, prefix=API_PREFIX)
app.include_router(seats_router, prefix=API_PREFIX)
app.include_router(bookings_router, prefix=API_PREFIX)
app.include_router(payments_router, prefix=API_PREFIX)
app.include_router(tracking_router, prefix=API_PREFIX)
app.include_router(conductor_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME, "version": settings.APP_VERSION}
