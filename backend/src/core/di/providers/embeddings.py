from dishka import Provider, Scope, provide
from langchain_gigachat.embeddings import GigaChatEmbeddings

from src.core.config import Settings


class GigaChatEmbeddingsProvider(Provider):
    scope = Scope.APP

    @provide
    def get_gigachat_embeddings(self, settings: Settings) -> GigaChatEmbeddings:
        return GigaChatEmbeddings(
            access_token=settings.gigachat_embeddings.api_key.get_secret_value(), verify_ssl_certs=False,
        )
