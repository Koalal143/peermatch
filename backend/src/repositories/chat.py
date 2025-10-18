from collections.abc import Sequence

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.chat import Chat
from src.models.message import Message


class ChatRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, user1_id: int, user2_id: int) -> Chat:
        # Ensure user1_id < user2_id for consistent ordering
        if user1_id > user2_id:
            user1_id, user2_id = user2_id, user1_id

        chat = Chat(user1_id=user1_id, user2_id=user2_id)
        self.session.add(chat)
        await self.session.flush()
        await self.session.refresh(chat)
        return chat

    async def get(self, chat_id: int) -> Chat | None:
        stmt = select(Chat).where(Chat.id == chat_id).options(joinedload(Chat.user1), joinedload(Chat.user2))
        result = await self.session.scalars(stmt)
        return result.first()

    async def get_or_create(self, user1_id: int, user2_id: int) -> Chat:
        # Ensure user1_id < user2_id for consistent ordering
        if user1_id > user2_id:
            user1_id, user2_id = user2_id, user1_id

        stmt = (
            select(Chat)
            .where(and_(Chat.user1_id == user1_id, Chat.user2_id == user2_id))
            .options(joinedload(Chat.user1), joinedload(Chat.user2))
        )
        result = await self.session.scalars(stmt)
        chat = result.first()

        if not chat:
            chat = await self.create(user1_id, user2_id)
            await self.session.refresh(chat, ["user1", "user2"])

        return chat

    async def get_user_chats(self, user_id: int, limit: int = 100, offset: int = 0) -> tuple[Sequence[Chat], int]:
        stmt = (
            select(Chat)
            .where(or_(Chat.user1_id == user_id, Chat.user2_id == user_id))
            .options(joinedload(Chat.user1), joinedload(Chat.user2))
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.scalars(stmt)
        chats = result.all()

        count_stmt = select(Chat).where(or_(Chat.user1_id == user_id, Chat.user2_id == user_id))
        count_result = await self.session.scalars(count_stmt)
        total = len(count_result.all())

        return chats, total


class MessageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, chat_id: int, sender_id: int, text: str) -> Message:
        message = Message(chat_id=chat_id, sender_id=sender_id, text=text)
        self.session.add(message)
        await self.session.flush()
        await self.session.refresh(message)
        return message

    async def get(self, message_id: int) -> Message | None:
        stmt = select(Message).where(Message.id == message_id).options(joinedload(Message.sender))
        result = await self.session.scalars(stmt)
        return result.first()

    async def get_chat_messages(self, chat_id: int, limit: int = 100, offset: int = 0) -> tuple[Sequence[Message], int]:
        stmt = (
            select(Message)
            .where(Message.chat_id == chat_id)
            .options(joinedload(Message.sender))
            .order_by(Message.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.scalars(stmt)
        messages = result.all()

        count_stmt = select(Message).where(Message.chat_id == chat_id)
        count_result = await self.session.scalars(count_stmt)
        total = len(count_result.all())

        return messages, total
