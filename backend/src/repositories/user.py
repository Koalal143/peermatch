from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, user_id: int) -> User | None:
        return await self.session.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return await self.session.scalar(stmt)

    async def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return await self.session.scalar(stmt)

    async def create(self, username: str, email: str, hashed_password: str) -> User:
        user = User(username=username, email=email, hashed_password=hashed_password)
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def list(self, limit: int = 100, offset: int = 0) -> Sequence[User]:
        stmt = select(User).limit(limit).offset(offset)
        result = await self.session.scalars(stmt)
        return result.all()

    async def update(self, user_id: int, username: str | None = None, email: str | None = None) -> User | None:
        user = await self.get(user_id)
        if not user:
            return None
        if username is not None:
            user.username = username
        if email is not None:
            user.email = email
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def edit(self, user_id: int, **kwargs) -> User | None:
        user = await self.get(user_id)
        if not user:
            return None
        for key, value in kwargs.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        await self.session.flush()
        await self.session.refresh(user)
        return user
