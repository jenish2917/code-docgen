from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from authentication.models import UserProfile, TwoFactorAuth

class Command(BaseCommand):
    help = 'Ensures all users have both a profile and 2FA entry'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Checking for missing user records...'))
        
        profile_count = 0
        twofa_count = 0
        
        for user in User.objects.all():
            # Check for profile
            try:
                profile = user.profile
                self.stdout.write(f"User {user.username} already has a profile")
            except UserProfile.DoesNotExist:
                UserProfile.objects.create(user=user)
                profile_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created profile for user {user.username}"))
                
            # Check for 2FA entry
            try:
                twofa = user.two_factor
                self.stdout.write(f"User {user.username} already has a 2FA entry")
            except TwoFactorAuth.DoesNotExist:
                TwoFactorAuth.objects.create(user=user, is_enabled=False)
                twofa_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created 2FA entry for user {user.username}"))
        
        if profile_count > 0 or twofa_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Created {profile_count} profiles and {twofa_count} 2FA entries'))
        else:
            self.stdout.write(self.style.SUCCESS('All users already have complete records'))
