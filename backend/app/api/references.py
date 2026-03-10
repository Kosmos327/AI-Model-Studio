from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.reference_asset import ReferenceAsset
from app.schemas.reference_asset import (
    ReferenceAssetCreate,
    ReferenceAssetUpdate,
    ReferenceAssetRead,
)
from app.services.file_service import save_reference_file

router = APIRouter(prefix="/references", tags=["references"])


@router.get("", response_model=List[ReferenceAssetRead])
def list_references(
    character_id: Optional[int] = Query(None),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_master: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(ReferenceAsset)
    if character_id is not None:
        q = q.filter(ReferenceAsset.character_id == character_id)
    if type:
        q = q.filter(ReferenceAsset.type == type)
    if category:
        q = q.filter(ReferenceAsset.category == category)
    if is_master is not None:
        q = q.filter(ReferenceAsset.is_master == is_master)
    return q.order_by(ReferenceAsset.created_at.desc()).all()


@router.post("/upload", response_model=ReferenceAssetRead, status_code=status.HTTP_201_CREATED)
def upload_reference(
    character_id: int = Form(...),
    type: str = Form(...),
    category: str = Form(...),
    is_master: bool = Form(False),
    notes: Optional[str] = Form(None),
    rating: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    file_path, preview_path = save_reference_file(character_id, file, type)
    obj = ReferenceAsset(
        character_id=character_id,
        type=type,
        category=category,
        file_path=file_path,
        preview_path=preview_path,
        notes=notes,
        is_master=is_master,
        rating=rating,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("", response_model=ReferenceAssetRead, status_code=status.HTTP_201_CREATED)
def create_reference(payload: ReferenceAssetCreate, db: Session = Depends(get_db)):
    obj = ReferenceAsset(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{reference_id}", response_model=ReferenceAssetRead)
def get_reference(reference_id: int, db: Session = Depends(get_db)):
    obj = db.query(ReferenceAsset).filter(ReferenceAsset.id == reference_id).first()
    if not obj:
        raise HTTPException(404, "Reference asset not found")
    return obj


@router.put("/{reference_id}", response_model=ReferenceAssetRead)
def update_reference(
    reference_id: int, payload: ReferenceAssetUpdate, db: Session = Depends(get_db)
):
    obj = db.query(ReferenceAsset).filter(ReferenceAsset.id == reference_id).first()
    if not obj:
        raise HTTPException(404, "Reference asset not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{reference_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reference(reference_id: int, db: Session = Depends(get_db)):
    obj = db.query(ReferenceAsset).filter(ReferenceAsset.id == reference_id).first()
    if not obj:
        raise HTTPException(404, "Reference asset not found")
    db.delete(obj)
    db.commit()
