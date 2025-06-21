import os
import sqlite3
import uuid
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

# Check users in auth_user table
cursor.execute("SELECT id, username, email, first_name, last_name FROM auth_user;")
users = cursor.fetchall()
print(f"\nExisting users: {len(users)}")
for user in users:
    print(user)

# Check if we want to create a test user
create_test_user = input("Create a test user? (y/n): ").lower() == 'y'

if create_test_user:
    # Create a test user
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    email = f"{username}@example.com"
    password = "pbkdf2_sha256$390000$cRLztoX7mPToqBDwUQMpGp$1NkJ3IBZQN5ZkBZO0L+U1sc/uKk9JU7divZ1qjmxVPc="  # 'password123'
    
    cursor.execute('''
    INSERT INTO auth_user (username, email, password, is_superuser, is_staff, is_active, date_joined, first_name, last_name)
    VALUES (?, ?, ?, 0, 0, 1, datetime('now'), 'Test', 'User');
    ''', (username, email, password))
    user_id = cursor.lastrowid
    
    # Create the profile
    profile_id = str(uuid.uuid4())
    cursor.execute('''
    INSERT INTO authentication_userprofile (profile_id, profile_picture, is_google_account, user_id)
    VALUES (?, NULL, 0, ?);
    ''', (profile_id, user_id))
    
    conn.commit()
    print(f"\nCreated test user: {username}")

print("\nDone.")
conn.close()
