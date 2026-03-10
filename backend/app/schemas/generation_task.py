from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class GenerationTaskBase(BaseModel):
    character_id: int
    task_type: str
    title: str
    description: Optional[str] = None
    status: str = "queued"
    engine: str = "manual"
    input_refs_json: Optional[str] = None
    prompt_template_id: Optional[int] = None
    settings_json: Optional[str] = None
    result_count_expected: int = 0
    result_count_actual: int = 0
    error_message: Optional[str] = None


class GenerationTaskCreate(GenerationTaskBase):
    pass


class GenerationTaskUpdate(BaseModel):
    task_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    engine: Optional[str] = None
    input_refs_json: Optional[str] = None
    prompt_template_id: Optional[int] = None
    settings_json: Optional[str] = None
    result_count_expected: Optional[int] = None
    result_count_actual: Optional[int] = None
    error_message: Optional[str] = None


class GenerationTaskRead(GenerationTaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
