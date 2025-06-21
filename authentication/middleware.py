from django.utils.deprecation import MiddlewareMixin
from authentication.models import UserProfile
import logging

logger = logging.getLogger(__name__)

class EnsureUserProfileMiddleware(MiddlewareMixin):
    """
    Middleware to ensure all authenticated users have a profile
    Particularly important for the Django admin
    """
    def process_request(self, request):
        # Only process for authenticated users
        if request.user.is_authenticated:
            username = request.user.username
            # Ensure the user has a profile
            try:
                profile = request.user.profile
                logger.info(f"User {username} already has profile ID: {profile.profile_id}")
            except UserProfile.DoesNotExist:
                logger.warning(f"Creating missing profile for user: {username}")
                profile = UserProfile.objects.create(user=request.user)
                logger.info(f"Created profile with ID: {profile.profile_id} for user: {username}")
            except Exception as e:
                logger.error(f"Error checking profile for user {username}: {str(e)}")
        return None
