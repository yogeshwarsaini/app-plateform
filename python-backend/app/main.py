from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import items, health
import os

app = FastAPI(
    title="MyApp Backend",
    description="Python FastAPI backend deployed on AWS ECS",
    version="1.0.0"
)

# CORS — React frontend allow karo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production mein frontend URL daalo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(items.router, prefix="/api/v1")

@app.get("/")
def root():
    env = os.getenv("APP_ENV", "development")
    return {
        "message": "MyApp Backend is running!",
        "environment": env,
        "version": "1.0.0"
    }
