from src.exceptions.base import BaseAppError


class ChatNotFoundError(BaseAppError):
    error_key = "chat_not_found"


class ChatAccessDeniedError(BaseAppError):
    error_key = "chat_access_denied"


class ChatAlreadyExistsError(BaseAppError):
    error_key = "chat_already_exists"


class InvalidChatMembersError(BaseAppError):
    error_key = "invalid_chat_members"
