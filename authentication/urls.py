from django.urls import path
from .views import register, login_view, forgot_password, reset_password
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password/', reset_password, name='reset_password'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]