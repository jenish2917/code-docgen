from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class UserProfile(models.Model):
    """
    Extended user profile model with additional fields
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class TwoFactorAuth(models.Model):
    """
    Two-factor authentication model for enhanced security
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='two_factor')
    is_enabled = models.BooleanField(default=False, help_text="Whether two-factor authentication is enabled for this user")
    secret_key = models.CharField(max_length=255, null=True, blank=True)
    backup_codes = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"2FA for {self.user.username} - {'Enabled' if self.is_enabled else 'Disabled'}"
    
    def generate_backup_codes(self):
        """Generate new backup codes for the user"""
        self.backup_codes = [str(uuid.uuid4())[:8] for _ in range(10)]
        self.save()
        return self.backup_codes

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal to create a UserProfile when a new User is created
    """
    if created:
        UserProfile.objects.create(user=instance)
        TwoFactorAuth.objects.create(user=instance, is_enabled=False)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal to save UserProfile when User is updated
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:
        UserProfile.objects.create(user=instance)
        
    if hasattr(instance, 'two_factor'):
        instance.two_factor.save()
    else:
        TwoFactorAuth.objects.create(user=instance, is_enabled=False)
