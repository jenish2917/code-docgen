from django.urls import path, include
from .views import register, login_view, check_google_oauth_config
from .user import user_profile
from rest_framework_simplejwt.views import TokenRefreshView
from .google_auth import GoogleLoginView, GoogleCallbackView
from .two_factor_auth import TwoFactorSetupView, TwoFactorVerifyView, TwoFactorDisableView, TwoFactorStatusView
from .password_reset import request_password_reset, verify_password_reset_token, reset_password

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', user_profile, name='user_profile'),
    # Google OAuth2 endpoints
    path('login/google/', GoogleLoginView.as_view(), name='google_login'),
    path('login/google/callback/', GoogleCallbackView.as_view(), name='google_callback'),
    # Add the path as expected by the frontend    # Regular path within auth app
    path('google/check-config/', check_google_oauth_config, name='check_google_config'),
    # This matches exactly what the frontend expects when combined with the main URL pattern
    # Frontend: /api/auth/google/check-config/ maps to this
    
    # Two-factor authentication endpoints
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa_setup'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa_verify'),
    path('2fa/disable/', TwoFactorDisableView.as_view(), name='2fa_disable'),
    path('2fa/status/', TwoFactorStatusView.as_view(), name='2fa_status'),
      # Password reset endpoints
    path('password-reset/request/', request_password_reset, name='request_password_reset'),
    path('password-reset/verify-token/', verify_password_reset_token, name='verify_password_reset_token'),
    path('password-reset/reset/', reset_password, name='reset_password'),
    
    # Social auth URLs
    path('', include('social_django.urls', namespace='social')),
]