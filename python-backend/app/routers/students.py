from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/v1/students", tags=["students"])


@router.get("")
def list_students(q: str = "", db: Session = Depends(get_db)):
    query = db.query(models.Student)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (models.Student.name.ilike(like))
            | (models.Student.father_name.ilike(like))
            | (models.Student.cls.ilike(like))
        )
    students = query.all()
    return [
        {
            "id": s.id,
            "admission_no": s.admission_no,
            "name": s.name,
            "father_name": s.father_name,
            "cls": s.cls,
            "roll_no": s.roll_no,
            "phone": s.phone,
        }
        for s in students
    ]


@router.get("/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db)):
    s = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student nahi mila")
    fees = db.query(models.Fee).filter(models.Fee.student_id == student_id).all()
    return {
        "id": s.id,
        "name": s.name,
        "father_name": s.father_name,
        "cls": s.cls,
        "roll_no": s.roll_no,
        "fees": [
            {"id": f.id, "type": f.fee_type, "label": f.label,
             "amount": float(f.amount), "status": f.status}
            for f in fees
        ],
    }
