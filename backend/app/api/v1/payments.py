"""Razorpay payment API endpoints."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.core.redis import confirm_seat_booking
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.schemas.schemas import (
    PaymentCreateRequest,
    PaymentOrderResponse,
    PaymentVerifyRequest,
    PaymentResponse,
)

router = APIRouter(prefix="/payments", tags=["Payments"])


def get_razorpay_client():
    """Get Razorpay client instance."""
    import razorpay
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@router.post("/create-order", response_model=PaymentOrderResponse)
async def create_payment_order(
    data: PaymentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Razorpay payment order for a booking."""
    # Get booking
    result = await db.execute(
        select(Booking).where(
            Booking.id == data.booking_id,
            Booking.user_id == current_user.id,
            Booking.status == BookingStatus.pending,
        )
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Pending booking not found")

    # Create Razorpay order
    amount_paise = int(booking.total_amount * 100)

    try:
        client = get_razorpay_client()
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": str(booking.id),
            "notes": {
                "booking_id": str(booking.id),
                "user_id": str(current_user.id),
            },
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment gateway error: {str(e)}")

    # Save payment record
    payment = Payment(
        booking_id=booking.id,
        razorpay_order_id=order["id"],
        amount=booking.total_amount,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    await db.flush()

    return PaymentOrderResponse(
        order_id=order["id"],
        amount=amount_paise,
        currency="INR",
        booking_id=booking.id,
        key_id=settings.RAZORPAY_KEY_ID,
    )


@router.post("/verify", response_model=PaymentResponse)
async def verify_payment(
    data: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify Razorpay payment signature and confirm booking."""
    # Verify signature
    try:
        client = get_razorpay_client()
        client.utility.verify_payment_signature({
            "razorpay_order_id": data.razorpay_order_id,
            "razorpay_payment_id": data.razorpay_payment_id,
            "razorpay_signature": data.razorpay_signature,
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Update payment record
    result = await db.execute(
        select(Payment).where(Payment.razorpay_order_id == data.razorpay_order_id)
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    payment.razorpay_payment_id = data.razorpay_payment_id
    payment.razorpay_signature = data.razorpay_signature
    payment.status = PaymentStatus.success

    # Confirm booking
    booking_result = await db.execute(
        select(Booking).where(Booking.id == payment.booking_id)
    )
    booking = booking_result.scalar_one_or_none()
    if booking:
        booking.status = BookingStatus.confirmed
        # Release seat locks
        for seat_id in booking.seat_ids:
            await confirm_seat_booking(str(booking.trip_id), seat_id)

    await db.flush()
    await db.refresh(payment)

    return PaymentResponse.model_validate(payment)
