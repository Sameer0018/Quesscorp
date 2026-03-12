"""
Align the existing Node.js 'users' table (password_hash) with Django's User model (password).
Run this once if you use the same database as Node (e.g. sinch_lite) then run seed_hrms.
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Alter 'users' table from Node schema to Django schema (password_hash -> password, add Django columns)"

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SHOW COLUMNS FROM users LIKE 'password_hash'")
            has_password_hash = cursor.fetchone() is not None
            cursor.execute("SHOW COLUMNS FROM users LIKE 'password'")
            has_password = cursor.fetchone() is not None

            if has_password_hash and not has_password:
                self.stdout.write("Adding 'password' and copying from password_hash...")
                cursor.execute("ALTER TABLE users ADD COLUMN password VARCHAR(128) NOT NULL DEFAULT ''")
                cursor.execute("UPDATE users SET password = password_hash WHERE password_hash IS NOT NULL AND password_hash != ''")
                cursor.execute("ALTER TABLE users DROP COLUMN password_hash")
                self.stdout.write(self.style.SUCCESS("Done: password_hash -> password"))
            elif not has_password:
                cursor.execute("ALTER TABLE users ADD COLUMN password VARCHAR(128) NOT NULL DEFAULT ''")
                self.stdout.write(self.style.SUCCESS("Added column password"))

            for col, spec in [
                ("last_login", "DATETIME(6) NULL"),
                ("is_superuser", "TINYINT(1) NOT NULL DEFAULT 0"),
                ("is_staff", "TINYINT(1) NOT NULL DEFAULT 0"),
                ("is_active", "TINYINT(1) NOT NULL DEFAULT 1"),
                ("date_joined", "DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)"),
            ]:
                cursor.execute(f"SHOW COLUMNS FROM users LIKE %s", [col])
                if not cursor.fetchone():
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {spec}")
                    self.stdout.write(self.style.SUCCESS(f"Added column {col}"))

        self.stdout.write(self.style.SUCCESS("Users table is ready for Django. Run: python manage.py seed_hrms"))
