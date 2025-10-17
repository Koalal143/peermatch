from dishka.integrations.fastapi import setup_dishka
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import router
from src.api.lifespan import lifespan
from src.core.config import settings
from src.core.di.container import container

app = FastAPI(
    title="PeerMatch",
    description="API for PeerMatch",
    version="1.0.0",
    root_path="/api",
    lifespan=lifespan,
    debug=settings.mode == "dev",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.server.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_dishka(container, app)
app.include_router(router)
