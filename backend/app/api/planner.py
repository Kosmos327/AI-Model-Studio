from datetime import datetime, date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.content_plan_item import ContentPlanItem
from app.schemas.content_plan_item import (
    ContentPlanItemCreate,
    ContentPlanItemUpdate,
    ContentPlanItemRead,
)

router = APIRouter(prefix="/planner", tags=["planner"])


@router.get("", response_model=List[ContentPlanItemRead])
def list_planner(
    character_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(ContentPlanItem)
    if character_id is not None:
        q = q.filter(ContentPlanItem.character_id == character_id)
    if status:
        q = q.filter(ContentPlanItem.status == status)
    if platform:
        q = q.filter(ContentPlanItem.platform == platform)
    if start_date:
        q = q.filter(ContentPlanItem.scheduled_for >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        q = q.filter(ContentPlanItem.scheduled_for <= datetime.combine(end_date, datetime.max.time()))
    return q.order_by(ContentPlanItem.scheduled_for.asc()).all()


@router.post("", response_model=ContentPlanItemRead, status_code=status.HTTP_201_CREATED)
def create_plan_item(payload: ContentPlanItemCreate, db: Session = Depends(get_db)):
    obj = ContentPlanItem(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{item_id}", response_model=ContentPlanItemRead)
def get_plan_item(item_id: int, db: Session = Depends(get_db)):
    obj = db.query(ContentPlanItem).filter(ContentPlanItem.id == item_id).first()
    if not obj:
        raise HTTPException(404, "Content plan item not found")
    return obj


@router.put("/{item_id}", response_model=ContentPlanItemRead)
def update_plan_item(
    item_id: int, payload: ContentPlanItemUpdate, db: Session = Depends(get_db)
):
    obj = db.query(ContentPlanItem).filter(ContentPlanItem.id == item_id).first()
    if not obj:
        raise HTTPException(404, "Content plan item not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan_item(item_id: int, db: Session = Depends(get_db)):
    obj = db.query(ContentPlanItem).filter(ContentPlanItem.id == item_id).first()
    if not obj:
        raise HTTPException(404, "Content plan item not found")
    db.delete(obj)
    db.commit()
