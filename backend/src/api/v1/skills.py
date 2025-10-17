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
    status_code=status.HTTP_201_CREATED,
    response_model=SkillRead,
    responses={
        400: {"description": "Невалидные данные"},
        401: {"description": "Не аутентифицирован"},
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
    response_model=list[SkillRead],
    responses={
        200: {
            "description": "Список навыков пользователя",
            "headers": {"X-Total-Count": {"description": "Общее количество навыков"}},
        },
    },
)
async def get_user_skills(
    user_id: Annotated[int, Path(gt=0)],
    skill_type: Annotated[SkillType | None, Query()] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
    skill_service: FromDishka[SkillService] = None,
    uow: FromDishka[SQLAlchemyUnitOfWork] = None,
) -> list[SkillRead]:
    async with uow:
        skills, total = await skill_service.get_user_skills(user_id, skill_type, limit, offset)
        return skills


@router.put(
    "/{skill_id}",
    response_model=SkillRead,
    responses={
        400: {"description": "Невалидные данные"},
        401: {"description": "Не аутентифицирован"},
        403: {"description": "Нет прав доступа"},
        404: {"description": "Навык не найден"},
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
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        401: {"description": "Не аутентифицирован"},
        403: {"description": "Нет прав доступа"},
        404: {"description": "Навык не найден"},
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
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        400: {"description": "Невалидные данные"},
        401: {"description": "Не аутентифицирован"},
        403: {"description": "Нет прав доступа"},
        404: {"description": "Навык не найден"},
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
