#!/usr/bin/env bash
# Render build: install deps, run migrations, collect static (if needed)
set -o errexit
pip install -r requirements.txt
python manage.py migrate --noinput
# Optional: python manage.py collectstatic --noinput (if you add STATIC_ROOT)
