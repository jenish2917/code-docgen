from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0003_merge_20250621_1832'),
    ]

    operations = [
        migrations.AddField(
            model_name='twofactorauth',
            name='is_enabled',
            field=models.BooleanField(default=False),
        ),
    ]
