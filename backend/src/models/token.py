from datetime import datetime, UTC

from sqlalchemy import DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    token: Mapped[str] = mapped_column(String(512), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


