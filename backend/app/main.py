import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routers import course, leaderboard, lessons, users
from app.seed import seed_database

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_database(db)

app = FastAPI(title="Duolingo Clone API", version="1.0.0")

_extra_origins = os.getenv("CORS_ORIGINS", "")
_cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    *[o.strip() for o in _extra_origins.split(",") if o.strip()],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(course.router)
app.include_router(lessons.router)
app.include_router(leaderboard.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
