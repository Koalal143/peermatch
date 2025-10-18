from collections.abc import Sequence

from src.enums.skill_type import SkillType
from src.exceptions.skill import SkillAccessDeniedError, SkillNotFoundError
from src.repositories.embeddings import EmbeddingsRepository
from src.repositories.skill import SkillRepository
from src.repositories.vector_search import VectorSearchRepository
from src.schemas.skills import SkillRead, SkillUpdate


class SkillService:
    def __init__(
        self,
        skill_repository: SkillRepository,
        vector_search_repository: VectorSearchRepository,
        embeddings_repository: EmbeddingsRepository,
    ) -> None:
        self.skill_repository = skill_repository
        self.vector_search_repository = vector_search_repository
        self.embeddings_repository = embeddings_repository

    async def create_skill(
        self, user_id: int, current_user_id: int, name: str, skill_type: SkillType, description: str | None = None
    ) -> SkillRead:
        if user_id != current_user_id:
            msg = "You can only add skills to your own profile"
            raise SkillAccessDeniedError(msg)

        skill = await self.skill_repository.create(user_id=user_id, name=name, type=skill_type, description=description)
        embedding = await self.embeddings_repository.get_embedding(name)
        await self.vector_search_repository.add_skill(skill.id, embedding, payload={"type": skill_type.value})
        return SkillRead.model_validate(skill)

    async def get_user_skills(
        self, user_id: int, skill_type: SkillType | None = None, limit: int = 100, offset: int = 0
    ) -> tuple[Sequence[SkillRead], int]:
        if skill_type:
            skills, total = await self.skill_repository.get_by_user_and_type(user_id, skill_type, limit, offset)
        else:
            skills, total = await self.skill_repository.get_by_user_id(user_id, limit, offset)

        return [SkillRead.model_validate(skill) for skill in skills], total

    async def get_all_skills(
        self, skill_type: SkillType | None = None, limit: int = 100, offset: int = 0
    ) -> tuple[Sequence[SkillRead], int]:
        skills, total = await self.skill_repository.get_all(skill_type, limit, offset)
        return [SkillRead.model_validate(skill) for skill in skills], total

    async def get_skill_by_id(self, skill_id: int) -> SkillRead:
        skill = await self.skill_repository.get(skill_id)
        if not skill:
            msg = "Skill not found"
            raise SkillNotFoundError(msg)
        return SkillRead.model_validate(skill)

    async def get_skills_by_id(
        self,
        skill_ids: list[int],
    ) -> Sequence[SkillRead]:
        skills = await self.skill_repository.get_by_ids(skill_ids)
        return [SkillRead.model_validate(skill) for skill in skills]

    async def search_skills_by_query(
        self,
        query: str,
        skill_type: SkillType | None = None,
        limit: int = 10,
        offset: int = 0,
    ) -> tuple[Sequence[SkillRead], int]:
        embedding = await self.embeddings_repository.get_embedding(query)
        response, total = await self.vector_search_repository.search(embedding, skill_type, limit, offset)
        skill_ids = [point.id for point in response.points]
        skills = await self.get_skills_by_id(skill_ids)
        skills_in_correct_order = []
        for skill_id in skill_ids:
            next_elem = next(filter(lambda skill: skill.id == skill_id, skills), None)
            if next_elem:
                skills_in_correct_order.append(next_elem)

        return skills_in_correct_order, total

    async def update_skill(self, skill_id: int, current_user_id: int, update_data: SkillUpdate) -> SkillRead:
        skill = await self.skill_repository.get(skill_id)
        if not skill:
            msg = "Skill not found"
            raise SkillNotFoundError(msg)

        if skill.user_id != current_user_id:
            msg = "You can only edit your own skills"
            raise SkillAccessDeniedError(msg)

        updated_skill = await self.skill_repository.update(
            skill_id=skill_id, name=update_data.name, description=update_data.description
        )
        embedding = await self.embeddings_repository.get_embedding(updated_skill.name)
        await self.vector_search_repository.add_skill(
            updated_skill.id, embedding, payload={"type": updated_skill.type.value}
        )
        return SkillRead.model_validate(updated_skill)

    async def delete_skill(self, skill_id: int, current_user_id: int) -> None:
        skill = await self.skill_repository.get(skill_id)
        if not skill:
            msg = "Skill not found"
            raise SkillNotFoundError(msg)

        if skill.user_id != current_user_id:
            msg = "You can only delete your own skills"
            raise SkillAccessDeniedError(msg)

        await self.skill_repository.delete(skill_id)
        await self.vector_search_repository.delete_skill(skill_id)

    async def bulk_delete_skills(self, skill_ids: list[int], current_user_id: int) -> None:
        skills = []
        for skill_id in skill_ids:
            skill = await self.skill_repository.get(skill_id)
            if not skill:
                msg = f"Skill {skill_id} not found"
                raise SkillNotFoundError(msg)
            if skill.user_id != current_user_id:
                msg = "You can only delete your own skills"
                raise SkillAccessDeniedError(msg)
            skills.append(skill)

        await self.skill_repository.bulk_delete(skill_ids)
        await self.vector_search_repository.delete_skills(skill_ids)
