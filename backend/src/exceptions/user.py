from src.exceptions.base import BaseAppError


class UserNotFoundError(BaseAppError):
    error_key = "user_not_found"


class UserNicknameAlreadyExistsError(BaseAppError):
    error_key = "user_nickname_already_exists"


class UserEmailAlreadyExistsError(BaseAppError):
    error_key = "user_email_already_exists"


class IncorrectCredentialsError(BaseAppError):
    error_key = "incorrect_email_username_or_password"
