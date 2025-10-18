from typing import Any

from qdrant_client.async_qdrant_client import AsyncQdrantClient
from qdrant_client.conversions import common_types as qdrant_types
from qdrant_client.http import models

from src.enums.skill_type import SkillType


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

    async def delete_skills(self, skill_ids: list[int]) -> None:
        await self._client.delete(collection_name=self.collection_name, points_selector=skill_ids)

    async def search(
        self, query_vector: list[float], skilltype: SkillType | None = None, limit: int = 10, offset: int = 0
    ) -> tuple[qdrant_types.QueryResponse, int]:
        if skilltype:
            query_filter = models.Filter(
                must=[
                    models.FieldCondition(
                        key="type",
                        match=models.MatchValue(value=skilltype.value),
                    )
                ]
            )
        else:
            query_filter = None
        result_best_score = await self._client.query_points(
            collection_name=self.collection_name, query=query_vector, query_filter=query_filter, limit=1
        )
        if not result_best_score:
            return None, 0
        threshold = result_best_score.points[0].score * 0.5
        total = await self._client.count(collection_name=self.collection_name, count_filter=query_filter)
        return await self._client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=limit,
            offset=offset,
            query_filter=query_filter,
            score_threshold=threshold,
        ), total
