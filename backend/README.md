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
python manage.py init_db --pasword <postgre-password>
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

## Management commands

- `python manage.py migrate` – applies database migrations
- `python manage.py init_db` – creates the database and grants all permissions to the user
- `python manage.py init_admin` – creates superuser from environment variables
- `python manage.py runserver` – starts local development server
- `python manage.py reset_db` - wipes the current database and recreates it from scratch
- `python manage.py seed_db` - seeds the database by calling all commands from `/apps` starting with `seed_`. This command accepts the following arguments:
  - `--count` – Number of objects to create per seeder (default: 20)
  - `--img_count` – Number of images to download per model that supports it (default: 20)
