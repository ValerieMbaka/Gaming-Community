# Generated manually to handle duplicate emails and add unique constraint

from django.db import migrations, models
from django.db.models import Count

def remove_duplicate_emails(apps, schema_editor):
    CustomUser = apps.get_model('users', 'CustomUser')
    
    # Find duplicate emails
    duplicates = CustomUser.objects.values('email').annotate(
        count=Count('email')
    ).filter(count__gt=1)
    
    for duplicate in duplicates:
        email = duplicate['email']
        users_with_email = CustomUser.objects.filter(email=email).order_by('date_joined')
        
        # Keep the first user (oldest) and delete the rest
        first_user = users_with_email.first()
        users_to_delete = users_with_email.exclude(id=first_user.id)
        
        print(f"Removing {users_to_delete.count()} duplicate users for email: {email}")
        users_to_delete.delete()

def reverse_remove_duplicate_emails(apps, schema_editor):
    # This migration cannot be reversed as it deletes data
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('users', '0001_initial'),
    ]

    operations = [
        # First remove duplicate emails
        migrations.RunPython(remove_duplicate_emails, reverse_remove_duplicate_emails),
        
        # Then add the unique constraint
        migrations.AddConstraint(
            model_name='customuser',
            constraint=models.UniqueConstraint(models.F('email'), name='unique_email'),
        ),
    ]
