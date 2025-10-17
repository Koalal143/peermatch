from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PATH = Path(__file__).parent.parent.parent


class PostgresConfig(BaseModel):
    user: str
    password: str
    host: str
    port: int
    db: str
    echo: bool = False
    naming_convention: dict = {
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }

    @property
    def url(self) -> str:
        return f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.db}"


class JWTConfig(BaseModel):
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7


class RedisConfig(BaseModel):
    host: str
    port: int


class ServerConfig(BaseModel):
    url: str
    host: str
    port: int
    allowed_origins: list[str]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=False,
        env_nested_delimiter="__",
        env_file=PATH.parent / ".env",
        extra="ignore",
    )

    server: ServerConfig
    postgres: PostgresConfig
    jwt: JWTConfig
    redis: RedisConfig
    mode: Literal["dev", "test", "prod"] = Field(
        default="prod", description="Application mode"
    )


settings = Settings()
