# pzpp_IO_1B

Project for pzpp class. This is a full-stack web application consisting of a Django backend and a modern React Router frontend.

## Project Structure

This repository contains two main sub-projects:

- [`backend/`](./backend/README.md) – Django-based REST application.
- [`frontend/`](./frontend/README.md) – React Router-based web client.

Each part of the project has its own dedicated `README.md` with detailed information about specific dependencies, commands, and project layouts.

## Getting Started

To run this project locally, you will need to set up both the backend and frontend environments. Provide two separate terminal instances for running the servers.

### Prerequisites

- **Backend:** Python 3.12+
- **Frontend:** Node.js 22+ and npm

### Backend URL Configuration

The frontend requires knowledge of the backend server URL to communicate with the API. The URL is configured via the `VITE_BACKEND_URL` environment variable in the `frontend/.env` file:

```dotenv
VITE_BACKEND_URL=http://127.0.0.1:8000
```

You can customize this to match your backend deployment (e.g., production URL). See [`frontend/README.md`](./frontend/README.md) for detailed setup instructions.