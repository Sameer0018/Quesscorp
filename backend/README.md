# HRMS Lite – Backend

Node.js + Express + MySQL API with JWT auth and Swagger.

## Prerequisites

- Node.js 18+
- MySQL 8 (local or hosted)

## Local setup

1. **Clone and install**
   ```bash
   cd backend
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set database options: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (e.g. `3306`)
   - Set `JWT_SECRET` to a long random string (e.g. `openssl rand -hex 32`)
   - Set `FRONTEND_URL` to your frontend origin (e.g. `http://localhost:5173`)

3. **Database**
   - Create the database and tables:
     ```bash
     npm run migrate
     ```
   - Seed sample data and default user:
     ```bash
     npm run seed
     ```
   - Default login after seed: **admin@hrms.local** / **admin123**

4. **Run**
   ```bash
   npm run dev
   ```
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api/api-docs

## Build for production

```bash
npm run build
npm start
```

## Deploy to Render / Railway

1. **Create a MySQL database**
   - **Render:** use a PostgreSQL instance or attach an external MySQL (e.g. PlanetScale, Railway MySQL).
   - **Railway:** add a MySQL plugin to your project and copy the connection URL.

2. **Create a Web Service**
   - Connect your repo and set the root to `backend` (or run from repo root with `npm install && cd backend && npm run build && npm start`).
   - Build command: `npm run build` (from backend folder).
   - Start command: `npm start` (from backend folder).

3. **Environment variables**
   - `PORT` – set by Render/Railway (usually no need to set).
   - `NODE_ENV` – `production`.
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` – MySQL connection.
   - `JWT_SECRET` – strong random secret.
   - `FRONTEND_URL` – your frontend URL (e.g. `https://your-app.vercel.app`).

4. **Run migrations**
   - After first deploy, run migrations once (e.g. via Render Shell or Railway CLI):
     ```bash
     npm run migrate
     npm run seed
     ```

## API overview

- **Auth:** `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, optional `POST /api/auth/register`
- **Employees:** `GET/POST /api/employees`, `GET/PUT/DELETE /api/employees/:id`
- **Attendance:** `POST /api/attendance`, `GET /api/attendance/:employee_id`

All employee and attendance routes require `Authorization: Bearer <token>`.
