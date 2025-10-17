from dishka import Provider, Scope, provide
from langchain_gigachat.embeddings import GigaChatEmbeddings
from qdrant_client.async_qdrant_client import AsyncQdrantClient
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.embeddings import EmbeddingsRepository
from src.repositories.refresh_token import RefreshTokenRepository
from src.repositories.skill import SkillRepository
from src.repositories.user import UserRepository
from src.repositories.vector_search import VectorSearchRepository


class RepositoriesProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_user_repository(self, session: AsyncSession) -> UserRepository:
        return UserRepository(session)

    @provide(scope=Scope.REQUEST)
    def get_skill_repository(self, session: AsyncSession) -> SkillRepository:
        return SkillRepository(session)

    @provide(scope=Scope.REQUEST)
    def get_refresh_token_repository(self, session: AsyncSession, redis: Redis) -> RefreshTokenRepository:
        return RefreshTokenRepository(session, redis)

    @provide(scope=Scope.APP)
    def get_embeddings_repository(self, embeddings: GigaChatEmbeddings) -> EmbeddingsRepository:
        return EmbeddingsRepository(embeddings)

    @provide(scope=Scope.APP)
    def get_vector_search_repository(self, client: AsyncQdrantClient) -> VectorSearchRepository:
        return VectorSearchRepository(client)
