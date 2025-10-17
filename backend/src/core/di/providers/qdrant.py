from dishka import Provider, Scope, provide
from qdrant_client.async_qdrant_client import AsyncQdrantClient

from src.core.config import Settings


class QdrantProvider(Provider):
    scope = Scope.APP

    @provide
    def get_qdrant(self, settings: Settings) -> AsyncQdrantClient:
        return AsyncQdrantClient(host=settings.qdrant.host, port=settings.qdrant.port)
