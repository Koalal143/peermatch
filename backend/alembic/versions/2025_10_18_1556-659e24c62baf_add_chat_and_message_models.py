"""Add Chat and Message models

Revision ID: 659e24c62baf
Revises: d687d095d8fd
Create Date: 2025-10-18 15:56:49.700504

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "659e24c62baf"
down_revision: str | None = "d687d095d8fd"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "chats",
        sa.Column("user1_id", sa.Integer(), nullable=False),
        sa.Column("user2_id", sa.Integer(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("user1_id != user2_id", name=op.f("ck_chats_ck_chat_different_users")),
        sa.ForeignKeyConstraint(["user1_id"], ["users.id"], name=op.f("fk_chats_user1_id_users")),
        sa.ForeignKeyConstraint(["user2_id"], ["users.id"], name=op.f("fk_chats_user2_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_chats")),
        sa.UniqueConstraint("user1_id", "user2_id", name="uq_chat_users"),
    )
    op.create_index(op.f("ix_chats_id"), "chats", ["id"], unique=False)
    op.create_index(op.f("ix_chats_user1_id"), "chats", ["user1_id"], unique=False)
    op.create_index(op.f("ix_chats_user2_id"), "chats", ["user2_id"], unique=False)
    op.create_table(
        "messages",
        sa.Column("chat_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["chat_id"], ["chats.id"], name=op.f("fk_messages_chat_id_chats")),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], name=op.f("fk_messages_sender_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_messages")),
    )
    op.create_index(op.f("ix_messages_chat_id"), "messages", ["chat_id"], unique=False)
    op.create_index(op.f("ix_messages_id"), "messages", ["id"], unique=False)
    op.create_index(op.f("ix_messages_sender_id"), "messages", ["sender_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_messages_sender_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_chat_id"), table_name="messages")
    op.drop_table("messages")
    op.drop_index(op.f("ix_chats_user2_id"), table_name="chats")
    op.drop_index(op.f("ix_chats_user1_id"), table_name="chats")
    op.drop_index(op.f("ix_chats_id"), table_name="chats")
    op.drop_table("chats")
