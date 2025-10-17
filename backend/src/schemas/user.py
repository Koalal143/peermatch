import re
from datetime import datetime
from typing import Annotated, Final, Self

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    model_validator,
)

from src.schemas.base import BaseReadSchema, BaseSchema

BANNED_USERNAMES = [
    "admin",
    "administrator",
    "root",
    "moderator",
    "support",
    "help",
    "owner",
    "staff",
    "avatar",
    "me",
]

NICKNAME_PATTERN: Final[re.Pattern] = re.compile(r"^[a-zA-Z0-9_-]+$")

SPECIAL_CHARACTERS: Final[str] = r"!\"#\$%&'\(\)\*\+,\-./:;<=>\?@\[\\\]\^_`{\|}~"


def validate_username(username: str) -> str:
    if username.lower() in BANNED_USERNAMES:
        msg = "Username is not allowed"
        raise ValueError(msg)
    return username


Nickname = Annotated[
    str, Field(pattern=NICKNAME_PATTERN, min_length=3, max_length=30), AfterValidator(validate_username)
]


def validate_password(password: str) -> str:
    if (
        not any(char.isupper() for char in password)
        or not any(char.islower() for char in password)
        or not any(char.isnumeric() for char in password)
        or not re.search(r"[" + SPECIAL_CHARACTERS + r"]", password)
    ):
        msg = "Password must contain at least one uppercase letter, one lowercase letter, one special symbol and digit."
        raise ValueError(msg)
    return password


Password = Annotated[
    str,
    Field(
        min_length=8,
        examples=["H2rdP$ssw0rdTh3Wi&&er"],
        description=(
            "User password. Must contain at least one uppercase letter, one lowercase letter, one "
            "special symbol and number"
        ),
    ),
    AfterValidator(validate_password),
]


class UserProfileRead(BaseReadSchema):
    user_id: int = Field(description="User ID to which the profile belongs")
    about: str | None = Field(None, description="About the user")
    avatar_url: str | None = Field(None, description="User avatar URL")


class UserProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    about: str | None = Field(None, description="About the user")


class UserCreate(BaseModel):
    username: Nickname = Field(min_length=3, max_length=30)
    email: EmailStr = Field(min_length=3, max_length=100)
    password: Password


class UserRead(BaseReadSchema):
    username: str
    email: str
    is_active: bool
    is_superuser: bool
    last_login: datetime | None


class UserProfileShort(BaseSchema):
    avatar_url: str | None


class UserReadShort(BaseSchema):
    id: int
    username: str
    profile: UserProfileShort


class UserLogin(BaseModel):
    email: EmailStr | None = Field(None, description="User email")
    username: Nickname | None = Field(None, description="Username")
    password: Password

    @model_validator(mode="after")
    def validate_email(self) -> Self:
        if not self.email and not self.username:
            msg = "Either email or username must be provided"
            raise ValueError(msg)
        return self


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    username: Nickname | None = Field(None, min_length=3, max_length=30, description="New username for the user")
    profile: UserProfileUpdate | None = Field(None, description="User profile information")


class UserRoleUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    role: UserRoleEnum = Field(description="New role for the user")
