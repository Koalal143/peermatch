from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Body, HTTPException, status

from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.auth import InvalidTokenError
from src.exceptions.user import (
    IncorrectCredentialsError,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
)
from src.schemas.token import Token
from src.schemas.user import UserCreate, UserLogin, UserRead
from src.services.security import SecurityService
from src.services.token import RefreshTokenService, TokenService
from src.services.user import UserService

router = APIRouter(route_class=DishkaRoute, prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    summary="Регистрация нового пользователя",
    description="Создание нового аккаунта с указанием имени пользователя, email и пароля",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "Пользователь успешно зарегистрирован",
            "model": UserRead,
        },
        400: {
            "description": "Ошибка валидации данных",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "type": "string_too_short",
                                "loc": ["body", "username"],
                                "msg": "String should have at least 3 characters",
                                "input": "ab",
                            }
                        ]
                    }
                }
            },
        },
        409: {
            "description": "Конфликт: пользователь с таким именем или email уже существует",
            "content": {
                "application/json": {
                    "examples": {
                        "username_exists": {
                            "value": {
                                "error_key": "user_nickname_already_exists",
                                "message": "Username already taken",
                            }
                        },
                        "email_exists": {
                            "value": {
                                "error_key": "user_email_already_exists",
                                "message": "Email already registered",
                            }
                        },
                    }
                }
            },
        },
    },
)
async def register(
    user_in: UserCreate,
    user_service: FromDishka[UserService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> UserRead:
    async with uow:
        try:
            user = await user_service.create(
                username=user_in.username,
                email=user_in.email,
                hashed_password=SecurityService.get_password_hash(user_in.password),
            )
            await uow.commit()
            return user
        except UserNicknameAlreadyExistsError as e:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error_key": e.error_key,
                    "message": e.message,
                },
            ) from e
        except UserEmailAlreadyExistsError as e:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error_key": e.error_key,
                    "message": e.message,
                },
            ) from e
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error_key": "internal_server_error",
                    "message": "An unexpected error occurred",
                },
            ) from e


@router.post(
    "/login",
    summary="Вход пользователя",
    description="Аутентификация пользователя с использованием email или имени пользователя и пароля",
    responses={
        200: {
            "description": "Успешная аутентификация, возвращены токены доступа",
            "model": Token,
        },
        400: {
            "description": "Ошибка валидации данных",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "type": "value_error",
                                "loc": ["body", "email"],
                                "msg": "value is not a valid email address",
                                "input": "invalid-email",
                            }
                        ]
                    }
                }
            },
        },
        401: {
            "description": "Неверные учётные данные (email/имя пользователя или пароль)",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "incorrect_email_username_or_password",
                        "message": "Incorrect email/username or password",
                    }
                }
            },
        },
    },
)
async def login(
    user_in: UserLogin,
    user_service: FromDishka[UserService],
    token_service: FromDishka[TokenService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> Token:
    async with uow:
        try:
            user = await user_service.authenticate(
                email=user_in.email,
                username=user_in.username,
                password=user_in.password,
            )
            tokens = await token_service.create_tokens(int(user.id))
            await uow.commit()
            return tokens
        except IncorrectCredentialsError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error_key": e.error_key,
                    "message": e.message,
                },
            ) from e
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error_key": "internal_server_error",
                    "message": "An unexpected error occurred",
                },
            ) from e


@router.post(
    "/refresh",
    summary="Обновление токена доступа",
    description="Получение нового токена доступа с использованием refresh токена",
    responses={
        200: {
            "description": "Токены успешно обновлены",
            "model": Token,
        },
        400: {
            "description": "Ошибка валидации данных",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "type": "string_type",
                                "loc": ["body", "refresh_token"],
                                "msg": "Input should be a valid string",
                                "input": 123,
                            }
                        ]
                    }
                }
            },
        },
        401: {
            "description": "Невалидный или истёкший refresh токен",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "invalid_refresh_token",
                        "message": "Invalid refresh token",
                    }
                }
            },
        },
    },
)
async def refresh_token(
    refresh_token: Annotated[str, Body(embed=True)],
    refresh_token_service: FromDishka[RefreshTokenService],
    token_service: FromDishka[TokenService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> Token:
    async with uow:
        try:
            result = await refresh_token_service.generate_new_refresh_token(refresh_token, token_service)
            await uow.commit()
            return result
        except InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error_key": e.error_key,
                    "message": e.message,
                },
            ) from e
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error_key": "internal_server_error",
                    "message": "An unexpected error occurred",
                },
            ) from e
