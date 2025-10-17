
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.utils.examples_factory import json_example_factory


app = FastAPI(
    title=settings.project_name,
    description="API for PeerMatch",
    version="1.0.0",
    root_path="/api",
    debug=settings.mode == "dev",
    responses={
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "content": json_example_factory(
                {
                    "detail": [
                        {"loc": ["string", 0], "msg": "string", "type": "string"}
                    ],
                    "error_key": "validation_error",
                    "body": {"string": "string"},
                },
            )
        }
    },
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.server.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
