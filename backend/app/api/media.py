from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.media_asset import MediaAsset
from app.schemas.media_asset import MediaAssetCreate, MediaAssetUpdate, MediaAssetRead
from app.services.file_service import save_media_file

router = APIRouter(prefix="/media", tags=["media"])


@router.get("", response_model=List[MediaAssetRead])
def list_media(
    character_id: Optional[int] = Query(None),
    asset_type: Optional[str] = Query(None),
    publish_status: Optional[str] = Query(None),
    is_best: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(MediaAsset)
    if character_id is not None:
        q = q.filter(MediaAsset.character_id == character_id)
    if asset_type:
        q = q.filter(MediaAsset.asset_type == asset_type)
    if publish_status:
        q = q.filter(MediaAsset.publish_status == publish_status)
    if is_best is not None:
        q = q.filter(MediaAsset.is_best == is_best)
    return q.order_by(MediaAsset.created_at.desc()).all()


@router.post("/upload", response_model=MediaAssetRead, status_code=status.HTTP_201_CREATED)
def upload_media(
    character_id: int = Form(...),
    asset_type: str = Form(...),
    caption_draft: Optional[str] = Form(None),
    quality_score: Optional[int] = Form(None),
    consistency_score: Optional[int] = Form(None),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    file_path, preview_path = save_media_file(character_id, file, asset_type)
    obj = MediaAsset(
        character_id=character_id,
        asset_type=asset_type,
        file_path=file_path,
        preview_path=preview_path,
        caption_draft=caption_draft,
        quality_score=quality_score,
        consistency_score=consistency_score,
        notes=notes,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("", response_model=MediaAssetRead, status_code=status.HTTP_201_CREATED)
def create_media(payload: MediaAssetCreate, db: Session = Depends(get_db)):
    obj = MediaAsset(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/{media_id}", response_model=MediaAssetRead)
def get_media(media_id: int, db: Session = Depends(get_db)):
    obj = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not obj:
        raise HTTPException(404, "Media asset not found")
    return obj


@router.put("/{media_id}", response_model=MediaAssetRead)
def update_media(
    media_id: int, payload: MediaAssetUpdate, db: Session = Depends(get_db)
):
    obj = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not obj:
        raise HTTPException(404, "Media asset not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(media_id: int, db: Session = Depends(get_db)):
    obj = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not obj:
        raise HTTPException(404, "Media asset not found")
    db.delete(obj)
    db.commit()
