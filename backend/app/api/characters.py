from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.character import Character
from app.models.generation_task import GenerationTask
from app.models.media_asset import MediaAsset
from app.models.content_plan_item import ContentPlanItem
from app.models.consistency_profile import ConsistencyProfile
from app.schemas.character import CharacterCreate, CharacterUpdate, CharacterRead
from app.schemas.consistency_profile import (
    ConsistencyProfileCreate,
    ConsistencyProfileUpdate,
    ConsistencyProfileRead,
)

router = APIRouter(prefix="/characters", tags=["characters"])


@router.get("", response_model=List[CharacterRead])
def list_characters(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Character)
    if status:
        q = q.filter(Character.status == status)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (Character.name.ilike(like)) | (Character.bio_short.ilike(like))
        )
    return q.order_by(Character.created_at.desc()).all()


@router.post("", response_model=CharacterRead, status_code=status.HTTP_201_CREATED)
def create_character(payload: CharacterCreate, db: Session = Depends(get_db)):
    existing = db.query(Character).filter(Character.slug == payload.slug).first()
    if existing:
        raise HTTPException(409, f"Slug '{payload.slug}' already exists")
    obj = Character(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{character_id}", response_model=CharacterRead)
def get_character(character_id: int, db: Session = Depends(get_db)):
    obj = db.query(Character).filter(Character.id == character_id).first()
    if not obj:
        raise HTTPException(404, "Character not found")
    return obj


@router.put("/{character_id}", response_model=CharacterRead)
def update_character(
    character_id: int, payload: CharacterUpdate, db: Session = Depends(get_db)
):
    obj = db.query(Character).filter(Character.id == character_id).first()
    if not obj:
        raise HTTPException(404, "Character not found")
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] != obj.slug:
        conflict = (
            db.query(Character)
            .filter(Character.slug == data["slug"], Character.id != character_id)
            .first()
        )
        if conflict:
            raise HTTPException(409, f"Slug '{data['slug']}' already exists")
    for key, value in data.items():
        setattr(obj, key, value)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_character(character_id: int, db: Session = Depends(get_db)):
    obj = db.query(Character).filter(Character.id == character_id).first()
    if not obj:
        raise HTTPException(404, "Character not found")
    db.delete(obj)
    db.commit()


# ── Consistency Profile ────────────────────────────────────────────────────────

@router.get("/{character_id}/consistency", response_model=ConsistencyProfileRead)
def get_consistency(character_id: int, db: Session = Depends(get_db)):
    _require_character(character_id, db)
    profile = (
        db.query(ConsistencyProfile)
        .filter(ConsistencyProfile.character_id == character_id)
        .first()
    )
    if not profile:
        raise HTTPException(404, "Consistency profile not found")
    return profile


@router.post(
    "/{character_id}/consistency",
    response_model=ConsistencyProfileRead,
    status_code=status.HTTP_201_CREATED,
)
def create_consistency(
    character_id: int,
    payload: ConsistencyProfileCreate,
    db: Session = Depends(get_db),
):
    _require_character(character_id, db)
    existing = (
        db.query(ConsistencyProfile)
        .filter(ConsistencyProfile.character_id == character_id)
        .first()
    )
    if existing:
        raise HTTPException(409, "Consistency profile already exists for this character")
    obj = ConsistencyProfile(character_id=character_id, **payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{character_id}/consistency", response_model=ConsistencyProfileRead)
def update_consistency(
    character_id: int,
    payload: ConsistencyProfileUpdate,
    db: Session = Depends(get_db),
):
    _require_character(character_id, db)
    obj = (
        db.query(ConsistencyProfile)
        .filter(ConsistencyProfile.character_id == character_id)
        .first()
    )
    if not obj:
        raise HTTPException(404, "Consistency profile not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return obj


# ── Dashboard ─────────────────────────────────────────────────────────────────

dashboard_router = APIRouter(tags=["dashboard"])


@dashboard_router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    now = datetime.utcnow()

    recent_characters = (
        db.query(Character).order_by(Character.created_at.desc()).limit(5).all()
    )
    recent_tasks = (
        db.query(GenerationTask)
        .order_by(GenerationTask.created_at.desc())
        .limit(5)
        .all()
    )
    recent_media = (
        db.query(MediaAsset).order_by(MediaAsset.created_at.desc()).limit(5).all()
    )
    upcoming_content = (
        db.query(ContentPlanItem)
        .filter(
            ContentPlanItem.scheduled_for >= now,
            ContentPlanItem.status == "planned",
        )
        .order_by(ContentPlanItem.scheduled_for.asc())
        .limit(5)
        .all()
    )

    total_characters = db.query(Character).count()
    total_media = db.query(MediaAsset).count()
    total_tasks = db.query(GenerationTask).count()
    pending_tasks = (
        db.query(GenerationTask)
        .filter(GenerationTask.status.in_(["queued", "running"]))
        .count()
    )

    from app.schemas.character import CharacterRead
    from app.schemas.generation_task import GenerationTaskRead
    from app.schemas.media_asset import MediaAssetRead
    from app.schemas.content_plan_item import ContentPlanItemRead

    return {
        "recent_characters": [CharacterRead.model_validate(c) for c in recent_characters],
        "recent_tasks": [GenerationTaskRead.model_validate(t) for t in recent_tasks],
        "recent_media": [MediaAssetRead.model_validate(m) for m in recent_media],
        "upcoming_content": [ContentPlanItemRead.model_validate(i) for i in upcoming_content],
        "stats": {
            "total_characters": total_characters,
            "total_media": total_media,
            "total_tasks": total_tasks,
            "pending_tasks": pending_tasks,
        },
    }


def _require_character(character_id: int, db: Session) -> Character:
    obj = db.query(Character).filter(Character.id == character_id).first()
    if not obj:
        raise HTTPException(404, "Character not found")
    return obj
