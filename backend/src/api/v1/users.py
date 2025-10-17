from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, HTTPException, Path, status

from src.api.security import CurrentUserDependency
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.user import (
    InvalidUserDataError,
    UserAccessDeniedError,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
    UserNotFoundError,
)
from src.schemas.user import UserPatch, UserRead, UserUpdate
from src.services.user import UserService

router = APIRouter(route_class=DishkaRoute, prefix="/users", tags=["Users"])


@router.put(
    "/{user_id}",
    summary="Полное обновление пользователя",
    description="Полное обновление данных пользователя (PUT). Требует указания всех обязательных полей.",
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Пользователь успешно обновлен",
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
        403: {
            "description": "Доступ запрещен: пользователь может редактировать только свой профиль",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "user_access_denied",
                        "message": "You can only edit your own profile",
                    }
                }
            },
        },
        404: {
            "description": "Пользователь не найден",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "user_not_found",
                        "message": "User not found",
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
async def update_user(
    user_id: Annotated[int, Path(gt=0)],
    user_in: UserUpdate,
    current_user: CurrentUserDependency,
    user_service: FromDishka[UserService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> UserRead:
    async with uow:
        try:
            user = await user_service.update_user(
                user_id=user_id,
                current_user_id=int(current_user.id),
                is_admin=False,
                username=user_in.username,
                email=user_in.email,
            )
            await uow.commit()
            return user
        except UserNotFoundError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error_key": e.error_key,
                    "message": e.message,
                },
            ) from e
        except UserAccessDeniedError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error_key": e.error_key,
                    "message": e.message,
                },
            ) from e
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
        except InvalidUserDataError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
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


@router.patch(
    "/{user_id}",
    summary="Частичное обновление пользователя",
    description="Частичное обновление данных пользователя (PATCH). Можно обновить отдельные поля.",
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Пользователь успешно обновлен",
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
        403: {
            "description": "Доступ запрещен: пользователь может редактировать только свой профиль",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "user_access_denied",
                        "message": "You can only edit your own profile",
                    }
                }
            },
        },
        404: {
            "description": "Пользователь не найден",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "user_not_found",
                        "message": "User not found",
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
async def edit_user(
    user_id: Annotated[int, Path(gt=0)],
    user_in: UserPatch,
    current_user: CurrentUserDependency,
    user_service: FromDishka[UserService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> UserRead:
    async with uow:
        try:
            user = await user_service.edit_user(
                user_id=user_id,
                current_user_id=int(current_user.id),
                is_admin=False,
                username=user_in.username,
                email=user_in.email,
            )
            await uow.commit()
            return user
        except UserNotFoundError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error_key": e.error_key,
                    "message": e.message,
                },
            ) from e
        except UserAccessDeniedError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error_key": e.error_key,
                    "message": e.message,
                },
            ) from e
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
        except InvalidUserDataError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
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

