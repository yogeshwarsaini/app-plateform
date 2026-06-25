from sqlalchemy import Column, Integer, String, DECIMAL, Date, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    admission_no = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    father_name = Column(String(100))
    mother_name = Column(String(100))
    cls = Column("class", String(20), nullable=False)   # 'class' python keyword hai, isliye cls
    roll_no = Column(String(20))
    gender = Column(String(10))
    dob = Column(Date)
    phone = Column(String(20))
    address = Column(String(255))
    created_at = Column(TIMESTAMP, server_default=func.now())


class Fee(Base):
    __tablename__ = "fees"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    fee_type = Column(String(20), nullable=False)
    label = Column(String(50), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    fee_id = Column(Integer, ForeignKey("fees.id", ondelete="SET NULL"))
    amount = Column(DECIMAL(10, 2), nullable=False)
    mode = Column(String(20), nullable=False)
    note = Column(String(255))
    paid_on = Column(TIMESTAMP, server_default=func.now())


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True)
    phone = Column(String(20), unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="parent")
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"))
    created_at = Column(TIMESTAMP, server_default=func.now())
