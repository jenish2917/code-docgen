from django.db import migrations
from django.contrib.auth.models import User

def create_missing_profiles(apps, schema_editor):
    # Get the UserProfile model from the migration state
    UserProfile = apps.get_model('authentication', 'UserProfile')
    
    # Get all users
    for user in User.objects.all():
        # Check if the user has a profile
        try:
            profile = user.profile
        except:
            # If the user doesn't have a profile, create one
            UserProfile.objects.create(user=user)
            print(f"Created missing profile for user: {user.username}")

class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_missing_profiles),
    ]
