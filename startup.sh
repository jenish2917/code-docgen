#!/bin/bash

# Azure App Service startup script for Django with Ollama support
echo "🚀 Starting Django application on Azure App Service..."

# Set Python path
export PYTHONPATH=/home/site/wwwroot:$PYTHONPATH

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Create superuser if needed (optional)
echo "👤 Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"

# Test Ollama connectivity
echo "🤖 Testing Ollama connectivity..."
python -c "
import requests
import os
try:
    ollama_url = os.environ.get('OLLAMA_API_URL', 'http://20.2.84.243:11434/api/generate')
    response = requests.get(ollama_url.replace('/api/generate', '/api/tags'), timeout=5)
    print(f'✅ Ollama is accessible at {ollama_url}')
except Exception as e:
    print(f'⚠️ Ollama connectivity issue: {e}')
"

# Start Gunicorn server with optimized settings
echo "🌟 Starting Gunicorn server..."
gunicorn backend.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 3 \
    --worker-class gthread \
    --threads 2 \
    --timeout 120 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --preload \
    --access-logfile - \
    --error-logfile - \
    --log-level info
