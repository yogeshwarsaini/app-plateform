import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Connection string environment se aayega (GitHub secret me daalenge)
DATABASE_URL = os.getenv("DATABASE_URL")

# Engine — database se actual connection
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # connection zinda hai check karta (Aiven sleep se uthane ko)
    pool_recycle=300,
)

# Session — har request ke liye DB baat-cheet
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base — models (tables) isse banenge
Base = declarative_base()

# Helper — har API request me DB session dega
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
