from dishka import Provider, Scope, provide
from qdrant_client import QdrantClient

from src.core.config import Settings


class QdrantProvider(Provider):
    scope = Scope.APP

    @provide
    def get_qdrant(self, settings: Settings) -> QdrantClient:
        return QdrantClient(host=settings.qdrant.host, port=settings.qdrant.port)
