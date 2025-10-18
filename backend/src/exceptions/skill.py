from src.exceptions.base import BaseAppError


class SkillNotFoundError(BaseAppError):
    error_key = "skill_not_found"


class SkillAccessDeniedError(BaseAppError):
    error_key = "skill_access_denied"


class InvalidSkillDataError(BaseAppError):
    error_key = "invalid_skill_data"
