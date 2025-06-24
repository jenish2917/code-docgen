from django.db import migrations

def ensure_user_profiles(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('authentication', 'UserProfile')
    TwoFactorAuth = apps.get_model('authentication', 'TwoFactorAuth')
    
    # Create UserProfile for users without one
    for user in User.objects.all():
        UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'profile_picture': None,
            }
        )
        
    # Create TwoFactorAuth entries for users without one
    for user in User.objects.all():
        TwoFactorAuth.objects.get_or_create(
            user=user,
            defaults={
                'is_enabled': False,
                'secret_key': '',  # Will be populated when user enables 2FA
            }
        )

class Migration(migrations.Migration):
    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(ensure_user_profiles),
    ]
