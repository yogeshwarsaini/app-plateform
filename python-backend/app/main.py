from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import students, health, payments, auth_routes
import os

app = FastAPI(title="Fees Portal Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://app-plateform.*\vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(payments.router)
app.include_router(health.router)
app.include_router(students.router)

@app.get("/")
def root():
    return {"message": "Fees Portal Backend is running!"}
