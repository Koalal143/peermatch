from dishka import make_async_container
from dishka.integrations.fastapi import FastapiProvider

from src.core.di.providers import (
    ConfigProvider,
    DatabaseProvider,
    GigaChatEmbeddingsProvider,
    QdrantProvider,
    RedisProvider,
    RepositoriesProvider,
    ServicesProvider,
)

container = make_async_container(
    ConfigProvider(),
    DatabaseProvider(),
    GigaChatEmbeddingsProvider(),
    QdrantProvider(),
    RedisProvider(),
    RepositoriesProvider(),
    ServicesProvider(),
    FastapiProvider(),
)
