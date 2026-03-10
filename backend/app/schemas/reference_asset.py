from datetime import datetime
from typing import Optional, Annotated
from pydantic import BaseModel, ConfigDict, Field

RatingField = Annotated[Optional[int], Field(default=None, ge=1, le=5)]


class ReferenceAssetBase(BaseModel):
    character_id: int
    type: str
    category: str
    file_path: str
    preview_path: Optional[str] = None
    notes: Optional[str] = None
    is_master: bool = False
    rating: RatingField = None
    tags: Optional[str] = None


class ReferenceAssetCreate(ReferenceAssetBase):
    pass


class ReferenceAssetUpdate(BaseModel):
    type: Optional[str] = None
    category: Optional[str] = None
    file_path: Optional[str] = None
    preview_path: Optional[str] = None
    notes: Optional[str] = None
    is_master: Optional[bool] = None
    rating: RatingField = None
    tags: Optional[str] = None


class ReferenceAssetRead(ReferenceAssetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
