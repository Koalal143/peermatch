from fastapi import APIRouter

from src.api.v1 import auth, skills, users

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(skills.router)
