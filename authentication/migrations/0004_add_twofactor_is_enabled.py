from django.db import migrations, models

def set_default_is_enabled(apps, schema_editor):
    TwoFactorAuth = apps.get_model('authentication', 'TwoFactorAuth')
    
    # Set is_enabled to False for all existing entries
    TwoFactorAuth.objects.filter(is_enabled__isnull=True).update(is_enabled=False)

class Migration(migrations.Migration):
    dependencies = [
        ('authentication', '0003_merge_20250621_1832'),
    ]

    operations = [
        migrations.AlterField(
            model_name='twofactorauth',
            name='is_enabled',
            field=models.BooleanField(default=False, help_text='Whether two-factor authentication is enabled for this user'),
        ),
        migrations.RunPython(set_default_is_enabled),
    ]
