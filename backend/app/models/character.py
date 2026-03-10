from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    archetype = Column(String, nullable=True)
    age_style = Column(String, nullable=True)
    nationality_style = Column(String, nullable=True)
    tone_of_voice = Column(String, nullable=True)
    bio_short = Column(String, nullable=True)
    bio_full = Column(String, nullable=True)
    core_traits = Column(String, nullable=True)
    forbidden_traits = Column(String, nullable=True)
    style_notes = Column(String, nullable=True)
    status = Column(String, nullable=False, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    references = relationship(
        "ReferenceAsset", back_populates="character", cascade="all, delete-orphan"
    )
    prompt_templates = relationship(
        "PromptTemplate", back_populates="character", cascade="all, delete-orphan"
    )
    generation_tasks = relationship(
        "GenerationTask", back_populates="character", cascade="all, delete-orphan"
    )
    media_assets = relationship(
        "MediaAsset", back_populates="character", cascade="all, delete-orphan"
    )
    content_plan_items = relationship(
        "ContentPlanItem", back_populates="character", cascade="all, delete-orphan"
    )
    consistency_profile = relationship(
        "ConsistencyProfile",
        back_populates="character",
        uselist=False,
        cascade="all, delete-orphan",
    )
