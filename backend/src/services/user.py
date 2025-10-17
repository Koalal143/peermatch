from src.exceptions.user import IncorrectCredentialsError, UserEmailAlreadyExistsError, UserNicknameAlreadyExistsError
from src.repositories.user import UserRepository
from src.schemas.user import UserRead
from src.services.security import SecurityService


class UserService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    async def create(self, username: str, email: str, hashed_password: str) -> UserRead:
        if await self.user_repository.get_by_username(username):
            msg = "Username already taken"
            raise UserNicknameAlreadyExistsError(msg)
        if await self.user_repository.get_by_email(email):
            msg = "Email already registered"
            raise UserEmailAlreadyExistsError(msg)

        user = await self.user_repository.create(username=username, email=email, hashed_password=hashed_password)
        return UserRead.model_validate(user)

    async def authenticate(self, email: str | None, username: str | None, password: str) -> UserRead:
        user = None
        if email:
            user = await self.user_repository.get_by_email(email)
        if not user and username:
            user = await self.user_repository.get_by_username(username)
        if not user or not SecurityService.verify_password(password, user.hashed_password):
            msg = "Incorrect email/username or password"
            raise IncorrectCredentialsError(msg)
        return UserRead.model_validate(user)
