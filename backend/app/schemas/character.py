import re
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, model_validator, Field


class CharacterBase(BaseModel):
    name: str
    slug: Optional[str] = None
    archetype: Optional[str] = None
    age_style: Optional[str] = None
    nationality_style: Optional[str] = None
    tone_of_voice: Optional[str] = None
    bio_short: Optional[str] = None
    bio_full: Optional[str] = None
    core_traits: Optional[str] = None
    forbidden_traits: Optional[str] = None
    style_notes: Optional[str] = None
    status: str = "draft"


class CharacterCreate(CharacterBase):
    @model_validator(mode="after")
    def generate_slug(self) -> "CharacterCreate":
        if not self.slug:
            self.slug = re.sub(r"[^a-z0-9]+", "-", self.name.lower()).strip("-")
        return self


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    archetype: Optional[str] = None
    age_style: Optional[str] = None
    nationality_style: Optional[str] = None
    tone_of_voice: Optional[str] = None
    bio_short: Optional[str] = None
    bio_full: Optional[str] = None
    core_traits: Optional[str] = None
    forbidden_traits: Optional[str] = None
    style_notes: Optional[str] = None
    status: Optional[str] = None


class CharacterRead(CharacterBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
