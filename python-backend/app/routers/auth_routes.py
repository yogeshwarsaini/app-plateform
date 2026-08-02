from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app import models
from app.auth import hash_password, verify_password, create_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class RegisterIn(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    password: str
    role: str = "parent"           # 'admin' ya 'parent'
    student_id: int | None = None  # parent kis student se juda


class LoginIn(BaseModel):
    username: str   # email ya phone
    password: str


@router.post("/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    # email/phone already hai?
    if payload.email:
        exists = db.query(models.User).filter(models.User.email == payload.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Ye email already registered hai")

    user = models.User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
        student_id=payload.student_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "role": user.role, "message": "User ban gaya"}


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    # email ya phone se user dhoondh
    user = db.query(models.User).filter(
        (models.User.email == payload.username) | (models.User.phone == payload.username)
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Galat email/phone ya password")

    # token banao
    token = create_token({"user_id": user.id, "role": user.role})

    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role,
            "student_id": user.student_id,
        },
    }

from app.auth import get_current_user


@router.get("/me/student")
def my_student(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # sirf parent ke liye, aur uske apne bachche ki info
    if user.role != "parent" or not user.student_id:
        raise HTTPException(status_code=403, detail="Ye sirf parent ke liye hai")

    s = db.query(models.Student).filter(models.Student.id == user.student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student nahi mila")

    fees = db.query(models.Fee).filter(models.Fee.student_id == s.id).all()
    custom = db.query(models.Payment).filter(
        models.Payment.student_id == s.id,
        models.Payment.fee_id == None
    ).all()

    total = sum(float(f.amount) for f in fees)
    paid = sum(float(f.amount) for f in fees if f.status == "paid")

    return {
        "id": s.id,
        "name": s.name,
        "father_name": s.father_name,
        "cls": s.cls,
        "roll_no": s.roll_no,
        "total_fees": total,
        "paid": paid,
        "pending": max(total - paid, 0),
        "fees": [
            {"id": f.id, "type": f.fee_type, "label": f.label,
             "amount": float(f.amount), "status": f.status}
            for f in fees
        ],
        "custom": [
            {"id": p.id, "amount": float(p.amount), "note": p.note,
             "mode": p.mode, "date": str(p.paid_on)[:10]}
            for p in custom
        ],
    }

class ParentSignupIn(BaseModel):
    name: str
    email: str | None = None
    phone: str
    password: str
    admission_no: str   # student verify karne ke liye


@router.post("/signup")
def parent_signup(payload: ParentSignupIn, db: Session = Depends(get_db)):
    # student exist karta hai admission_no se?
    student = db.query(models.Student).filter(
        models.Student.admission_no == payload.admission_no
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Ye admission number nahi mila. Check karo.")

    # phone already registered to nahi?
    if db.query(models.User).filter(models.User.phone == payload.phone).first():
        raise HTTPException(status_code=400, detail="Ye phone se pehle se account hai. Login karo.")

    # email diya hai to wo bhi check
    if payload.email:
        if db.query(models.User).filter(models.User.email == payload.email).first():
            raise HTTPException(status_code=400, detail="Ye email already registered hai")

    user = models.User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role="parent",
        student_id=student.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"user_id": user.id, "role": user.role})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "role": user.role, "student_id": user.student_id},
        "message": f"Account ban gaya! Aap {student.name} ke parent ke roop me register ho gaye.",
    }