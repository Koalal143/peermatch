from typing import TYPE_CHECKING

from src.enums.skill_type import SkillType
from src.schemas.base import BaseSchema

if TYPE_CHECKING:
    from src.schemas.user import UserRead


class SkillCreate(BaseSchema):
    type: SkillType
    name: str
    description: str | None = None
    user_id: int


class SkillRead(BaseSchema):
    id: int
    type: SkillType
    name: str
    description: str | None = None
    user: "UserRead"
