from typing import Any

from qdrant_client.async_qdrant_client import AsyncQdrantClient
from qdrant_client.conversions import common_types as qdrant_types
from qdrant_client.http import models


class VectorSearchRepository:
    def __init__(self, client: AsyncQdrantClient) -> None:
        self._client = client
        self.collection_name = "skills"

    async def create_collection(self) -> None:
        if not await self._client.collection_exists(self.collection_name):
            await self._client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
            )

    async def add_skill(self, skill_id: int, embedding: list[float], payload: dict[str, Any] | None = None) -> None:
        await self._client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=skill_id,
                    vector=embedding,
                    payload=payload,
                )
            ],
        )

    async def delete_skill(self, skill_id: int) -> None:
        await self._client.delete(collection_name=self.collection_name, points_selector=[skill_id])

    async def search(self, query_vector: list[float], limit: int = 10, offset: int = 0) -> qdrant_types.QueryResponse:
        return await self._client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=limit,
            offset=offset,
        )
