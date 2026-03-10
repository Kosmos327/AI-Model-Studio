import uuid
from pathlib import Path
from fastapi import HTTPException

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm"}


def validate_file_extension(filename: str, asset_type: str) -> str:
    """Validate file extension and return it."""
    ext = Path(filename).suffix.lower()
    if asset_type == "image":
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(400, f"Invalid image extension: {ext}")
    elif asset_type == "video":
        if ext not in ALLOWED_VIDEO_EXTENSIONS:
            raise HTTPException(400, f"Invalid video extension: {ext}")
    return ext


def safe_path_join(base: Path, *parts: str) -> Path:
    """Join paths safely, preventing path traversal."""
    result = base
    for part in parts:
        clean = part.lstrip("/").lstrip(".")
        result = result / clean
    try:
        result.resolve().relative_to(base.resolve())
    except ValueError:
        raise HTTPException(400, "Invalid file path")
    return result


def generate_unique_filename(original_filename: str) -> str:
    ext = Path(original_filename).suffix.lower()
    return f"{uuid.uuid4()}{ext}"
