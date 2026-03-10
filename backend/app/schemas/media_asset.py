from datetime import datetime
from typing import Optional, Annotated
from pydantic import BaseModel, ConfigDict, Field

ScoreField = Annotated[Optional[int], Field(default=None, ge=1, le=10)]


class MediaAssetBase(BaseModel):
    character_id: int
    generation_task_id: Optional[int] = None
    asset_type: str
    file_path: str
    preview_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    caption_draft: Optional[str] = None
    quality_score: ScoreField = None
    consistency_score: ScoreField = None
    publish_status: str = "draft"
    is_best: bool = False
    notes: Optional[str] = None
    tags: Optional[str] = None


class MediaAssetCreate(MediaAssetBase):
    pass


class MediaAssetUpdate(BaseModel):
    generation_task_id: Optional[int] = None
    asset_type: Optional[str] = None
    file_path: Optional[str] = None
    preview_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    caption_draft: Optional[str] = None
    quality_score: ScoreField = None
    consistency_score: ScoreField = None
    publish_status: Optional[str] = None
    is_best: Optional[bool] = None
    notes: Optional[str] = None
    tags: Optional[str] = None


class MediaAssetRead(MediaAssetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
