# AI Model Studio — Technical Audit

> **Audit scope:** static analysis of repository structure and configuration files.
> No code was executed during this audit.

---

## 1. Project Structure

```
AI-Model-Studio/
├── README.md
├── package.json                        # Root scripts + Tauri CLI devDep
├── backend/
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   ├── alembic.ini
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── characters.py
│   │   │   ├── media.py
│   │   │   ├── planner.py
│   │   │   ├── prompts.py
│   │   │   ├── references.py
│   │   │   └── tasks.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── character.py
│   │   │   ├── consistency_profile.py
│   │   │   ├── content_plan_item.py
│   │   │   ├── generation_task.py
│   │   │   ├── media_asset.py
│   │   │   ├── prompt_template.py
│   │   │   └── reference_asset.py
│   │   ├── schemas/
│   │   │   ├── character.py
│   │   │   ├── consistency_profile.py
│   │   │   ├── content_plan_item.py
│   │   │   ├── generation_task.py
│   │   │   ├── media_asset.py
│   │   │   ├── prompt_template.py
│   │   │   └── reference_asset.py
│   │   ├── services/
│   │   │   └── file_service.py
│   │   └── utils/
│   │       └── file_utils.py
│   ├── backend.spec                    # PyInstaller spec
│   ├── requirements.txt
│   ├── run_backend.py                  # Packaged entry point
│   ├── storage/                        # Uploaded files (gitignored)
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── globals.css
│   │   ├── favicon.ico
│   │   ├── fonts/
│   │   ├── characters/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Server wrapper + generateStaticParams
│   │   │       └── CharacterDetailClient.tsx
│   │   ├── media/
│   │   │   └── page.tsx
│   │   ├── planner/
│   │   │   └── page.tsx
│   │   ├── prompts/
│   │   │   └── page.tsx
│   │   ├── references/
│   │   │   └── page.tsx
│   │   └── tasks/
│   │       └── page.tsx
│   ├── components/
│   │   ├── AppSidebar.tsx
│   │   ├── CharacterForm.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaGrid.tsx
│   │   ├── PromptEditor.tsx
│   │   ├── ReferenceUploadZone.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── TaskForm.tsx
│   │   └── ui/                         # shadcn/ui component library
│   ├── lib/
│   │   ├── api.ts                      # Typed API client
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── next.config.mjs
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── .env.example
├── scripts/
│   └── build-backend.js                # PyInstaller build + sidecar placement
└── src-tauri/
    ├── src/
    │   ├── main.rs
    │   └── lib.rs                      # Sidecar spawn + lifecycle
    ├── binaries/
    │   └── .gitkeep                    # Sidecar binary placed here at build time
    ├── capabilities/
    │   └── default.json                # Tauri v2 ACL permissions
    ├── gen/
    │   └── schemas/
    ├── build.rs
    ├── Cargo.toml
    └── tauri.conf.json
```

---

## 2. Frontend Analysis

### Configuration — `frontend/next.config.mjs`

```js
const nextConfig = {
  output: 'export',       // ✅ Static HTML export enabled
  trailingSlash: true,    // ✅ Required for file-based routing on disk
  images: {
    unoptimized: true,    // ✅ Required: Next.js image optimization is server-only
  },
};
```

| Question | Answer |
|----------|--------|
| Is Next.js configured for static export? | **Yes** — `output: 'export'` is present |
| Is `output: 'export'` present? | **Yes** |
| Where is the build output folder? | `frontend/out/` (Next.js default for static export) |
| Incompatible features? | None detected — all pages use `"use client"` or server components with no server-only APIs |

### Dynamic Route Compatibility

`frontend/app/characters/[id]/page.tsx` contains a dynamic segment that would normally be incompatible with static export. It is handled correctly:

```ts
// page.tsx
export function generateStaticParams() {
  return [{ id: "0" }];   // Placeholder so Next.js 15 generates the route shell
}
export default function Page() {
  return <CharacterDetailClient />;
}
```

The actual data is fetched client-side inside `CharacterDetailClient.tsx`, making the route fully compatible with static export.

### `frontend/package.json` Scripts

| Script | Command |
|--------|---------|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `next lint` |

**Runtime version:** Next.js 15.5.12 (React 18)

### API URL Configuration

`frontend/lib/api.ts`:

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
```

- In development: reads from `frontend/.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:8000`).
- In the packaged desktop app: the variable is not set at build time, so the fallback `http://localhost:8000` is used — which is exactly where the Tauri sidecar listens. ✅

---

## 3. Backend Analysis

### Entry Points

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI application factory |
| `backend/run_backend.py` | PyInstaller-aware entry point; runs uvicorn directly |

### How the Server Starts

**Development:**
```bash
uvicorn app.main:app --reload --port 8000
```

**Packaged (via `run_backend.py`):**
```python
uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info")
```

### Port

**8000** (hardcoded in `run_backend.py`; matches the frontend API URL fallback).

### SQLite Configuration (`backend/app/config.py`)

```python
class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./studio.db"
    ...
```

- Default path: `studio.db` relative to the working directory.
- In the desktop app, Tauri sets `DATABASE_URL` to an absolute path inside the OS user-data directory before spawning the sidecar:
  ```rust
  let db_url = format!("sqlite:///{}", db_path.to_string_lossy().replace('\\', '/'));
  // db_path = <AppDataDir>/studio.db
  ```

### Storage Directory (`backend/app/config.py`)

```python
@property
def storage_path(self) -> Path:
    if self.STORAGE_DIR:
        return Path(self.STORAGE_DIR)
    return Path(__file__).parent.parent / "storage"   # backend/storage/
```

- In development: defaults to `backend/storage/`.
- In the desktop app, Tauri sets `STORAGE_DIR` to `<AppDataDir>/storage/` before spawning the sidecar.

### CORS

`CORS_ORIGINS` defaults to `"*"`. In the packaged app, Tauri sets it to `"*"` explicitly, which is acceptable because the app is not exposed to the internet.

---

## 4. PyInstaller Status

### Spec File

**`backend/backend.spec`** — present and complete.

### Build Command

```bash
cd backend
pyinstaller backend.spec --clean
```

Run automatically via:
```bash
npm run build:backend
# which runs: node scripts/build-backend.js
```

### What `scripts/build-backend.js` Does

1. Detects the current platform and CPU architecture.
2. Runs `pyinstaller backend.spec --clean` inside `backend/`.
3. Copies the resulting binary from `backend/dist/backend[.exe]` to `src-tauri/binaries/backend-<target-triple>[.exe]`.
4. Sets executable permissions on non-Windows systems.

### Output File

| Platform | File |
|----------|------|
| Windows x64 | `src-tauri/binaries/backend-x86_64-pc-windows-msvc.exe` |
| Windows ARM64 | `src-tauri/binaries/backend-aarch64-pc-windows-msvc.exe` |
| macOS x64 | `src-tauri/binaries/backend-x86_64-apple-darwin` |
| macOS ARM64 | `src-tauri/binaries/backend-aarch64-apple-darwin` |
| Linux x64 | `src-tauri/binaries/backend-x86_64-unknown-linux-gnu` |
| Linux ARM64 | `src-tauri/binaries/backend-aarch64-unknown-linux-gnu` |

The binary is a self-contained executable that includes the FastAPI app, uvicorn, SQLAlchemy, Alembic, Pillow, and all other Python dependencies.

---

## 5. Tauri Configuration

### `src-tauri/tauri.conf.json`

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "AI Model Studio",
  "version": "1.0.0",
  "identifier": "com.aimodelstudio.app",
  "build": {
    "frontendDist": "../frontend/out"
  },
  "app": {
    "windows": [
      {
        "title": "AI Model Studio",
        "width": 1400,
        "height": 900,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": { "csp": null }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [],
    "externalBin": [
      "binaries/backend"
    ]
  }
}
```

| Question | Answer |
|----------|--------|
| Does `tauri.conf.json` exist? | **Yes** |
| Frontend dist path | `../frontend/out` — the Next.js static export output ✅ |
| Backend as sidecar? | **Yes** — declared in `bundle.externalBin: ["binaries/backend"]` ✅ |
| Launch command | Tauri v2 Shell plugin (`tauri-plugin-shell`) via `app.shell().sidecar("backend")` |

### Capabilities — `src-tauri/capabilities/default.json`

```json
{
  "permissions": [
    "core:default",
    {
      "identifier": "shell:allow-execute",
      "allow": [{ "name": "backend", "sidecar": true }]
    },
    "shell:allow-kill"
  ]
}
```

Required Tauri v2 ACL permissions are correctly set for spawning and killing the sidecar.

### How the Desktop App Starts the Backend — `src-tauri/src/lib.rs`

```rust
.setup(|app| {
    // Resolve OS user-data directory
    let app_data_dir = app.path().app_data_dir()?;
    let storage_dir = app_data_dir.join("storage");
    let db_path = app_data_dir.join("studio.db");

    // Build SQLite URL
    let db_url = format!("sqlite:///{}", db_path.to_string_lossy().replace('\\', '/'));

    // Spawn backend sidecar with environment variables
    let (_rx, child) = app.shell()
        .sidecar("backend")?
        .env("DATABASE_URL", &db_url)
        .env("STORAGE_DIR", storage_dir.to_string_lossy().as_ref())
        .env("CORS_ORIGINS", "*")
        .spawn()?;

    // Wait up to 30 s for FastAPI to be ready
    wait_for_backend();
    Ok(())
})
```

The sidecar is killed automatically when the last window closes (`RunEvent::ExitRequested`).

---

## 6. Build Pipeline

### Full Build — Step by Step

```bash
# Step 1 — Install root devDependencies (includes Tauri CLI)
npm install

# Step 2 — Build the FastAPI backend as a standalone binary
#   Requires: Python 3.10+, pyinstaller
#   Output: src-tauri/binaries/backend-<target-triple>[.exe]
npm run build:backend

# Step 3 — Build the Next.js frontend as static files
#   Output: frontend/out/
npm run build:frontend

# Step 4 — Bundle Tauri desktop installer
#   Reads: frontend/out/ + src-tauri/binaries/backend-*
#   Output: src-tauri/target/release/bundle/
npm run build:desktop
```

> **One-shot command** (step 3 is included inside `build:desktop`):
> ```bash
> npm run build:backend && npm run build:desktop
> ```

### Root `package.json` Scripts

| Script | Command |
|--------|---------|
| `dev:backend` | `cd backend && uvicorn app.main:app --reload --port 8000` |
| `dev:frontend` | `cd frontend && npm run dev` |
| `build:backend` | `node scripts/build-backend.js` |
| `build:frontend` | `cd frontend && npm run build` |
| `build:desktop` | `npm run build:frontend && tauri build` |
| `tauri` | `tauri` |

---

## 7. Development Mode

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

Or from the root:

```bash
npm run dev:backend
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# App available at http://localhost:3000
```

Or from the root:

```bash
npm run dev:frontend
```

### Desktop Dev (Tauri)

Tauri dev mode serves the frontend from `frontend/out/` (static) or via `devUrl`. A backend binary must be built first:

```bash
npm run build:backend   # one-time
npm run tauri -- dev
```

---

## 8. Final Artifact

### What is Produced

After running the full build pipeline, Tauri produces a native installer/executable in:

```
src-tauri/target/release/bundle/
```

Exact sub-directories depend on the target platform:

| Platform | Bundle type | Typical output |
|----------|-------------|----------------|
| Windows | `.msi` and/or `.exe` (NSIS) | `bundle/msi/"AI Model Studio_1.0.0_x64.msi"` |
| macOS | `.dmg` and/or `.app` | `bundle/dmg/"AI Model Studio_1.0.0_x64.dmg"` |
| Linux | `.deb`, `.rpm`, `.AppImage` | `bundle/deb/ai-model-studio_1.0.0_amd64.deb` |

> **Note:** Windows and macOS bundle filenames contain spaces because `productName` in `tauri.conf.json` is `"AI Model Studio"`. Quote these paths when referencing them in shell scripts.

The bundle includes:
- The Tauri/Rust shell (window manager, IPC)
- The Next.js static frontend (bundled as assets)
- The Python backend binary sidecar (`backend-<triple>[.exe]`)

No Python runtime or Node.js is required on the end-user machine.

---

## 9. Potential Issues

| # | Area | Issue | Severity | Status |
|---|------|-------|----------|--------|
| 1 | Frontend | `generateStaticParams` returns a placeholder `{ id: "0" }` for `characters/[id]`. The ID never exists in the DB but is required by Next.js 15's static export. Navigation works at runtime via client-side fetching. | Low | ✅ Handled correctly |
| 2 | Frontend | `"use client"` pages perform API calls on every render. There is no request caching or SWR/React Query layer. | Low | ℹ️ Acceptable for an MVP |
| 3 | Backend | `CORS_ORIGINS` defaults to `"*"`. Acceptable for a local desktop app, but would need tightening for any networked or multi-user deployment. | Low | ℹ️ Acceptable for desktop |
| 4 | Build | `build:desktop` (`npm run build:frontend && tauri build`) does **not** automatically run `build:backend`. If the backend binary is missing from `src-tauri/binaries/`, `tauri build` will succeed but the packaged app will fail to start. | Medium | ⚠️ See note below |
| 5 | Build | The `backend.spec` uses `upx=True` for compression. UPX is not installed by default on all CI environments and may fail silently or trigger false-positive anti-virus alerts on Windows. | Low | ℹ️ Monitor on CI |
| 6 | Storage | In development mode, uploaded files are stored in `backend/storage/` which is gitignored. There is no backup or sync mechanism. | Low | ℹ️ Acceptable for local use |
| 7 | Tauri | `security.csp` is set to `null` (disabled). This is acceptable for a local app with no external web content, but should be reviewed before shipping a version that loads remote URLs. | Low | ℹ️ Acceptable for desktop |
| 8 | Backend startup | `wait_for_backend()` polls `127.0.0.1:8000` for up to 30 seconds (1 attempt/second). On very slow machines or with large SQLite migration sets, this could time out. | Low | ℹ️ Acceptable for MVP |

### Note on Issue #4 — Missing `build:backend` in `build:desktop`

The complete one-shot build command documented in the README is:

```bash
npm run build:backend && npm run build:desktop
```

This correctly runs all three steps. Running `npm run build:desktop` alone is only safe if the backend binary has already been built and placed in `src-tauri/binaries/`. This is a documentation concern rather than a code bug.

---

*Audit generated: 2026-03-10*
