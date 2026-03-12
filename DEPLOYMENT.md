# Deploy HRMS Lite: GitHub → Render (backend) + Netlify (frontend)

This guide uses **Node.js backend** on Render and **React frontend** on Netlify. Both deploy from the same GitHub repo.

---

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Netlify account (https://netlify.com)
- A **MySQL database** (Render does not provide MySQL; use one of):
  - [PlanetScale](https://planetscale.com) (free tier)
  - [Railway](https://railway.app) MySQL plugin
  - [Aiven](https://aiven.io), or any hosted MySQL

---

## Part 1: Push code to GitHub

### 1.1 Create a new repo on GitHub

1. Go to https://github.com/new
2. Repository name: e.g. `hrms-lite`
3. Choose **Public**, do **not** add README (you already have code)
4. Create repository

### 1.2 Push your project from your machine

Open terminal in your project folder (`NodejsFull`):

```bash
cd e:\PythonFullstact\NodejsFull

git init
git add .
git commit -m "Initial commit: HRMS Lite backend + frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hrms-lite.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `hrms-lite` with your GitHub username and repo name.

---

## Part 2: Deploy backend on Render

### 2.1 Create Web Service

1. Log in to https://dashboard.render.com
2. **New** → **Web Service**
3. Connect your **GitHub** account if needed, then select the repo (e.g. `hrms-lite`)
4. Configure:
   - **Name:** `hrms-lite-api` (or any name)
   - **Region:** choose one (e.g. Oregon)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid)

### 2.2 Environment variables (Render Dashboard)

In the service → **Environment** tab, add:

| Key | Value | Notes |
|-----|--------|--------|
| `NODE_ENV` | `production` | |
| `PORT` | (leave empty) | Render sets this automatically |
| `DB_HOST` | your MySQL host | e.g. `xxx.planetscale.io` or Railway host |
| `DB_PORT` | `3306` | or your DB port |
| `DB_USER` | your DB user | |
| `DB_PASSWORD` | your DB password | |
| `DB_NAME` | your DB name | e.g. `hrms_lite` |
| `JWT_SECRET` | long random string | e.g. generate with `openssl rand -hex 32` |
| `FRONTEND_URL` | `https://YOUR-NETLIFY-SITE.netlify.app` | Set after Part 3; update later if needed |

Save. Render will redeploy.

### 2.3 Database setup (one-time)

Your MySQL must have the schema. Either:

**Option A – Run migrate from your PC (recommended once DB is reachable):**

```bash
cd backend
# Set .env with the SAME DB_* values you use on Render (and ensure DB is reachable from your IP if needed)
npm run migrate
npm run seed
```

**Option B – Run SQL manually:**  
Create the database, then run the contents of `backend/src/db/schema.sql` in your MySQL client (replace DB name in the script if needed).

### 2.4 Get your backend URL

After deploy, Render shows a URL like:

`https://hrms-lite-api.onrender.com`

Use this as the **API base** for the frontend (no `/api` at the end for `VITE_API_BASE_URL` – the app already uses `/api` in paths). So:

`VITE_API_BASE_URL` = `https://hrms-lite-api.onrender.com/api`

---

## Part 3: Deploy frontend on Netlify

### 3.1 Create site from Git

1. Log in to https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. **Connect to Git provider** → **GitHub** → authorize and choose repo `hrms-lite`

### 3.2 Build settings

- **Branch to deploy:** `main`
- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `frontend/dist`  
  (or leave empty; `netlify.toml` already sets `publish = "dist"` with base `frontend`)

Click **Deploy site**.

### 3.3 Environment variable (Netlify)

1. **Site settings** → **Environment variables** → **Add a variable**
2. **Key:** `VITE_API_BASE_URL`
3. **Value:** `https://YOUR-RENDER-URL.onrender.com/api`  
   Example: `https://hrms-lite-api.onrender.com/api`
4. **Scopes:** All (or only Production)
5. Save. Trigger a **new deploy** (Deploys → Trigger deploy) so the build uses the new value.

### 3.4 Get your frontend URL

Netlify will show a URL like:

`https://random-name-12345.netlify.app`

You can change it under **Site settings** → **Domain management** → **Edit site name** (e.g. `hrms-lite` → `https://hrms-lite.netlify.app`).

### 3.5 Update backend CORS

In **Render** → your service → **Environment**, set:

- `FRONTEND_URL` = `https://YOUR-NETLIFY-URL.netlify.app`  
  (no trailing slash)

Then redeploy the backend so CORS allows the frontend.

---

## Part 4: Verify

1. Open the **Netlify URL** (e.g. `https://hrms-lite.netlify.app`).
2. Log in with `admin@hrms.local` / `admin123` (if you ran seed).
3. Backend API docs: `https://YOUR-RENDER-URL.onrender.com/api/api-docs` (Swagger).

---

## Summary checklist

| Step | Where | What |
|------|--------|------|
| 1 | GitHub | Push repo (backend + frontend in one repo). |
| 2 | Render | New Web Service, root `backend`, build `npm install && npm run build`, start `npm start`. |
| 3 | Render | Set env: `DB_*`, `JWT_SECRET`, `FRONTEND_URL` (Netlify URL). |
| 4 | MySQL | Run migrate + seed (or run schema SQL once). |
| 5 | Netlify | Import from GitHub, base `frontend`, build `npm run build`, publish `frontend/dist`. |
| 6 | Netlify | Set `VITE_API_BASE_URL` = `https://YOUR-RENDER-URL.onrender.com/api`, redeploy. |
| 7 | Render | Set `FRONTEND_URL` = your Netlify URL, redeploy. |

---

## Deploying Django backend on Render instead of Node

If you want to use the **Django** backend on Render:

1. **Root Directory:** `backend_django`
2. **Runtime:** `Python 3`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `python manage.py migrate && gunicorn hrms_lite.wsgi:application`  
   - Add `gunicorn` to `requirements.txt`.
5. Set the same env vars (DB_*, JWT_SECRET, FRONTEND_URL).  
6. For a DB that already had Node’s `users` table, run `fix_users_table` once (e.g. via Render Shell), then `python manage.py seed_hrms`.

Frontend and Netlify steps stay the same; only the backend URL and which backend you run change.
