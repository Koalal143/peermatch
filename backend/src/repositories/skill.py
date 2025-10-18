from collections.abc import Sequence

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.enums.skill_type import SkillType
from src.models.skills import Skill


class SkillRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, skill_id: int) -> Skill | None:
        stmt = select(Skill).where(Skill.id == skill_id).options(joinedload(Skill.user))
        result = await self.session.scalars(stmt)
        return result.first()

    async def create(self, user_id: int, name: str, type: SkillType, description: str | None = None) -> Skill:
        skill = Skill(user_id=user_id, name=name, type=type, description=description)
        self.session.add(skill)
        await self.session.flush()
        await self.session.refresh(skill)
        return skill

    async def get_by_user_id(self, user_id: int, limit: int = 100, offset: int = 0) -> tuple[Sequence[Skill], int]:
        stmt = select(Skill).where(Skill.user_id == user_id).options(joinedload(Skill.user)).limit(limit).offset(offset)
        result = await self.session.scalars(stmt)
        skills = result.all()

        count_stmt = select(Skill).where(Skill.user_id == user_id)
        count_result = await self.session.scalars(count_stmt)
        total = len(count_result.all())

        return skills, total

    async def get_by_user_and_type(
        self, user_id: int, skill_type: SkillType, limit: int = 100, offset: int = 0
    ) -> tuple[Sequence[Skill], int]:
        stmt = (
            select(Skill)
            .where(and_(Skill.user_id == user_id, Skill.type == skill_type))
            .options(joinedload(Skill.user))
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.scalars(stmt)
        skills = result.all()

        count_stmt = select(Skill).where(and_(Skill.user_id == user_id, Skill.type == skill_type))
        count_result = await self.session.scalars(count_stmt)
        total = len(count_result.all())

        return skills, total

    async def get_by_ids(self, skill_ids: list[int]) -> Sequence[Skill]:
        stmt = select(Skill).where(Skill.id.in_(skill_ids)).options(joinedload(Skill.user))
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_all(
        self, skill_type: SkillType | None = None, limit: int = 100, offset: int = 0
    ) -> tuple[Sequence[Skill], int]:
        if skill_type:
            stmt = (
                select(Skill)
                .where(Skill.type == skill_type)
                .options(joinedload(Skill.user))
                .limit(limit)
                .offset(offset)
            )
            count_stmt = select(Skill).where(Skill.type == skill_type)
        else:
            stmt = select(Skill).options(joinedload(Skill.user)).limit(limit).offset(offset)
            count_stmt = select(Skill)

        result = await self.session.scalars(stmt)
        skills = result.all()

        count_result = await self.session.scalars(count_stmt)
        total = len(count_result.all())

        return skills, total

    async def update(self, skill_id: int, name: str | None = None, description: str | None = None) -> Skill | None:
        skill = await self.get(skill_id)
        if not skill:
            return None
        if name is not None:
            skill.name = name
        if description is not None:
            skill.description = description
        await self.session.flush()
        await self.session.refresh(skill)
        return skill

    async def delete(self, skill_id: int) -> bool:
        skill = await self.get(skill_id)
        if not skill:
            return False
        await self.session.delete(skill)
        await self.session.flush()
        return True

    async def bulk_delete(self, skill_ids: list[int]) -> int:
        stmt = select(Skill).where(Skill.id.in_(skill_ids))
        result = await self.session.scalars(stmt)
        skills = result.all()
        for skill in skills:
            await self.session.delete(skill)
        await self.session.flush()
        return len(skills)
