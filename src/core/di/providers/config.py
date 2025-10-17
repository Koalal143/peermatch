from dishka import Provider, Scope, provide

from src.core.config import (
    ElasticSearchConfig,
    JWTConfig,
    PostgresConfig,
    RedisConfig,
    S3Config,
    Settings,
    settings,
)


class ConfigProvider(Provider):
    scope = Scope.APP

    @provide
    def get_settings(self) -> Settings:
        return settings
