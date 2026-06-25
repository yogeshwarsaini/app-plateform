from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import students, health
import os

app = FastAPI(title="Fees Portal Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(students.router)

@app.get("/")
def root():
    return {"message": "Fees Portal Backend is running!"}
