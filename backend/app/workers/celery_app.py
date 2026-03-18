"""Celery worker configuration and background tasks."""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "busbook",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_default_queue="busbook",
)


@celery_app.task(name="send_booking_confirmation")
def send_booking_confirmation(booking_id: str, user_email: str):
    """Send booking confirmation email (placeholder)."""
    # TODO: Integrate with email service (SendGrid, SES, etc.)
    print(f"[EMAIL] Booking confirmation sent to {user_email} for {booking_id}")
    return {"status": "sent", "booking_id": booking_id}


@celery_app.task(name="send_trip_reminder")
def send_trip_reminder(trip_id: str):
    """Send trip reminders to passengers 1 hour before departure."""
    print(f"[EMAIL] Trip reminder sent for trip {trip_id}")
    return {"status": "sent", "trip_id": trip_id}


@celery_app.task(name="cleanup_expired_locks")
def cleanup_expired_locks():
    """Periodic task — Redis handles TTL natively, this is a safety net."""
    print("[CLEANUP] Checking for expired seat locks")
    return {"status": "done"}


# Periodic tasks schedule
celery_app.conf.beat_schedule = {
    "cleanup-expired-locks": {
        "task": "cleanup_expired_locks",
        "schedule": 300.0,  # every 5 minutes
    },
}
