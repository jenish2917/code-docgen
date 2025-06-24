#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Documentation
from django.contrib.auth.models import User

print('Assigning owners to existing documentation...')

# Get the first user (you can change this to a specific user)
try:
    # Try to get a specific user first
    user = User.objects.filter(username='admin').first()
    if not user:
        # If no admin user, get the first user
        user = User.objects.first()
    
    if not user:
        print('No users found in the database. Please create a user first.')
        exit(1)
    
    print(f'Assigning documentation to user: {user.username} (ID: {user.id})')
    
    # Update all documentation records with null owner
    docs_without_owner = Documentation.objects.filter(owner__isnull=True)
    count = docs_without_owner.count()
    
    print(f'Found {count} documentation records without owners')
    
    if count > 0:
        # Assign the user to all documentation without owners
        updated_count = docs_without_owner.update(owner=user)
        print(f'✅ Successfully assigned {updated_count} documentation records to {user.username}')
        
        # Verify the update
        remaining_without_owner = Documentation.objects.filter(owner__isnull=True).count()
        print(f'Remaining documentation records without owners: {remaining_without_owner}')
        
        # Show some examples
        print('\nSample updated documentation:')
        for doc in Documentation.objects.filter(owner=user)[:5]:
            print(f'  - Doc ID: {doc.id}, CodeFile: {doc.code_file.title}, Owner: {doc.owner.username}')
    else:
        print('All documentation records already have owners assigned')
        
except Exception as e:
    print(f'Error: {e}')
