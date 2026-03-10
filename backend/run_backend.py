"""
Entry point for the packaged desktop backend.

PyInstaller freezes this script into a standalone executable.
When running frozen, sys._MEIPASS contains the extracted bundle.
Environment variables DATABASE_URL and STORAGE_DIR are set by Tauri
before launching this process.
"""

import sys
import os
import multiprocessing

# When running as a PyInstaller bundle, ensure bundled packages are importable.
if getattr(sys, "frozen", False):
    bundle_dir = sys._MEIPASS  # type: ignore[attr-defined]
    sys.path.insert(0, bundle_dir)
    # Set working directory so relative asset references resolve correctly.
    os.chdir(bundle_dir)

if __name__ == "__main__":
    multiprocessing.freeze_support()

    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        log_level="info",
    )
