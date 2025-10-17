from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from redis.asyncio import Redis

from src.db.manager import DatabaseManager
from src.repositories.vector_search import VectorSearchRepository


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    async with app.state.dishka_container() as request_container:
        redis_client: Redis = await request_container.get(Redis)
        await redis_client.ping()

        vector_search_repository: VectorSearchRepository = await request_container.get(VectorSearchRepository)
        await vector_search_repository.create_collection()

    yield

    async with app.state.dishka_container() as request_container:
        db_manager: DatabaseManager = await request_container.get(DatabaseManager)
        await db_manager.dispose()

    await app.state.dishka_container.close()
