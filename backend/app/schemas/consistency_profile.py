from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ConsistencyProfileBase(BaseModel):
    face_shape: Optional[str] = None
    eye_shape: Optional[str] = None
    nose_shape: Optional[str] = None
    lip_shape: Optional[str] = None
    skin_tone: Optional[str] = None
    hair_color: Optional[str] = None
    hair_style: Optional[str] = None
    body_type: Optional[str] = None
    signature_features: Optional[str] = None
    do_not_change: Optional[str] = None
    master_reference_ids_json: Optional[str] = None


class ConsistencyProfileCreate(ConsistencyProfileBase):
    pass


class ConsistencyProfileUpdate(ConsistencyProfileBase):
    pass


class ConsistencyProfileRead(ConsistencyProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    character_id: int
    created_at: datetime
    updated_at: datetime
