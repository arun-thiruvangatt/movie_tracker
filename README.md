# MovieTracker

A small Django + DRF backend with a React + Vite frontend for tracking movies and series.

## Overview
- Backend: Django, Django REST Framework, JWT auth (simplejwt).
- Frontend: React (Vite), react-router-dom.
- Media files served from `MEDIA_URL`/`MEDIA_ROOT` in development.

## Requirements
- Python 3.10+ (or your project's target Python)
- Node 18+ / npm or pnpm

## Quick start (development)

1. Backend setup

```bash
# from project root
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
python manage.py migrate
python manage.py loaddata initial_data || true  # optional if you have fixtures
python manage.py createsuperuser  # optional
```

Start Django dev server (serves API and media when DEBUG=True):

```bash
cd backend
python manage.py runserver
```

2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the site at the address Vite prints (usually http://localhost:5173).

## Environment / Notes
- Backend settings: `backend/config/settings.py` — set `SECRET_KEY`, `DEBUG`, allowed hosts, and `MEDIA_ROOT`/`MEDIA_URL` for file uploads.
- The frontend expects the API to be reachable at the configured base URL in `frontend/src/services/apiClient.js` (usually proxied in development or pointed at Django dev server).
- To upload images from the frontend use multipart `FormData` (the project handles this in `apiClient`).

## API quick pointers
- Genres: `GET /api/genres/`, `POST /api/genres/` (auth required for creation)
- Content: `GET /api/content/`, `POST /api/content/` (multipart for images)
- Accounts: `POST /api/accounts/register/`, `GET/PATCH /api/accounts/me/`

## Tests
- Backend: run Django tests

```bash
cd backend
python manage.py test
```

- Frontend: use your preferred test runner (not included by default).

## Contributing
- Use feature branches and open PRs.
- Keep migrations in `backend/apps/*/migrations/` when models change.

## License
This repository does not include a license file. Add one if you plan to publish or share.
