from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class UserProfile(models.Model):
    """
    User profile model to extend the default Django User model
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_id = models.UUIDField(default=uuid.uuid4, editable=False)
    profile_picture = models.URLField(blank=True, null=True)
    is_google_account = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.username}'s profile"
        
    @classmethod
    def get_or_create_profile(cls, user):
        """
        Get a user's profile or create one if it doesn't exist
        """
        try:
            return user.profile
        except cls.DoesNotExist:
            return cls.objects.create(user=user)

# Create a UserProfile automatically when a new User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        instance.profile.save()
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist when saving user
        UserProfile.objects.create(user=instance)
        
# Create TwoFactorAuth entry for new users
@receiver(post_save, sender=User)
def create_two_factor_auth(sender, instance, created, **kwargs):
    """
    Create a TwoFactorAuth entry for a new user
    """
    if created:
        TwoFactorAuth.objects.get_or_create(user=instance, defaults={'is_enabled': False})
    # Ensure existing users have TwoFactorAuth entries
    else:
        TwoFactorAuth.objects.get_or_create(user=instance, defaults={'is_enabled': False})

# Two-Factor Authentication
class TwoFactorAuth(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor')
    is_enabled = models.BooleanField(default=False)
    secret_key = models.CharField(max_length=255, blank=True, null=True)
    backup_codes = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - 2FA: {'Enabled' if self.is_enabled else 'Disabled'}"
