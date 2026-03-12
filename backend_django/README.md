# HRMS Lite – Django Backend

Django REST API that matches the Node.js backend so the same React frontend works without changes.

## Prerequisites

- Python 3.10+
- MySQL 8
- Same env vars as Node: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`

## Local setup

1. **Create and activate a virtualenv**
   ```bash
   cd backend_django
   python -m venv venv
   venv\Scripts\activate   # Windows
   # or: source venv/bin/activate  # Linux/Mac
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment**
   - Copy `.env.example` to `.env`
   - Set `DB_*` to your MySQL credentials and database name (e.g. `sinch_lite` or `hrms_lite`).

4. **Database**
   - **If you use the same database as Node** (e.g. `sinch_lite`): the Node `users` table has `password_hash`; Django expects `password`. Run once:
   ```bash
   python manage.py fix_users_table
   python manage.py seed_hrms
   ```
   - **If you use a new database** for Django (e.g. `hrms_django`): create the DB, set `DB_NAME=hrms_django` in `.env`, then:
   ```bash
   python manage.py migrate
   python manage.py seed_hrms
   ```
   - Default login after seed: **admin@hrms.local** / **admin123**

5. **Run**
   ```bash
   python manage.py runserver 3000
   ```
   - API: http://localhost:3000/api/
   - Swagger: http://localhost:3000/api/api-docs/
   - Health: http://localhost:3000/health

## API (same as Node)

- `POST /api/auth/login` – body: `{ "email", "password" }` → `{ "token", "user" }`
- `GET /api/auth/me` – requires `Authorization: Bearer <token>`
- `POST /api/auth/logout`
- `GET /api/employees` – list
- `POST /api/employees` – create
- `GET /api/employees/<id>` – get one
- `PUT /api/employees/<id>` – update
- `DELETE /api/employees/<id>` – delete
- `POST /api/attendance` – body: `{ "employee_id", "date", "status" }`
- `GET /api/attendance/<employee_id>` – list by employee

## Switching from Node to Django

1. Point the frontend `.env` to the Django backend: `VITE_API_BASE_URL=http://localhost:3000/api`
2. Use a **new MySQL database** (or a new schema) for Django so migrations don’t conflict with Node’s tables.
3. Run `migrate` and `seed_hrms`, then start Django on port 3000. The React app will work as before.
