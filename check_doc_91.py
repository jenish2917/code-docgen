#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Documentation

doc = Documentation.objects.filter(id=91).first()
if doc:
    print(f'Doc ID 91: {doc.code_file.title}, Owner: {doc.owner.username if doc.owner else "No owner"}')
else:
    print('Documentation ID 91 not found')
