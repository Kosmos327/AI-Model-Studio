import shutil
from pathlib import Path
from fastapi import UploadFile
from app.config import settings
from app.utils.file_utils import validate_file_extension, generate_unique_filename

try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

PREVIEW_MAX_SIZE = (400, 400)


def get_character_storage_path(character_id: int) -> Path:
    return settings.storage_path / "characters" / str(character_id)


def save_reference_file(
    character_id: int, file: UploadFile, asset_type: str
) -> tuple:
    """Save reference file and generate preview.

    Returns (file_path, preview_path) relative to storage root.
    """
    validate_file_extension(file.filename, asset_type)
    unique_name = generate_unique_filename(file.filename)

    char_path = get_character_storage_path(character_id)
    ref_dir = char_path / "references"
    ref_dir.mkdir(parents=True, exist_ok=True)

    file_path = ref_dir / unique_name
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    preview_rel = None
    if asset_type == "image" and PILLOW_AVAILABLE:
        preview_rel = _generate_preview(file_path, character_id)

    rel_file = str(file_path.relative_to(settings.storage_path))
    return rel_file, preview_rel


def save_media_file(
    character_id: int, file: UploadFile, asset_type: str
) -> tuple:
    """Save media file and generate preview.

    Returns (file_path, preview_path) relative to storage root.
    """
    validate_file_extension(file.filename, asset_type)
    unique_name = generate_unique_filename(file.filename)

    char_path = get_character_storage_path(character_id)
    if asset_type == "image":
        media_dir = char_path / "media" / "images"
    else:
        media_dir = char_path / "media" / "videos"
    media_dir.mkdir(parents=True, exist_ok=True)

    file_path = media_dir / unique_name
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    preview_rel = None
    if asset_type == "image" and PILLOW_AVAILABLE:
        preview_rel = _generate_preview(file_path, character_id)

    rel_file = str(file_path.relative_to(settings.storage_path))
    return rel_file, preview_rel


def _generate_preview(source_path: Path, character_id: int):
    """Generate a 400px preview image. Returns relative path from storage root or None."""
    try:
        from PIL import Image

        preview_dir = get_character_storage_path(character_id) / "previews"
        preview_dir.mkdir(parents=True, exist_ok=True)

        preview_name = f"prev_{source_path.stem}.jpg"
        preview_path = preview_dir / preview_name

        with Image.open(source_path) as img:
            img.thumbnail(PREVIEW_MAX_SIZE, Image.LANCZOS)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.save(preview_path, "JPEG", quality=85)

        return str(preview_path.relative_to(settings.storage_path))
    except Exception:
        return None


def delete_file_safe(relative_path: str) -> None:
    """Delete a file by its relative path from storage root."""
    if not relative_path:
        return
    full_path = settings.storage_path / relative_path
    try:
        if full_path.exists():
            full_path.unlink()
    except Exception:
        pass
