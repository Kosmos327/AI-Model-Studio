from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class ReferenceAsset(Base):
    __tablename__ = "reference_assets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    character_id = Column(
        Integer, ForeignKey("characters.id", ondelete="CASCADE"), nullable=False
    )
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    preview_path = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    is_master = Column(Boolean, default=False, nullable=False)
    rating = Column(Integer, nullable=True)
    tags = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    character = relationship("Character", back_populates="references")
