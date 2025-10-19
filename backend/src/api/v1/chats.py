import contextlib
import json
import logging
from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, HTTPException, Path, Query, WebSocket, WebSocketDisconnect, status

from src.api.security import CurrentUserDependency
from src.api.websocket import manager
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.chat import ChatAccessDeniedError, ChatNotFoundError, InvalidChatMembersError
from src.schemas.chat import ChatCreate, ChatRead, MessageCreate, MessageRead
from src.services.chat import ChatService
from src.services.token import TokenService

logger = logging.getLogger(__name__)

router = APIRouter(route_class=DishkaRoute, prefix="/chats", tags=["Chats"])
ws_router = APIRouter(tags=["WebSocket"])


@router.post(
    "",
    summary="Создание нового чата",
    description="Создание чата между двумя пользователями",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Чат успешно создан", "model": ChatRead},
        400: {"description": "Ошибка валидации данных"},
        401: {"description": "Не аутентифицирован"},
    },
)
async def create_chat(
    chat_in: ChatCreate,
    current_user: CurrentUserDependency,
    chat_service: FromDishka[ChatService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> ChatRead:
    try:
        chat = await chat_service.create_chat(chat_in.user1_id, chat_in.user2_id, current_user.id)
        await uow.commit()
    except (ChatAccessDeniedError, InvalidChatMembersError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_key": e.error_key, "message": str(e)},
        ) from e
    else:
        return chat


@router.get(
    "",
    summary="Получение списка чатов",
    description="Получение всех чатов текущего пользователя",
    responses={
        200: {"description": "Список чатов", "model": list[ChatRead]},
        401: {"description": "Не аутентифицирован"},
    },
)
async def get_user_chats(
    current_user: CurrentUserDependency,
    chat_service: FromDishka[ChatService],
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> dict:
    chats, total = await chat_service.get_user_chats(current_user.id, limit, offset)
    return {"items": chats, "total": total}


@router.get(
    "/list/with-messages",
    summary="Получение списка чатов с последними сообщениями",
    description="Получение всех чатов текущего пользователя с информацией о последних сообщениях",
    responses={
        200: {"description": "Список чатов с сообщениями", "model": dict},
        401: {"description": "Не аутентифицирован"},
    },
)
async def get_user_chats_with_messages(
    current_user: CurrentUserDependency,
    chat_service: FromDishka[ChatService],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> dict:
    chats, total = await chat_service.get_user_chats_with_messages(current_user.id, limit, offset)
    return {"items": chats, "total": total}


@router.get(
    "/{chat_id}",
    summary="Получение информации о чате",
    description="Получение полной информации о чате по ID",
    responses={
        200: {"description": "Информация о чате", "model": ChatRead},
        401: {"description": "Не аутентифицирован"},
        403: {"description": "Нет доступа к чату"},
        404: {"description": "Чат не найден"},
    },
)
async def get_chat(
    chat_id: Annotated[int, Path(gt=0)],
    current_user: CurrentUserDependency,
    chat_service: FromDishka[ChatService],
) -> ChatRead:
    try:
        return await chat_service.get_chat(chat_id, current_user.id)
    except ChatNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error_key": e.error_key, "message": str(e)},
        ) from e
    except ChatAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error_key": e.error_key, "message": str(e)},
        ) from e


@router.get(
    "/{chat_id}/messages",
    summary="Получение истории сообщений",
    description="Получение сообщений чата с пагинацией",
    responses={
        200: {"description": "История сообщений", "model": dict},
        401: {"description": "Не аутентифицирован"},
        403: {"description": "Нет доступа к чату"},
        404: {"description": "Чат не найден"},
    },
)
async def get_chat_messages(
    chat_id: Annotated[int, Path(gt=0)],
    current_user: CurrentUserDependency,
    chat_service: FromDishka[ChatService],
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> dict:
    try:
        messages, total = await chat_service.get_chat_messages(chat_id, current_user.id, limit, offset)
    except ChatNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error_key": e.error_key, "message": str(e)},
        ) from e
    except ChatAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error_key": e.error_key, "message": str(e)},
        ) from e
    else:
        return {"items": messages, "total": total}


@router.post(
    "/{chat_id}/messages",
    summary="Отправка сообщения",
    description="Отправка нового сообщения в чат",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Сообщение успешно отправлено", "model": MessageRead},
        400: {"description": "Ошибка валидации данных"},
        401: {"description": "Не аутентифицирован"},
        403: {"description": "Нет доступа к чату"},
        404: {"description": "Чат не найден"},
    },
)
async def create_message(
    chat_id: Annotated[int, Path(gt=0)],
    message_in: MessageCreate,
    current_user: CurrentUserDependency,
    chat_service: FromDishka[ChatService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> MessageRead:
    try:
        message = await chat_service.create_message(chat_id, current_user.id, message_in.text, current_user.id)
        await uow.commit()
    except ChatNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error_key": e.error_key, "message": str(e)},
        ) from e
    except ChatAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error_key": e.error_key, "message": str(e)},
        ) from e
    except Exception as e:
        logger.exception("Error creating message")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_key": "invalid_message", "message": "Failed to create message"},
        ) from e
    else:
        return message


@ws_router.websocket("/chats/ws/chat/{chat_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    chat_id: Annotated[int, Path(gt=0)],
    token: Annotated[str | None, Query()] = None,
) -> None:
    container = websocket.app.state.dishka_container

    if not token:
        logger.warning("WebSocket connection attempt without token")
        return

    current_user = None
    async with container() as request_container:
        token_service = await request_container.get(TokenService)
        current_user = await token_service.get_current_user(token=token)

    try:
        async with container() as request_container:
            chat_service = await request_container.get(ChatService)
            await chat_service.get_chat(chat_id, current_user.id)
    except ChatNotFoundError:
        logger.warning("WebSocket chat (%s) not found", chat_id)
        return
    except ChatAccessDeniedError:
        logger.warning("WebSocket user (%s) denied access to chat (%s)", current_user.id, chat_id)
        return

    try:
        await manager.connect(chat_id, websocket)

        await manager.send_personal(
            websocket,
            {
                "type": "connection",
                "status": "connected",
                "chat_id": chat_id,
                "user_id": current_user.id,
            },
        )

        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)

                if message_data.get("type") == "message":
                    text = message_data.get("text", "").strip()
                    if not text:
                        await manager.send_personal(
                            websocket,
                            {
                                "type": "error",
                                "message": "Message text cannot be empty",
                            },
                        )
                        continue

                    try:
                        MessageCreate(text=text)
                    except Exception:
                        await manager.send_personal(
                            websocket,
                            {
                                "type": "error",
                                "message": "Invalid message",
                            },
                        )
                        logger.exception("Unknown error")
                        continue

                    try:
                        async with container() as request_container:
                            chat_service = await request_container.get(ChatService)
                            uow = await request_container.get(SQLAlchemyUnitOfWork)
                            message = await chat_service.create_message(chat_id, current_user.id, text, current_user.id)
                            await uow.commit()
                        await manager.broadcast(
                            chat_id,
                            {
                                "type": "message",
                                "id": message.id,
                                "chat_id": message.chat_id,
                                "sender_id": message.sender_id,
                                "sender_username": current_user.username,
                                "text": message.text,
                                "created_at": message.created_at.isoformat(),
                            },
                        )
                    except Exception:
                        await manager.send_personal(
                            websocket,
                            {
                                "type": "error",
                                "message": "Failed to send message",
                            },
                        )
                        logger.exception("Unknown error")

        except WebSocketDisconnect:
            manager.disconnect(chat_id, websocket)

    except Exception:
        logger.exception("WebSocket error")
        with contextlib.suppress(Exception):
            await websocket.close(code=status.WS_1011_SERVER_ERROR, reason="Internal server error")
