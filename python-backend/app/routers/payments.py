from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models
from app.auth import require_admin

router = APIRouter(prefix="/api/v1", tags=["payments"])


# Frontend se jo data aayega uska shape
class PaymentIn(BaseModel):
    fee_id: int | None = None      # kis fee item ka (custom me None)
    amount: float
    mode: str
    note: str | None = None


@router.post("/students/{student_id}/payments")
def make_payment(student_id: int, payload: PaymentIn, db: Session = Depends(get_db), admin = Depends(require_admin)):
    # student exist karta hai?
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student nahi mila")

    # payment record banao
    payment = models.Payment(
        student_id=student_id,
        fee_id=payload.fee_id,
        amount=payload.amount,
        mode=payload.mode,
        note=payload.note,
    )
    db.add(payment)

    # agar kisi fee item ka payment hai, to us fee ka status 'paid' karo
    if payload.fee_id:
        fee = db.query(models.Fee).filter(models.Fee.id == payload.fee_id).first()
        if fee:
            fee.status = "paid"

    db.commit()
    db.refresh(payment)

    return {
        "id": payment.id,
        "student_id": payment.student_id,
        "fee_id": payment.fee_id,
        "amount": float(payment.amount),
        "mode": payment.mode,
        "note": payment.note,
        "message": "Payment ho gaya",
    }
