from pydantic import BaseModel, Field

from src.enums.skill_type import SkillType
from src.schemas.base import BaseReadSchema, BaseSchema


class SkillCreate(BaseSchema):
    type: SkillType
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)


class SkillUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)


class SkillRead(BaseReadSchema):
    type: SkillType
    name: str
    description: str | None = None
    user_id: int


class SkillBulkDelete(BaseModel):
    skill_ids: list[int] = Field(min_length=1)
