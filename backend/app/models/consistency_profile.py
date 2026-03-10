from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class ConsistencyProfile(Base):
    __tablename__ = "consistency_profiles"
    __table_args__ = (UniqueConstraint("character_id", name="uq_consistency_character"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    character_id = Column(
        Integer,
        ForeignKey("characters.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    face_shape = Column(String, nullable=True)
    eye_shape = Column(String, nullable=True)
    nose_shape = Column(String, nullable=True)
    lip_shape = Column(String, nullable=True)
    skin_tone = Column(String, nullable=True)
    hair_color = Column(String, nullable=True)
    hair_style = Column(String, nullable=True)
    body_type = Column(String, nullable=True)
    signature_features = Column(String, nullable=True)
    do_not_change = Column(String, nullable=True)
    master_reference_ids_json = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    character = relationship("Character", back_populates="consistency_profile")
