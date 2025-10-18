from typing import Annotated

from dishka.integrations.fastapi import FromDishka, inject
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.exceptions.auth import (
    InactiveOrNotExistingUserError,
    InvalidJWTError,
    InvalidTokenError,
    JWTSignatureExpiredError,
)
from src.models.user import User
from src.services.token import TokenService

bearer_scheme = HTTPBearer(auto_error=False)


async def _get_current_user(
    token_service: TokenService,
    credentials: HTTPAuthorizationCredentials | None,
) -> User:
    try:
        return await token_service.get_current_user(
            token=credentials.credentials if credentials else None,
        )
    except (InvalidTokenError, InactiveOrNotExistingUserError, InvalidJWTError, JWTSignatureExpiredError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_key": e.error_key,
                "message": e.message,
            },
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


@inject
async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    token_service: FromDishka[TokenService],
) -> User:
    return await _get_current_user(token_service, credentials)


@inject
async def get_current_user_or_none(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    token_service: FromDishka[TokenService],
) -> User | None:
    if not credentials:
        return None
    return await _get_current_user(token_service, credentials)


CurrentUserDependency = Annotated[User, Depends(get_current_user)]
CurrentUserOrNoneDependency = Annotated[User | None, Depends(get_current_user_or_none)]
