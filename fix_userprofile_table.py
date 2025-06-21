import os
import sqlite3
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Get the database filename from Django settings
from django.conf import settings
db_path = settings.DATABASES['default']['NAME']
print(f"Database path: {db_path}")

# Connect to the SQLite database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if the table already exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='authentication_userprofile';")
table_exists = cursor.fetchone()

if table_exists:
    print("Table 'authentication_userprofile' already exists.")
else:
    print("Table 'authentication_userprofile' does not exist, creating...")
    # Create the UserProfile table
    cursor.execute('''
    CREATE TABLE authentication_userprofile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id CHAR(32) NOT NULL,
        profile_picture TEXT NULL,
        is_google_account BOOLEAN NOT NULL,
        user_id INTEGER UNIQUE NOT NULL REFERENCES auth_user(id)
    );
    ''')
    conn.commit()
    print("Table created successfully.")

# Verify the table structure
cursor.execute("PRAGMA table_info(authentication_userprofile);")
columns = cursor.fetchall()
print("\nTable structure:")
for col in columns:
    print(col)

# Verify existing user profiles
cursor.execute("SELECT * FROM authentication_userprofile;")
profiles = cursor.fetchall()
print(f"\nExisting profiles: {len(profiles)}")
for profile in profiles:
    print(profile)

print("\nDone.")
conn.close()
