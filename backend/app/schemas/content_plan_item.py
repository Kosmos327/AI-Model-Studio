from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ContentPlanItemBase(BaseModel):
    character_id: int
    title: str
    platform: str
    content_type: str
    media_asset_id: Optional[int] = None
    scheduled_for: Optional[datetime] = None
    status: str = "planned"
    caption_text: Optional[str] = None
    hashtags: Optional[str] = None
    notes: Optional[str] = None


class ContentPlanItemCreate(ContentPlanItemBase):
    pass


class ContentPlanItemUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    content_type: Optional[str] = None
    media_asset_id: Optional[int] = None
    scheduled_for: Optional[datetime] = None
    status: Optional[str] = None
    caption_text: Optional[str] = None
    hashtags: Optional[str] = None
    notes: Optional[str] = None


class ContentPlanItemRead(ContentPlanItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
