from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class ContentPlanItem(Base):
    __tablename__ = "content_plan_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    character_id = Column(
        Integer, ForeignKey("characters.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String, nullable=False)
    platform = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    media_asset_id = Column(
        Integer,
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
    )
    scheduled_for = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="planned")
    caption_text = Column(String, nullable=True)
    hashtags = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    character = relationship("Character", back_populates="content_plan_items")
    media_asset = relationship("MediaAsset", back_populates="content_plan_items")
