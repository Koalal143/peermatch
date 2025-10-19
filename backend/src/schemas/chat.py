from pydantic import BaseModel, Field, field_validator

from src.schemas.base import BaseReadSchema
from src.schemas.user import UserRead


class MessageCreate(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Текст сообщения (1-2000 символов)",
    )

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not v or not v.strip():
            msg = "Сообщение не может быть пустым или содержать только пробелы"
            raise ValueError(msg)
        return v.strip()


class MessageRead(BaseReadSchema):
    chat_id: int = Field(description="ID чата")
    sender_id: int = Field(description="ID отправителя")
    text: str = Field(description="Текст сообщения")
    sender: UserRead | None = Field(None, description="Информация об отправителе")


class ChatCreate(BaseModel):
    user1_id: int = Field(..., gt=0, description="ID первого пользователя")
    user2_id: int = Field(..., gt=0, description="ID второго пользователя")

    @field_validator("user2_id")
    @classmethod
    def validate_different_users(cls, v: int, info) -> int:
        if "user1_id" in info.data and v == info.data["user1_id"]:
            msg = "Пользователь не может создать чат с самим собой"
            raise ValueError(msg)
        return v


class ChatRead(BaseReadSchema):
    user1_id: int = Field(description="ID первого пользователя")
    user2_id: int = Field(description="ID второго пользователя")
    user1: UserRead | None = Field(None, description="Информация о первом пользователе")
    user2: UserRead | None = Field(None, description="Информация о втором пользователе")


class ChatListItem(BaseReadSchema):
    user1_id: int = Field(description="ID первого пользователя")
    user2_id: int = Field(description="ID второго пользователя")
    other_user: UserRead = Field(description="Информация о собеседнике")
    last_message: MessageRead | None = Field(None, description="Последнее сообщение в чате")
    last_message_at: str | None = Field(None, description="Время последнего сообщения")
