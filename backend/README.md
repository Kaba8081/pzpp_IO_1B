# Backend (Django)

This folder contains the backend for the `pzpp_IO_1B` project.

## Tech stack

- Django `6.0.2`
- PostgreSQL `15+`

## Project layout

- `manage.py` – Django CLI entry point
- `pzpp/` – Django project settings, URLs, WSGI/ASGI
- `core/` – Contains global logic and code shared between apps
- `apps/` - Contains apps grouped based on their purpose

## Requirements

- Python `3.12+` (recommended for Django 6)

## Setup

From the `backend/` directory:

1. Create and activate virtual environment

```bash
python -m venv venv
```

Windows (PowerShell):

```powershell
venv\Scripts\Activate.ps1
```

Windows (cmd):

```bat
venv\Scripts\activate.bat
```

Linux/macOS:

```bash
source venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in `backend/` using the given example values in `.env.example`

4. Apply migrations and initialize administrator account

```bash
python manage.py init_db --password <postgre-password>
python manage.py migrate
python manage.py init_admin
```

6. Run development server

```bash
python manage.py runserver
```

Backend will be available at:

- `http://127.0.0.1:8000/`
- Admin panel: `http://127.0.0.1:8000/admin/`
- API documentation `http://127.0.0.1:8000/api/schema/swagger`

## Docker Compose

From the repository root:

1. Create backend env file:

```bash
cp backend/.env.example backend/.env
```

PowerShell alternative:

```powershell
Copy-Item backend/.env.example backend/.env
```

2. Start backend + PostgreSQL:

```bash
docker compose up --build
```

3. Stop services:

```bash
docker compose down
```

If you change database credentials in `backend/.env`, recreate the Postgres volume once:

```bash
docker compose up --build
```

The compose file is in the repository root (`docker-compose.yml`) and is structured so you can add more services alongside `backend` and `db`.
It also defines one shared named volume for Django files: `backend_assets`, mounted to both `/app/media` and `/app/static`.
Redis is included as a separate `redis` service on port `6379`, with its data stored in the `redis_data` volume.
Only the backend service publishes a host port; Postgres and Redis stay internal to the Docker network.

## Management commands

- `python manage.py migrate` – applies database migrations
- `python manage.py init_db` – creates the database and grants all permissions to the user
- `python manage.py init_admin` – creates superuser from environment variables
- `python manage.py runserver` – starts local development server
- `python manage.py reset_db` - wipes the current database and recreates it from scratch
- `python manage.py fix_media_paths` - rewrites any absolute image paths in DB to media-relative values (useful after moving media storage)
- `python manage.py seed_db` - seeds the database by calling all commands from `/apps` starting with `seed_`. This command accepts the following arguments:
  - `--count` – Number of objects to create per seeder (default: 20)
  - `--img_count` – Number of images to download per model that supports it (default: 20)
