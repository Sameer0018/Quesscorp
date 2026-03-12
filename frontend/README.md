# HRMS Lite – Frontend

React + Vite + Tailwind. Connects to the HRMS Lite backend API.

## Prerequisites

- Node.js 18+

## Local setup

1. **Install**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env`
   - Set `VITE_API_BASE_URL` to your backend API base URL, e.g. `http://localhost:3000/api` (no trailing slash).

3. **Run**
   ```bash
   npm run dev
   ```
   - App: http://localhost:5173
   - Log in with the default user (after backend seed): **admin@hrms.local** / **admin123**

## Build

```bash
npm run build
```

Output is in `dist/`. Preview with:

```bash
npm run preview
```

## Connect to a live backend

1. Deploy the backend (e.g. Render/Railway) and note its URL, e.g. `https://hrms-api.onrender.com`.
2. Set in your build environment (or in `.env.production`):
   ```
   VITE_API_BASE_URL=https://hrms-api.onrender.com/api
   ```
3. Rebuild: `npm run build`.
4. Deploy the `dist/` folder to Vercel, Netlify, or Render static site.
5. In the backend, set `FRONTEND_URL` to your frontend URL (e.g. `https://hrms-lite.vercel.app`) for CORS.
