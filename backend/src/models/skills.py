from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.enums.skill_type import SkillType
from src.models.base import Base

if TYPE_CHECKING:
    from src.models.user import User


class Skill(Base):
    __tablename__ = "skills"

    type: Mapped[SkillType] = mapped_column(Enum(SkillType))
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user: Mapped["User"] = relationship(back_populates="skills")
