from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PromptTemplateBase(BaseModel):
    character_id: Optional[int] = None
    title: str
    type: str
    category: str
    prompt_text: str
    negative_prompt: Optional[str] = None
    variables_json: Optional[str] = None
    notes: Optional[str] = None
    is_favorite: bool = False


class PromptTemplateCreate(PromptTemplateBase):
    pass


class PromptTemplateUpdate(BaseModel):
    character_id: Optional[int] = None
    title: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    prompt_text: Optional[str] = None
    negative_prompt: Optional[str] = None
    variables_json: Optional[str] = None
    notes: Optional[str] = None
    is_favorite: Optional[bool] = None


class PromptTemplateRead(PromptTemplateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
