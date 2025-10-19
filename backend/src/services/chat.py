from collections.abc import Sequence

from src.exceptions.chat import ChatAccessDeniedError, ChatNotFoundError, InvalidChatMembersError
from src.repositories.chat import ChatRepository, MessageRepository
from src.schemas.chat import ChatListItem, ChatRead, MessageRead


class ChatService:
    def __init__(self, chat_repository: ChatRepository, message_repository: MessageRepository) -> None:
        self.chat_repository = chat_repository
        self.message_repository = message_repository

    async def create_chat(self, user1_id: int, user2_id: int, current_user_id: int) -> ChatRead:
        if user1_id == user2_id:
            msg = "User can't create chat with himself"
            raise InvalidChatMembersError(msg)

        if current_user_id not in (user1_id, user2_id):
            msg = "You can create chat only using your account"
            raise ChatAccessDeniedError(msg)

        chat = await self.chat_repository.get_or_create(user1_id, user2_id)
        return ChatRead.model_validate(chat)

    async def get_chat(self, chat_id: int, current_user_id: int) -> ChatRead:
        chat = await self.chat_repository.get(chat_id)
        if not chat:
            msg = "Chat not found"
            raise ChatNotFoundError(msg)

        if current_user_id not in (chat.user1_id, chat.user2_id):
            msg = "You do not have access to this chat"
            raise ChatAccessDeniedError(msg)

        return ChatRead.model_validate(chat)

    async def get_user_chats(
        self, current_user_id: int, limit: int = 100, offset: int = 0
    ) -> tuple[Sequence[ChatRead], int]:
        chats, total = await self.chat_repository.get_user_chats(current_user_id, limit, offset)
        return [ChatRead.model_validate(chat) for chat in chats], total

    async def get_user_chats_with_messages(
        self, current_user_id: int, limit: int = 50, offset: int = 0
    ) -> tuple[Sequence[ChatListItem], int]:
        chats, total = await self.chat_repository.get_user_chats(current_user_id, limit, offset)
        result = []

        for chat in chats:
            other_user = chat.user2 if chat.user1_id == current_user_id else chat.user1

            messages, _ = await self.message_repository.get_chat_messages(chat.id, limit=1, offset=0)
            last_message = None
            last_message_at = None

            if messages:
                last_msg = messages[0]
                last_message = MessageRead.model_validate(last_msg)
                last_message_at = last_msg.created_at.isoformat() if last_msg.created_at else None

            chat_item = ChatListItem(
                id=chat.id,
                created_at=chat.created_at,
                user1_id=chat.user1_id,
                user2_id=chat.user2_id,
                other_user=other_user,
                last_message=last_message,
                last_message_at=last_message_at,
            )
            result.append(chat_item)

        return result, total

    async def create_message(self, chat_id: int, sender_id: int, text: str, current_user_id: int) -> MessageRead:
        chat = await self.chat_repository.get(chat_id)
        if not chat:
            msg = "Chat not found"
            raise ChatNotFoundError(msg)

        if sender_id not in (chat.user1_id, chat.user2_id):
            msg = "You can send messages only in your chat"
            raise ChatAccessDeniedError(msg)

        if current_user_id != sender_id:
            msg = "You can't send messages not from your account"
            raise ChatAccessDeniedError(msg)

        message = await self.message_repository.create(chat_id, sender_id, text)
        return MessageRead.model_validate(message)

    async def get_chat_messages(
        self, chat_id: int, current_user_id: int, limit: int = 100, offset: int = 0
    ) -> tuple[Sequence[MessageRead], int]:
        chat = await self.chat_repository.get(chat_id)
        if not chat:
            msg = "Chat not found"
            raise ChatNotFoundError(msg)

        if current_user_id not in (chat.user1_id, chat.user2_id):
            msg = "You don't have access to this chat"
            raise ChatAccessDeniedError(msg)

        messages, total = await self.message_repository.get_chat_messages(chat_id, limit, offset)
        return [MessageRead.model_validate(msg) for msg in messages], total
