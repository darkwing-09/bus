"""Seed database with default admin and sample data."""
import asyncio
from sqlalchemy import select
from app.core.database import async_session_factory
from app.core.security import hash_password
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.bus import Bus, BusType
from app.models.route import Route
from app.models.seat import Seat, SeatType, DeckType


async def seed_admin():
    """Create or verify the default admin user."""
    async with async_session_factory() as session:
        result = await session.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        )
        admin = result.scalar_one_or_none()
        if not admin:
            admin = User(
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                full_name=settings.ADMIN_NAME,
                phone="+91-9000000000",
                role=UserRole.admin,
            )
            session.add(admin)
            await session.commit()
            print(f"✅ Admin seeded: {settings.ADMIN_EMAIL}")
        else:
            print(f"ℹ️  Admin already exists: {settings.ADMIN_EMAIL}")


async def seed_sample_data():
    """Seed sample buses, routes, and seats for development."""
    async with async_session_factory() as session:
        # Check if data exists
        result = await session.execute(select(Bus).limit(1))
        if result.scalar_one_or_none():
            print("ℹ️  Sample data already exists, skipping")
            return

        # --- Conductor ---
        conductor = User(
            email="conductor@busbook.com",
            password_hash=hash_password("Conductor@123"),
            full_name="Demo Conductor",
            phone="+91-9000000001",
            role=UserRole.conductor,
        )
        session.add(conductor)

        # --- Buses ---
        bus1 = Bus(
            operator_name="Royal Express",
            bus_number="KA-01-AB-1234",
            bus_type=BusType.ac_seater,
            total_seats=40,
            amenities={
                "wifi": True,
                "charging": True,
                "water": True,
                "blanket": True,
                "entertainment": True,
            },
            layout_config={
                "rows": 10,
                "cols_left": 2,
                "cols_right": 2,
                "aisle_after": 2,
                "last_row_seats": 5,
            },
            rating=4.5,
        )

        bus2 = Bus(
            operator_name="Star Travels",
            bus_number="MH-02-CD-5678",
            bus_type=BusType.volvo,
            total_seats=36,
            amenities={
                "wifi": True,
                "charging": True,
                "water": True,
                "snacks": True,
                "entertainment": True,
                "blanket": True,
            },
            layout_config={
                "rows": 9,
                "cols_left": 2,
                "cols_right": 2,
                "aisle_after": 2,
                "last_row_seats": 5,
            },
            rating=4.7,
        )

        bus3 = Bus(
            operator_name="Metro Liner",
            bus_number="TN-03-EF-9012",
            bus_type=BusType.ac_sleeper,
            total_seats=30,
            amenities={
                "wifi": True,
                "charging": True,
                "water": True,
                "blanket": True,
            },
            layout_config={
                "rows": 10,
                "cols_left": 1,
                "cols_right": 2,
                "aisle_after": 1,
                "deck": "both",
            },
            rating=4.2,
        )

        session.add_all([bus1, bus2, bus3])
        await session.flush()

        # --- Seats for Bus 1 (10 rows × 4 cols = 40 seats) ---
        for row in range(1, 11):
            for col in range(1, 5):
                seat_type = SeatType.window if col in (1, 4) else SeatType.aisle
                seat = Seat(
                    bus_id=bus1.id,
                    seat_number=f"{row}{chr(64 + col)}",
                    seat_type=seat_type,
                    deck=DeckType.lower,
                    row_num=row,
                    col_num=col,
                )
                session.add(seat)

        # --- Seats for Bus 2 (9 rows × 4 cols = 36 seats) ---
        for row in range(1, 10):
            for col in range(1, 5):
                seat_type = SeatType.window if col in (1, 4) else SeatType.aisle
                seat = Seat(
                    bus_id=bus2.id,
                    seat_number=f"{row}{chr(64 + col)}",
                    seat_type=seat_type,
                    deck=DeckType.lower,
                    row_num=row,
                    col_num=col,
                )
                session.add(seat)

        # --- Seats for Bus 3 (sleeper: lower + upper) ---
        for deck in [DeckType.lower, DeckType.upper]:
            for row in range(1, 6):
                for col in range(1, 4):
                    seat_type = SeatType.window if col in (1, 3) else SeatType.middle
                    prefix = "L" if deck == DeckType.lower else "U"
                    seat = Seat(
                        bus_id=bus3.id,
                        seat_number=f"{prefix}{row}{chr(64 + col)}",
                        seat_type=seat_type,
                        deck=deck,
                        row_num=row,
                        col_num=col,
                    )
                    session.add(seat)

        # --- Routes ---
        route1 = Route(
            origin="Bangalore",
            destination="Chennai",
            distance_km=350,
            estimated_duration_minutes=360,
            stops=[
                {"name": "Hosur", "km_from_origin": 40, "duration_minutes": 40},
                {"name": "Krishnagiri", "km_from_origin": 90, "duration_minutes": 90},
                {"name": "Vellore", "km_from_origin": 200, "duration_minutes": 210},
            ],
        )

        route2 = Route(
            origin="Mumbai",
            destination="Pune",
            distance_km=150,
            estimated_duration_minutes=180,
            stops=[
                {"name": "Panvel", "km_from_origin": 30, "duration_minutes": 35},
                {"name": "Lonavala", "km_from_origin": 80, "duration_minutes": 100},
            ],
        )

        route3 = Route(
            origin="Delhi",
            destination="Jaipur",
            distance_km=280,
            estimated_duration_minutes=300,
            stops=[
                {"name": "Gurugram", "km_from_origin": 30, "duration_minutes": 30},
                {"name": "Manesar", "km_from_origin": 55, "duration_minutes": 55},
                {"name": "Neemrana", "km_from_origin": 120, "duration_minutes": 130},
            ],
        )

        route4 = Route(
            origin="Hyderabad",
            destination="Vijayawada",
            distance_km=275,
            estimated_duration_minutes=300,
            stops=[
                {"name": "Suryapet", "km_from_origin": 140, "duration_minutes": 150},
            ],
        )

        session.add_all([route1, route2, route3, route4])
        await session.commit()
        print("✅ Sample data seeded (3 buses, 4 routes, seats, conductor)")


async def run_seeds():
    await seed_admin()
    await seed_sample_data()


if __name__ == "__main__":
    asyncio.run(run_seeds())
