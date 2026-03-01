# Frontend (React Router)

This folder contains the frontend for the `pzpp_IO_1B` project.

## Tech stack

- React `19.2`
- React Router `7.12`
- TypeScript `5.9`
- Vite `7.1`
- TailwindCSS `4.1`

## Project layout

- `app/` – application source code
- `public/` – static assets
- `react-router.config.ts` – React Router configuration
- `vite.config.ts` – Vite bundler configuration
- `package.json` – Node.js dependencies and NPM scripts

## Requirements

- Node.js `22+` (or compatible LTS version)
- npm (Node Package Manager)

## Setup

From the `frontend/` directory:

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

Frontend will be available at:

- `http://localhost:5173/`

## Scripts

- `npm run dev` – starts local development server with HMR
- `npm run build` – creates a production build of the application
- `npm run start` – serves the production build
- `npm run lint` – lints the codebase using ESLint
- `npm run format` – checks code formatting with Prettier
- `npm run typecheck` – runs TypeScript compiler check
