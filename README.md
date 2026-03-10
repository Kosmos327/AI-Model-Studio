# AI Model Studio

**AI Model Studio** is a local-first production management dashboard for AI-generated content. It helps you manage AI model characters, reference assets, prompt templates, generation tasks, a media library, and a content publishing plan — all in one place.

This is **not** a neural network or video editor. It's an **operational hub for your AI content pipeline**.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, SQLAlchemy, Pydantic v2, Alembic |
| Database | SQLite |
| File storage | Local filesystem (`backend/storage/`) |

---

## Project Structure

```
AI-Model-Studio/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py             # App entry point, router registration
│   │   ├── config.py           # Settings (env vars)
│   │   ├── db/                 # Database engine + session
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── api/                # FastAPI routers (endpoints)
│   │   ├── services/           # File service (upload, preview)
│   │   └── utils/              # Helpers
│   ├── alembic/                # Database migrations
│   ├── storage/                # Uploaded files (gitignored)
│   ├── requirements.txt
│   └── .env.example
├── frontend/                   # Next.js frontend
│   ├── app/                    # App Router pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── characters/         # Characters list + detail
│   │   ├── references/         # Reference library
│   │   ├── prompts/            # Prompt library
│   │   ├── tasks/              # Task queue
│   │   ├── media/              # Media library
│   │   └── planner/            # Content planner
│   ├── components/             # Reusable React components
│   ├── lib/                    # API client
│   ├── types/                  # TypeScript types
│   └── .env.example
└── README.md
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Kosmos327/AI-Model-Studio.git
cd AI-Model-Studio
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

---

## Environment Variables

### Backend

Copy the example file:

```bash
cd backend
cp .env.example .env
```

Edit `.env` as needed:

```dotenv
DATABASE_URL=sqlite:///./studio.db
STORAGE_DIR=                   # Leave empty to use backend/storage/
DEBUG=true
CORS_ORIGINS=*                 # Comma-separated origins, or * for all
```

### Frontend

Copy the example file:

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Database Migrations

The database is created automatically on first startup. To manually run migrations with Alembic:

```bash
cd backend
source .venv/bin/activate

# Apply migrations
alembic upgrade head

# Create a new migration (after model changes)
alembic revision --autogenerate -m "description"
```

---

## Running the Application

### Start the Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000/api
- **Interactive docs**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/health
- **Uploaded files**: http://localhost:8000/files/...

### Start the Frontend

In a **separate terminal**:

```bash
cd frontend
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## File Storage

Uploaded files are stored under `backend/storage/` in this structure:

```
storage/
└── characters/
    └── {character_id}/
        ├── references/     # Reference images and videos
        ├── media/
        │   ├── images/     # Generated images
        │   └── videos/     # Generated videos
        └── previews/       # Auto-generated preview thumbnails
```

- Files are given unique names (UUID-based) to avoid collisions.
- Image previews are auto-generated at max 400px using Pillow.
- Files are served at `/files/characters/{id}/...`.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — stats, recent activity, quick actions |
| `/characters` | Character list with search and filter |
| `/characters/[id]` | Character detail — profile, references, prompts, tasks, media, planner |
| `/references` | Reference asset library with drag-and-drop upload |
| `/prompts` | Prompt template library |
| `/tasks` | Generation task queue |
| `/media` | Media library — generated photos and videos |
| `/planner` | Content plan — calendar + list view |

---

## API Endpoints Summary

| Resource | Endpoints |
|----------|-----------|
| Characters | GET/POST `/api/characters`, GET/PUT/DELETE `/api/characters/{id}` |
| References | GET/POST `/api/references`, GET/PUT/DELETE `/api/references/{id}`, POST `/api/references/upload` |
| Prompts | GET/POST `/api/prompts`, GET/PUT/DELETE `/api/prompts/{id}` |
| Tasks | GET/POST `/api/tasks`, GET/PUT/DELETE `/api/tasks/{id}` |
| Media | GET/POST `/api/media`, GET/PUT/DELETE `/api/media/{id}`, POST `/api/media/upload` |
| Planner | GET/POST `/api/planner`, GET/PUT/DELETE `/api/planner/{id}` |
| Consistency | GET/POST/PUT `/api/characters/{id}/consistency` |
| Dashboard | GET `/api/dashboard` |

Full interactive API documentation is available at http://localhost:8000/docs when the backend is running.

---

## Roadmap

Future versions will add:

- [ ] ComfyUI API integration for automatic generation
- [ ] Kling / Runway / other engine integrations
- [ ] GPT caption generation
- [ ] Weekly shot list generation
- [ ] Consistency scoring with face detection
- [ ] Auto-tagging with image recognition
- [ ] Auto-export and scheduling to social platforms
- [ ] User roles and authentication
- [ ] S3 / cloud storage support
- [ ] Background task workers (Celery / ARQ)
- [ ] Analytics and performance tracking
