"""Initial migration - create all tables

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "characters",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("archetype", sa.String(), nullable=True),
        sa.Column("age_style", sa.String(), nullable=True),
        sa.Column("nationality_style", sa.String(), nullable=True),
        sa.Column("tone_of_voice", sa.String(), nullable=True),
        sa.Column("bio_short", sa.String(), nullable=True),
        sa.Column("bio_full", sa.String(), nullable=True),
        sa.Column("core_traits", sa.String(), nullable=True),
        sa.Column("forbidden_traits", sa.String(), nullable=True),
        sa.Column("style_notes", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_characters_slug", "characters", ["slug"], unique=True)

    op.create_table(
        "prompt_templates",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("prompt_text", sa.String(), nullable=False),
        sa.Column("negative_prompt", sa.String(), nullable=True),
        sa.Column("variables_json", sa.String(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("is_favorite", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "reference_assets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("file_path", sa.String(), nullable=False),
        sa.Column("preview_path", sa.String(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("is_master", sa.Boolean(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("tags", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "generation_tasks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("task_type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("engine", sa.String(), nullable=False),
        sa.Column("input_refs_json", sa.String(), nullable=True),
        sa.Column("prompt_template_id", sa.Integer(), nullable=True),
        sa.Column("settings_json", sa.String(), nullable=True),
        sa.Column("result_count_expected", sa.Integer(), nullable=False),
        sa.Column("result_count_actual", sa.Integer(), nullable=False),
        sa.Column("error_message", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["prompt_template_id"], ["prompt_templates.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "media_assets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("generation_task_id", sa.Integer(), nullable=True),
        sa.Column("asset_type", sa.String(), nullable=False),
        sa.Column("file_path", sa.String(), nullable=False),
        sa.Column("preview_path", sa.String(), nullable=True),
        sa.Column("thumbnail_path", sa.String(), nullable=True),
        sa.Column("caption_draft", sa.String(), nullable=True),
        sa.Column("quality_score", sa.Integer(), nullable=True),
        sa.Column("consistency_score", sa.Integer(), nullable=True),
        sa.Column("publish_status", sa.String(), nullable=False),
        sa.Column("is_best", sa.Boolean(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("tags", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["generation_task_id"], ["generation_tasks.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "content_plan_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("content_type", sa.String(), nullable=False),
        sa.Column("media_asset_id", sa.Integer(), nullable=True),
        sa.Column("scheduled_for", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("caption_text", sa.String(), nullable=True),
        sa.Column("hashtags", sa.String(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["media_asset_id"], ["media_assets.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "consistency_profiles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("face_shape", sa.String(), nullable=True),
        sa.Column("eye_shape", sa.String(), nullable=True),
        sa.Column("nose_shape", sa.String(), nullable=True),
        sa.Column("lip_shape", sa.String(), nullable=True),
        sa.Column("skin_tone", sa.String(), nullable=True),
        sa.Column("hair_color", sa.String(), nullable=True),
        sa.Column("hair_style", sa.String(), nullable=True),
        sa.Column("body_type", sa.String(), nullable=True),
        sa.Column("signature_features", sa.String(), nullable=True),
        sa.Column("do_not_change", sa.String(), nullable=True),
        sa.Column("master_reference_ids_json", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["character_id"], ["characters.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("character_id", name="uq_consistency_character"),
    )


def downgrade() -> None:
    op.drop_table("consistency_profiles")
    op.drop_table("content_plan_items")
    op.drop_table("media_assets")
    op.drop_table("generation_tasks")
    op.drop_table("reference_assets")
    op.drop_table("prompt_templates")
    op.drop_index("ix_characters_slug", table_name="characters")
    op.drop_table("characters")
