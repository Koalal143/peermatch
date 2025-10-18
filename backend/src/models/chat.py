from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base

if TYPE_CHECKING:
    from src.models.message import Message
    from src.models.user import User


class Chat(Base):
    __tablename__ = "chats"

    user1_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    user2_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    user1: Mapped["User"] = relationship("User", foreign_keys=[user1_id])
    user2: Mapped["User"] = relationship("User", foreign_keys=[user2_id])
    messages: Mapped[list["Message"]] = relationship(back_populates="chat", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("user1_id", "user2_id", name="uq_chat_users"),
        CheckConstraint("user1_id != user2_id", name="ck_chat_different_users"),
    )

    def __repr__(self) -> str:
        return f"<Chat(id={self.id}, user1_id={self.user1_id}, user2_id={self.user2_id})>"
