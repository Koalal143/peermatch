from typing import Any

from src.exceptions.user import (
    IncorrectCredentialsError,
    InvalidUserDataError,
    UserAccessDeniedError,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
    UserNotFoundError,
)
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

    async def update_user(
        self,
        user_id: int,
        current_user_id: int,
        *,
        is_admin: bool = False,
        username: str | None = None,
        email: str | None = None,
    ) -> UserRead:
        if user_id != current_user_id and not is_admin:
            msg = "You can only edit your own profile"
            raise UserAccessDeniedError(msg)

        user = await self.user_repository.get(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)

        if username is not None and username != user.username and await self.user_repository.get_by_username(username):
            msg = "Username already taken"
            raise UserNicknameAlreadyExistsError(msg)

        if email is not None and email != user.email and await self.user_repository.get_by_email(email):
            msg = "Email already registered"
            raise UserEmailAlreadyExistsError(msg)

        updated_user = await self.user_repository.update(user_id, username=username, email=email)
        if not updated_user:
            msg = "Failed to update user"
            raise InvalidUserDataError(msg)

        return UserRead.model_validate(updated_user)

    async def edit_user(
        self,
        user_id: int,
        current_user_id: int,
        *,
        is_admin: bool = False,
        **kwargs: Any,
    ) -> UserRead:
        if user_id != current_user_id and not is_admin:
            msg = "You can only edit your own profile"
            raise UserAccessDeniedError(msg)

        user = await self.user_repository.get(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)

        if (
            "username" in kwargs
            and kwargs["username"] is not None
            and kwargs["username"] != user.username
            and await self.user_repository.get_by_username(kwargs["username"])
        ):
            msg = "Username already taken"
            raise UserNicknameAlreadyExistsError(msg)

        if (
            "email" in kwargs
            and kwargs["email"] is not None
            and kwargs["email"] != user.email
            and await self.user_repository.get_by_email(kwargs["email"])
        ):
            msg = "Email already registered"
            raise UserEmailAlreadyExistsError(msg)

        updated_user = await self.user_repository.edit(user_id, **kwargs)
        if not updated_user:
            msg = "Failed to update user"
            raise InvalidUserDataError(msg)

        return UserRead.model_validate(updated_user)
