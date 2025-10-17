from src.exceptions.base import BaseAppError


class InvalidTokenError(BaseAppError):
    error_key = "invalid_refresh_token"
