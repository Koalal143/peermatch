from fastapi import APIRouter

from src.api.v1 import auth, chats, skills, users

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(skills.router)
router.include_router(chats.router)
router.include_router(chats.ws_router)
