# Generated manually on 2025-06-24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_add_owner_field_to_documentation'),
    ]

    operations = [
        # First, try to remove the old index if it exists - this will be a no-op if it doesn't exist
        migrations.RunSQL(
            "DROP INDEX IF EXISTS core_docume_owner_id_c72e71_idx;",
            reverse_sql="",
        ),
        
        # Then try to remove the new index if it already exists (to avoid duplicates)
        migrations.RunSQL(
            "DROP INDEX IF EXISTS core_docume_owner_i_ebd817_idx;",
            reverse_sql="",
        ),
        
        # Finally, create the new index
        migrations.AddIndex(
            model_name='documentation',
            index=models.Index(fields=['owner', 'generated_at'], name='core_docume_owner_i_ebd817_idx'),
        ),
    ]
