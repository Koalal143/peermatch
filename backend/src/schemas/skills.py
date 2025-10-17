from src.schemas.base import BaseSchema
from src.enums.skill_type import SkillType

class SkillCreate(BaseSchema):
    type: SkillType
    name: str
    description: str | None = None

class SkillRead(BaseSchema):
    id: int
    type: SkillType
    name: str
    description: str | None = None