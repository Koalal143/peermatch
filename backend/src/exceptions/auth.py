from src.exceptions.base import BaseAppError


class InvalidTokenError(BaseAppError):
    error_key = "invalid_refresh_token"


class InvalidJWTError(BaseAppError):
    error_key = "invalid_jwt"


class JWTSignatureExpiredError(BaseAppError):
    error_key = "jwt_signature_expired"


class InactiveOrNotExistingUserError(BaseAppError):
    error_key = "inactive_or_not_existing_user"
