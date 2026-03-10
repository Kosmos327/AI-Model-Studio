# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec for the AI Model Studio backend.
#
# Build with:
#   cd backend
#   pyinstaller backend.spec --clean
#
# The resulting executable is placed at dist/backend[.exe].

block_cipher = None

a = Analysis(
    ["run_backend.py"],
    pathex=["."],
    binaries=[],
    datas=[
        ("alembic", "alembic"),
        ("alembic.ini", "."),
    ],
    hiddenimports=[
        # uvicorn internals
        "uvicorn",
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        # web framework
        "fastapi",
        "fastapi.responses",
        "fastapi.staticfiles",
        "starlette",
        "starlette.staticfiles",
        # database
        "sqlalchemy",
        "sqlalchemy.dialects.sqlite",
        "sqlalchemy.dialects.sqlite.pysqlite",
        # migrations
        "alembic",
        # validation
        "pydantic",
        "pydantic_settings",
        # file handling
        "aiofiles",
        "multipart",
        "multipart.multipart",
        # image processing
        "PIL",
        "PIL.Image",
        "PIL.ImageOps",
        # app modules
        "app",
        "app.main",
        "app.config",
        "app.db",
        "app.db.session",
        "app.db.base",
        "app.models",
        "app.models.character",
        "app.models.consistency_profile",
        "app.models.content_plan_item",
        "app.models.generation_task",
        "app.models.media_asset",
        "app.models.prompt_template",
        "app.models.reference_asset",
        "app.api",
        "app.api.characters",
        "app.api.references",
        "app.api.prompts",
        "app.api.tasks",
        "app.api.media",
        "app.api.planner",
        "app.schemas",
        "app.services",
        "app.services.file_service",
        "app.utils",
        "app.utils.file_utils",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
