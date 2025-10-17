from dishka import Provider, Scope, provide

from src.repositories.refresh_token import RefreshTokenRepository
from src.repositories.user import UserRepository
from src.services.token import RefreshTokenService, TokenService
from src.services.user import UserService


class ServicesProvider(Provider):
    @provide(scope=Scope.REQUEST)
    def get_user_service(self, user_repo: UserRepository) -> UserService:
        return UserService(user_repo)

    @provide(scope=Scope.REQUEST)
    def get_token_service(
        self,
        refresh_repo: RefreshTokenRepository,
        user_repo: UserRepository,
    ) -> TokenService:
        return TokenService(refresh_repo, user_repo)

    @provide(scope=Scope.REQUEST)
    def get_refresh_token_service(self, refresh_repo: RefreshTokenRepository) -> RefreshTokenService:
        return RefreshTokenService(refresh_repo)


