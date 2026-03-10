from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    character_id = Column(
        Integer, ForeignKey("characters.id", ondelete="CASCADE"), nullable=False
    )
    generation_task_id = Column(
        Integer,
        ForeignKey("generation_tasks.id", ondelete="SET NULL"),
        nullable=True,
    )
    asset_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    preview_path = Column(String, nullable=True)
    thumbnail_path = Column(String, nullable=True)
    caption_draft = Column(String, nullable=True)
    quality_score = Column(Integer, nullable=True)
    consistency_score = Column(Integer, nullable=True)
    publish_status = Column(String, nullable=False, default="draft")
    is_best = Column(Boolean, default=False, nullable=False)
    notes = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    character = relationship("Character", back_populates="media_assets")
    generation_task = relationship("GenerationTask", back_populates="media_assets")
    content_plan_items = relationship("ContentPlanItem", back_populates="media_asset")
