from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.prompt_template import PromptTemplate
from app.schemas.prompt_template import (
    PromptTemplateCreate,
    PromptTemplateUpdate,
    PromptTemplateRead,
)
from datetime import datetime

router = APIRouter(prefix="/prompts", tags=["prompts"])


@router.get("", response_model=List[PromptTemplateRead])
def list_prompts(
    character_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_favorite: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(PromptTemplate)
    if character_id is not None:
        q = q.filter(PromptTemplate.character_id == character_id)
    if type:
        q = q.filter(PromptTemplate.type == type)
    if category:
        q = q.filter(PromptTemplate.category == category)
    if is_favorite is not None:
        q = q.filter(PromptTemplate.is_favorite == is_favorite)
    return q.order_by(PromptTemplate.created_at.desc()).all()


@router.post("", response_model=PromptTemplateRead, status_code=status.HTTP_201_CREATED)
def create_prompt(payload: PromptTemplateCreate, db: Session = Depends(get_db)):
    obj = PromptTemplate(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{prompt_id}", response_model=PromptTemplateRead)
def get_prompt(prompt_id: int, db: Session = Depends(get_db)):
    obj = db.query(PromptTemplate).filter(PromptTemplate.id == prompt_id).first()
    if not obj:
        raise HTTPException(404, "Prompt template not found")
    return obj


@router.put("/{prompt_id}", response_model=PromptTemplateRead)
def update_prompt(
    prompt_id: int, payload: PromptTemplateUpdate, db: Session = Depends(get_db)
):
    obj = db.query(PromptTemplate).filter(PromptTemplate.id == prompt_id).first()
    if not obj:
        raise HTTPException(404, "Prompt template not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt(prompt_id: int, db: Session = Depends(get_db)):
    obj = db.query(PromptTemplate).filter(PromptTemplate.id == prompt_id).first()
    if not obj:
        raise HTTPException(404, "Prompt template not found")
    db.delete(obj)
    db.commit()
