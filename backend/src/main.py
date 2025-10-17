from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings


app = FastAPI(
    title="PeerMatch",
    description="API for PeerMatch",
    version="1.0.0",
    root_path="/api",
    debug=settings.mode == "dev",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.server.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
