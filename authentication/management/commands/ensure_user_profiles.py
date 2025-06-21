from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from authentication.models import UserProfile

class Command(BaseCommand):
    help = 'Ensures all users have a corresponding profile'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Checking for users without profiles...'))
        
        count = 0
        for user in User.objects.all():
            try:
                # Try to access the profile
                profile = user.profile
                self.stdout.write(f"User {user.username} already has a profile")
            except UserProfile.DoesNotExist:
                # Create a profile if it doesn't exist
                UserProfile.objects.create(user=user)
                count += 1
                self.stdout.write(self.style.SUCCESS(f"Created profile for user {user.username}"))
        
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f'Created {count} missing user profiles'))
        else:
            self.stdout.write(self.style.SUCCESS('All users already have profiles'))
