from pydantic import BaseModel, EmailStr, Field, field_validator

from src.schemas.base import BaseReadSchema

BANNED_USERNAMES = {
    "admin",
    "root",
    "system",
    "api",
    "test",
    "demo",
    "guest",
    "user",
    "moderator",
    "administrator",
}


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8)

    @field_validator("username")
    @classmethod
    def validate_username_not_banned(cls, v: str) -> str:
        if v.lower() in BANNED_USERNAMES:
            msg = "This username is not allowed"
            raise ValueError(msg)
        return v


class UserRead(BaseReadSchema):
    username: str
    email: EmailStr


class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=50)
    email: EmailStr | None = Field(None, min_length=3, max_length=255)

    @field_validator("username")
    @classmethod
    def validate_username_not_banned(cls, v: str | None) -> str | None:
        if v is not None and v.lower() in BANNED_USERNAMES:
            msg = "This username is not allowed"
            raise ValueError(msg)
        return v


class UserPatch(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=50)
    email: EmailStr | None = Field(None, min_length=3, max_length=255)

    @field_validator("username")
    @classmethod
    def validate_username_not_banned(cls, v: str | None) -> str | None:
        if v is not None and v.lower() in BANNED_USERNAMES:
            msg = "This username is not allowed"
            raise ValueError(msg)
        return v


class UserLogin(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
    password: str
