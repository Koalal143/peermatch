from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, HTTPException, Path, Query, Response, status

from src.api.security import CurrentUserDependency
from src.db.uow import SQLAlchemyUnitOfWork
from src.enums.skill_type import SkillType
from src.exceptions.skill import SkillAccessDeniedError, SkillNotFoundError
from src.schemas.skills import SkillBulkDelete, SkillCreate, SkillRead, SkillUpdate
from src.services.skill import SkillService

router = APIRouter(route_class=DishkaRoute, prefix="/skills", tags=["Skills"])


@router.post(
    "",
    summary="Создание нового навыка",
    description="Добавление нового навыка для текущего пользователя. Навык может быть типа INCOMING (навык, который хочет получить) или OUTGOING (навык, которым готов научить)",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "Навык успешно создан",
            "model": SkillRead,
        },
        400: {
            "description": "Ошибка валидации данных",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "type": "string_too_short",
                                "loc": ["body", "name"],
                                "msg": "String should have at least 1 character",
                                "input": "",
                            }
                        ]
                    }
                }
            },
        },
        401: {
            "description": "Не аутентифицирован",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "invalid_refresh_token",
                        "message": "Could not validate credentials: no scheme or token in Authorization header",
                    }
                }
            },
        },
    },
)
async def create_skill(
    skill_in: SkillCreate,
    current_user: CurrentUserDependency,
    skill_service: FromDishka[SkillService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> SkillRead:
    async with uow:
        try:
            skill = await skill_service.create_skill(
                user_id=current_user.id,
                current_user_id=current_user.id,
                name=skill_in.name,
                skill_type=skill_in.type,
                description=skill_in.description,
            )
            await uow.commit()
            return skill
        except SkillAccessDeniedError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail={"error_key": e.error_key, "message": str(e)}
            ) from e


@router.get(
    "/users/{user_id}",
    summary="Получение списка навыков пользователя",
    description="Получение всех навыков пользователя с поддержкой фильтрации по типу (INCOMING/OUTGOING) и пагинации. Общее количество навыков возвращается в заголовке X-Total-Count",
    responses={
        200: {
            "description": "Список навыков пользователя",
            "model": list[SkillRead],
            "headers": {
                "X-Total-Count": {"description": "Общее количество навыков пользователя (без учета пагинации)"}
            },
        },
    },
)
async def get_user_skills(
    response: Response,
    user_id: Annotated[int, Path(gt=0)],
    skill_type: Annotated[SkillType | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
    skill_service: FromDishka[SkillService] = None,
    uow: FromDishka[SQLAlchemyUnitOfWork] = None,
) -> list[SkillRead]:
    async with uow:
        skills, total = await skill_service.get_user_skills(user_id, skill_type, limit, offset)
        response.headers["X-Total-Count"] = str(total)
        return skills


@router.get(
    "/{skill_id}",
    summary="Получение навыка по ID",
    description="Получение полной информации о навыке по его ID, включая информацию о пользователе",
    responses={
        200: {
            "description": "Информация о навыке",
            "model": SkillRead,
        },
        404: {
            "description": "Навык не найден",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "skill_not_found",
                        "message": "Skill not found",
                    }
                }
            },
        },
    },
)
async def get_skill_by_id(
    skill_id: Annotated[int, Path(gt=0)],
    skill_service: FromDishka[SkillService] = None,
) -> SkillRead:
    try:
        return await skill_service.get_skill_by_id(skill_id)
    except SkillNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail={"error_key": e.error_key, "message": str(e)}
        ) from e


@router.put(
    "/{skill_id}",
    summary="Обновление навыка",
    description="Редактирование названия и/или описания существующего навыка. Пользователь может редактировать только свои навыки",
    responses={
        200: {
            "description": "Навык успешно обновлен",
            "model": SkillRead,
        },
        400: {
            "description": "Ошибка валидации данных",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "type": "string_too_short",
                                "loc": ["body", "name"],
                                "msg": "String should have at least 1 character",
                                "input": "",
                            }
                        ]
                    }
                }
            },
        },
        401: {
            "description": "Не аутентифицирован",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "invalid_refresh_token",
                        "message": "Could not validate credentials: no scheme or token in Authorization header",
                    }
                }
            },
        },
        403: {
            "description": "Нет прав доступа - попытка редактировать чужой навык",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "skill_access_denied",
                        "message": "You can only edit your own skills",
                    }
                }
            },
        },
        404: {
            "description": "Навык не найден",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "skill_not_found",
                        "message": "Skill not found",
                    }
                }
            },
        },
    },
)
async def update_skill(
    skill_id: Annotated[int, Path(gt=0)],
    skill_update: SkillUpdate,
    current_user: CurrentUserDependency,
    skill_service: FromDishka[SkillService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> SkillRead:
    async with uow:
        try:
            skill = await skill_service.update_skill(skill_id, current_user.id, skill_update)
            await uow.commit()
            return skill
        except SkillNotFoundError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail={"error_key": e.error_key, "message": str(e)}
            ) from e
        except SkillAccessDeniedError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail={"error_key": e.error_key, "message": str(e)}
            ) from e


@router.delete(
    "/{skill_id}",
    summary="Удаление навыка",
    description="Удаление существующего навыка. Пользователь может удалять только свои навыки",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {
            "description": "Навык успешно удален",
        },
        401: {
            "description": "Не аутентифицирован",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "invalid_refresh_token",
                        "message": "Could not validate credentials: no scheme or token in Authorization header",
                    }
                }
            },
        },
        403: {
            "description": "Нет прав доступа - попытка удалить чужой навык",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "skill_access_denied",
                        "message": "You can only delete your own skills",
                    }
                }
            },
        },
        404: {
            "description": "Навык не найден",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "skill_not_found",
                        "message": "Skill not found",
                    }
                }
            },
        },
    },
)
async def delete_skill(
    skill_id: Annotated[int, Path(gt=0)],
    current_user: CurrentUserDependency,
    skill_service: FromDishka[SkillService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> Response:
    async with uow:
        try:
            await skill_service.delete_skill(skill_id, current_user.id)
            await uow.commit()
            return Response(status_code=status.HTTP_204_NO_CONTENT)
        except SkillNotFoundError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail={"error_key": e.error_key, "message": str(e)}
            ) from e
        except SkillAccessDeniedError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail={"error_key": e.error_key, "message": str(e)}
            ) from e


@router.post(
    "/bulk-delete",
    summary="Массовое удаление навыков",
    description="Удаление нескольких навыков одновременно. Пользователь может удалять только свои навыки. Если хотя бы один навык не принадлежит пользователю, операция будет отклонена",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {
            "description": "Навыки успешно удалены",
        },
        400: {
            "description": "Ошибка валидации данных",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "type": "list_type",
                                "loc": ["body", "skill_ids"],
                                "msg": "Input should be a valid list",
                                "input": "not_a_list",
                            }
                        ]
                    }
                }
            },
        },
        401: {
            "description": "Не аутентифицирован",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "invalid_refresh_token",
                        "message": "Could not validate credentials: no scheme or token in Authorization header",
                    }
                }
            },
        },
        403: {
            "description": "Нет прав доступа - попытка удалить чужие навыки",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "skill_access_denied",
                        "message": "You can only delete your own skills",
                    }
                }
            },
        },
        404: {
            "description": "Один или несколько навыков не найдены",
            "content": {
                "application/json": {
                    "example": {
                        "error_key": "skill_not_found",
                        "message": "Skill not found",
                    }
                }
            },
        },
    },
)
async def bulk_delete_skills(
    bulk_delete: SkillBulkDelete,
    current_user: CurrentUserDependency,
    skill_service: FromDishka[SkillService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> Response:
    async with uow:
        try:
            await skill_service.bulk_delete_skills(bulk_delete.skill_ids, current_user.id)
            await uow.commit()
            return Response(status_code=status.HTTP_204_NO_CONTENT)
        except SkillNotFoundError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail={"error_key": e.error_key, "message": str(e)}
            ) from e
        except SkillAccessDeniedError as e:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail={"error_key": e.error_key, "message": str(e)}
            ) from e


@router.get("/vector-search")
async def get_skills_by_vector_search(
    response: Response,
    query: Annotated[str, Query()],
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
    skill_type: Annotated[SkillType | None, Query()] = None,
    skill_service: FromDishka[SkillService] = None,
) -> list[SkillRead]:
    result, total = await skill_service.search_skills_by_query(query, skill_type=skill_type, limit=limit, offset=offset)
    response.headers["X-Total-Count"] = str(total)
    return result


@router.get(
    "",
    summary="Получение всех навыков",
    description="Получение всех навыков в системе с поддержкой фильтрации по типу (INCOMING/OUTGOING) и пагинации. Общее количество навыков возвращается в заголовке X-Total-Count",
    responses={
        200: {
            "description": "Список всех навыков",
            "model": list[SkillRead],
            "headers": {"X-Total-Count": {"description": "Общее количество навыков (без учета пагинации)"}},
        },
    },
)
async def get_all_skills(
    response: Response,
    skill_type: Annotated[SkillType | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
    skill_service: FromDishka[SkillService] = None,
    uow: FromDishka[SQLAlchemyUnitOfWork] = None,
) -> list[SkillRead]:
    async with uow:
        skills, total = await skill_service.get_all_skills(skill_type, limit, offset)
        response.headers["X-Total-Count"] = str(total)
        return skills
