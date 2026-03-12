# HRMS Lite

Simple HRMS (Employee + Attendance) with **React frontend** and your choice of backend: **Node.js** or **Django**, MySQL, JWT auth, and Swagger.

## Stack

- **Backend (pick one):**
  - **Node.js:** Express, MySQL (mysql2), JWT, Swagger UI, express-validator
  - **Django:** Django REST Framework, Simple JWT, MySQL (mysqlclient), drf-spectacular (Swagger)
- **Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios
- **Database:** MySQL 8

## Quick start (local)

### 1. Database

- Install MySQL and create a database (or use a cloud instance).
- Connection string format: `mysql://USER:PASSWORD@HOST:3306/hrms_lite`

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL, JWT_SECRET, FRONTEND_URL (e.g. http://localhost:5173)
npm install
npm run migrate
npm run seed
npm run dev
```

- API: http://localhost:3000  
- Swagger: http://localhost:3000/api/api-docs  
- Default user: **admin@hrms.local** / **admin123**

### 2b. Backend (Django instead of Node)

```bash
cd backend_django
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # set DB_*, JWT_SECRET, FRONTEND_URL
# Create a new DB for Django (e.g. hrms_django), set DB_NAME to it
python manage.py migrate
python manage.py seed_hrms
python manage.py runserver 3000
```

- API: http://localhost:3000/api/  
- Swagger: http://localhost:3000/api/api-docs/  
- Same default user: **admin@hrms.local** / **admin123**  
- See [backend_django/README.md](backend_django/README.md) for details.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:3000/api
npm install
npm run dev
```

- App: http://localhost:5173  
- Log in with the default user above.

## Project layout

```
backend/           # Node.js API
  src/, app.js, package.json, .env.example

backend_django/    # Django API (same endpoints, drop-in replacement)
  hrms_lite/       # settings, urls
  core/            # models, views, serializers, urls, management/commands/seed_hrms.py
  manage.py, requirements.txt, .env.example

frontend/
  src/
    api/          # Axios client + endpoints
    components/   # Button, Input, Table, Card, Modal, Layout, ToastList
    context/      # AuthContext, ToastContext
    pages/        # Login, EmployeeList, EmployeeForm, AttendanceList, MarkAttendance
    App.tsx, main.tsx
  .env.example
  package.json
```

## Features

- **Auth:** Login / logout, JWT, protected routes
- **Employees:** List, add, edit, delete; validation and unique email
- **Attendance:** Mark per employee/date (Present/Absent), list per employee
- **API:** REST with Swagger docs; CORS and error handling
- **UI:** Responsive layout, loading/error/empty states, toasts

## Deployment (GitHub → Render + Netlify)

Full step-by-step: **[DEPLOYMENT.md](DEPLOYMENT.md)** — push to GitHub, deploy Node backend on **Render**, React frontend on **Netlify**, set env vars and MySQL once.
