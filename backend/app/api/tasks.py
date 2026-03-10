from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.generation_task import GenerationTask
from app.schemas.generation_task import (
    GenerationTaskCreate,
    GenerationTaskUpdate,
    GenerationTaskRead,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[GenerationTaskRead])
def list_tasks(
    character_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    engine: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(GenerationTask)
    if character_id is not None:
        q = q.filter(GenerationTask.character_id == character_id)
    if status:
        q = q.filter(GenerationTask.status == status)
    if engine:
        q = q.filter(GenerationTask.engine == engine)
    return q.order_by(GenerationTask.created_at.desc()).all()


@router.post("", response_model=GenerationTaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: GenerationTaskCreate, db: Session = Depends(get_db)):
    obj = GenerationTask(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{task_id}", response_model=GenerationTaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)):
    obj = db.query(GenerationTask).filter(GenerationTask.id == task_id).first()
    if not obj:
        raise HTTPException(404, "Generation task not found")
    return obj


@router.put("/{task_id}", response_model=GenerationTaskRead)
def update_task(
    task_id: int, payload: GenerationTaskUpdate, db: Session = Depends(get_db)
):
    obj = db.query(GenerationTask).filter(GenerationTask.id == task_id).first()
    if not obj:
        raise HTTPException(404, "Generation task not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    obj = db.query(GenerationTask).filter(GenerationTask.id == task_id).first()
    if not obj:
        raise HTTPException(404, "Generation task not found")
    db.delete(obj)
    db.commit()
