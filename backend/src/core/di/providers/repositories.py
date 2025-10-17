from dishka import Provider, Scope, provide
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.refresh_token import RefreshTokenRepository
from src.repositories.skill import SkillRepository
from src.repositories.user import UserRepository


class RepositoriesProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_user_repository(self, session: AsyncSession) -> UserRepository:
        return UserRepository(session)

    @provide(scope=Scope.REQUEST)
    def get_skill_repository(self, session: AsyncSession) -> SkillRepository:
        return SkillRepository(session)

    @provide(scope=Scope.REQUEST)
    def get_refresh_token_repository(
        self, session: AsyncSession, redis: Redis
    ) -> RefreshTokenRepository:
        return RefreshTokenRepository(session, redis)


