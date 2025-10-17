from pydantic import BaseModel, EmailStr, Field

from src.schemas.base import BaseReadSchema


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8)


class UserRead(BaseReadSchema):
    username: str
    email: EmailStr


class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=50)
    email: EmailStr | None = Field(None, min_length=3, max_length=255)
