from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from pydantic import BaseModel
from app.auth import require_admin


router = APIRouter(prefix="/api/v1/students", tags=["students"])


@router.get("")
def list_students(q: str = "", db: Session = Depends(get_db), admin = Depends(require_admin)):
    query = db.query(models.Student)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (models.Student.name.ilike(like))
            | (models.Student.father_name.ilike(like))
            | (models.Student.cls.ilike(like))
        )
    students = query.all()
    result = []
    for s in students:
        fees = db.query(models.Fee).filter(models.Fee.student_id == s.id).all()
        total = sum(float(f.amount) for f in fees)
        paid = sum(float(f.amount) for f in fees if f.status == "paid")
        result.append({
            "id": s.id,
            "admission_no": s.admission_no,
            "name": s.name,
            "father_name": s.father_name,
            "cls": s.cls,
            "roll_no": s.roll_no,
            "phone": s.phone,
            "total_fees": total,
            "paid_fees": paid,
            "pending_fees": max(total - paid, 0),
        })
    return result
    


# @ s = db.query(models.Student).filter(models.Student.id == student_id).first()
#     if not s:
#         raise HTTPException(status_code=404, detail="Student nahi mila")
#     fees = db.query(models.Fee).filter(models.Fee.student_id == student_id).all()
#     return {
#         "id": s.id,
#         "name": s.name,
#         "father_name": s.father_name,
#         "cls": s.cls,
#         "roll_no": s.roll_no,
#         "fees": [
#             {"id": f.id, "type": f.fee_type, "label": f.label,
#              "amount": float(f.amount), "status": f.status}
#             for f in fees
#         ],
#     }
# router.get("/{student_id}")
# def get_student(student_id: int, db: Session = Depends(get_db)):
   
@router.get("/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db), admin = Depends(require_admin)):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student nahi mila")

    fees = db.query(models.Fee).filter(models.Fee.student_id == student_id).all()

    # custom payments (jinka fee_id NULL hai)
    custom_payments = db.query(models.Payment).filter(
        models.Payment.student_id == student_id,
        models.Payment.fee_id == None
    ).all()

    # summary calculate
    total = sum(float(f.amount) for f in fees)
    paid_fees = sum(float(f.amount) for f in fees if f.status == "paid")
    custom_paid = sum(float(p.amount) for p in custom_payments)
    jama = paid_fees

    return {
        "id": s.id,
        "name": s.name,
        "father_name": s.father_name,
        "cls": s.cls,
        "roll_no": s.roll_no,
        "phone": s.phone,
        "total_fees": total,
        "paid": jama,
        "pending": max(total - jama, 0),
        "custom_total": custom_paid,
        "fees": [
            {"id": f.id, "type": f.fee_type, "label": f.label,
             "amount": float(f.amount), "status": f.status}
            for f in fees
        ],
        "custom": [
            {"id": p.id, "amount": float(p.amount), "note": p.note,
             "mode": p.mode, "date": str(p.paid_on)[:10]}
            for p in custom_payments
        ],
    }

# from pydantic import BaseModel

SESSION_MONTHS = ["April","May","June","July","August","September",
                  "October","November","December","January","February","March"]

EXAM_FEES = [
    {"label": "Quarterly exam", "amount": 800},
    {"label": "Half-yearly exam", "amount": 900},
    {"label": "Annual exam", "amount": 1000},
]


class StudentIn(BaseModel):
    admission_no: str
    name: str
    father_name: str | None = None
    cls: str
    roll_no: str | None = None
    phone: str | None = None
    monthly_fee: float = 1500     # is student ki monthly fee


@router.post("")
def add_student(payload: StudentIn, db: Session = Depends(get_db), admin = Depends(require_admin)):
    # admission_no duplicate to nahi?
    exists = db.query(models.Student).filter(
        models.Student.admission_no == payload.admission_no).first()
    if exists:
        raise HTTPException(status_code=400, detail="Ye admission number already hai")

    # student banao
    student = models.Student(
        admission_no=payload.admission_no,
        name=payload.name,
        father_name=payload.father_name,
        cls=payload.cls,
        roll_no=payload.roll_no,
        phone=payload.phone,
    )
    db.add(student)
    db.flush()   # student.id mil jaye

    # 12 month ki fees auto banao
    for month in SESSION_MONTHS:
        db.add(models.Fee(
            student_id=student.id, fee_type="monthly",
            label=month, amount=payload.monthly_fee, status="pending"
        ))

    # 3 exam ki fees auto banao
    for ex in EXAM_FEES:
        db.add(models.Fee(
            student_id=student.id, fee_type="exam",
            label=ex["label"], amount=ex["amount"], status="pending"
        ))

    db.commit()
    db.refresh(student)
    return {"id": student.id, "name": student.name, "message": "Student add ho gaya, fees bhi ban gayi"}