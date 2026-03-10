from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class GenerationTask(Base):
    __tablename__ = "generation_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    character_id = Column(
        Integer, ForeignKey("characters.id", ondelete="CASCADE"), nullable=False
    )
    task_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, nullable=False, default="queued")
    engine = Column(String, nullable=False, default="manual")
    input_refs_json = Column(String, nullable=True)
    prompt_template_id = Column(
        Integer,
        ForeignKey("prompt_templates.id", ondelete="SET NULL"),
        nullable=True,
    )
    settings_json = Column(String, nullable=True)
    result_count_expected = Column(Integer, default=0, nullable=False)
    result_count_actual = Column(Integer, default=0, nullable=False)
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    character = relationship("Character", back_populates="generation_tasks")
    prompt_template = relationship("PromptTemplate")
    media_assets = relationship("MediaAsset", back_populates="generation_task")
