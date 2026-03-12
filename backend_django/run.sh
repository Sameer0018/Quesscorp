#!/usr/bin/env bash
# Ensures gunicorn binds to Render's PORT (avoids "No open HTTP ports detected").
set -e
PORT="${PORT:-10000}"
echo "Starting gunicorn on 0.0.0.0:${PORT}"
exec python -m gunicorn hrms_lite.wsgi:application --bind "0.0.0.0:${PORT}"
