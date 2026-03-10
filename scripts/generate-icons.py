#!/usr/bin/env python3
"""
Generate placeholder icon files for the Tauri desktop app.

Produces:
  src-tauri/icons/32x32.png
  src-tauri/icons/128x128.png
  src-tauri/icons/128x128@2x.png   (256x256 pixels)
  src-tauri/icons/icon.png          (512x512, used on Linux)
  src-tauri/icons/icon.ico          (multi-size Windows icon)
  src-tauri/icons/icon.icns         (macOS, minimal stub)

Run from the repository root:
  python scripts/generate-icons.py
"""

import os
import struct
import zlib


# ---------------------------------------------------------------------------
# Minimal PNG encoder (no external dependencies)
# ---------------------------------------------------------------------------

def _crc32(data: bytes) -> int:
    return zlib.crc32(data) & 0xFFFFFFFF


def _make_chunk(chunk_type: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + chunk_type
        + data
        + struct.pack(">I", _crc32(chunk_type + data))
    )


def make_png(width: int, height: int, r: int, g: int, b: int) -> bytes:
    """Create a solid-colour RGB PNG with no external libraries."""
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)

    row = bytes([0]) + bytes([r, g, b] * width)   # filter=None + RGB pixels
    raw = row * height
    compressed = zlib.compress(raw)

    return (
        b"\x89PNG\r\n\x1a\n"
        + _make_chunk(b"IHDR", ihdr_data)
        + _make_chunk(b"IDAT", compressed)
        + _make_chunk(b"IEND", b"")
    )


# ---------------------------------------------------------------------------
# Minimal ICO encoder — uses embedded PNGs (Vista+ compatible)
# ---------------------------------------------------------------------------

def make_ico(png_entries: list) -> bytes:
    """
    Build an ICO file containing multiple PNG images.
    png_entries: list of (width, height, png_bytes)
    """
    count = len(png_entries)
    header = struct.pack("<HHH", 0, 1, count)   # reserved, type=1, count

    dir_entries = b""
    image_data = b""
    offset = 6 + 16 * count   # header + all directory entries

    for w, h, png in png_entries:
        dir_entries += struct.pack(
            "<BBBBHHII",
            w if w < 256 else 0,     # width  (0 means 256)
            h if h < 256 else 0,     # height (0 means 256)
            0,                        # color count
            0,                        # reserved
            1,                        # planes
            32,                       # bit count
            len(png),                 # size of image data
            offset,                   # offset to image data
        )
        image_data += png
        offset += len(png)

    return header + dir_entries + image_data


# ---------------------------------------------------------------------------
# Minimal ICNS stub for macOS (so tauri build doesn't error)
# ---------------------------------------------------------------------------

def make_icns_stub(png_512: bytes) -> bytes:
    """
    Build a minimal .icns file containing one ic09 (512x512 PNG) entry.
    """
    entry_type = b"ic09"
    entry_data = entry_type + struct.pack(">I", 8 + len(png_512)) + png_512
    total = 8 + len(entry_data)
    return b"icns" + struct.pack(">I", total) + entry_data


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

ICON_COLOUR = (59, 130, 246)   # Tailwind blue-500


def main():
    repo_root = os.path.join(os.path.dirname(__file__), "..")
    icons_dir = os.path.join(repo_root, "src-tauri", "icons")
    os.makedirs(icons_dir, exist_ok=True)

    r, g, b = ICON_COLOUR

    # PNG sizes
    sizes = {
        "32x32.png":       (32, 32),
        "128x128.png":     (128, 128),
        "128x128@2x.png":  (256, 256),
        "icon.png":        (512, 512),
    }

    pngs = {}
    for filename, (w, h) in sizes.items():
        data = make_png(w, h, r, g, b)
        pngs[(w, h)] = data
        path = os.path.join(icons_dir, filename)
        with open(path, "wb") as f:
            f.write(data)
        print(f"  wrote {path}")

    # ICO (16, 32, 48, 256)
    ico_entries = []
    for w, h in [(16, 16), (32, 32), (48, 48), (256, 256)]:
        png = pngs.get((w, h)) or make_png(w, h, r, g, b)
        ico_entries.append((w, h, png))

    ico_path = os.path.join(icons_dir, "icon.ico")
    with open(ico_path, "wb") as f:
        f.write(make_ico(ico_entries))
    print(f"  wrote {ico_path}")

    # ICNS stub
    icns_path = os.path.join(icons_dir, "icon.icns")
    with open(icns_path, "wb") as f:
        f.write(make_icns_stub(pngs[(512, 512)]))
    print(f"  wrote {icns_path}")

    print("Icon generation complete.")


if __name__ == "__main__":
    main()
