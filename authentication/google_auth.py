from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import redirect
import requests
import json
from django.contrib.auth.models import User
from .models import UserProfile

class GoogleLoginView(APIView):
    def get(self, request):
        """
        Redirect the user to Google's OAuth2 login page
        """
        # Build the authorization URL
        google_auth_url = 'https://accounts.google.com/o/oauth2/auth'
        client_id = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
        redirect_uri = request.build_absolute_uri(reverse('google_callback'))
        
        # Parameters for Google OAuth2
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': 'email profile',
            'access_type': 'offline',
            'prompt': 'select_account'
        }
        
        # Construct authorization URL with parameters
        auth_url = f"{google_auth_url}?client_id={params['client_id']}&redirect_uri={params['redirect_uri']}&response_type={params['response_type']}&scope={params['scope']}&access_type={params['access_type']}&prompt={params['prompt']}"
        
        return Response({
            'auth_url': auth_url
        })

class GoogleCallbackView(APIView):
    def get(self, request):
        """
        Handle the callback from Google OAuth2
        """
        code = request.GET.get('code')
        if not code:
            return Response({'error': 'Authentication failed: No code provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Exchange authorization code for tokens
        token_url = 'https://oauth2.googleapis.com/token'
        client_id = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
        client_secret = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET
        redirect_uri = request.build_absolute_uri(reverse('google_callback'))
        
        token_data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }
        
        # Get tokens from Google
        token_response = requests.post(token_url, data=token_data)
        if token_response.status_code != 200:
            return Response({'error': 'Failed to obtain token from Google'}, status=status.HTTP_400_BAD_REQUEST)
        
        token_info = token_response.json()
        access_token = token_info.get('access_token')
        
        # Get user info with access token
        user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        user_info_response = requests.get(user_info_url, headers={
            'Authorization': f'Bearer {access_token}'
        })
        
        if user_info_response.status_code != 200:
            return Response({'error': 'Failed to get user info from Google'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_info = user_info_response.json()        # Check if user exists, if not create a new one
        try:
            # Try to find user by email
            user = User.objects.get(email=user_info['email'])
            
            # Update user information if necessary
            update_needed = False
            if user.first_name != user_info.get('given_name', '') and user_info.get('given_name'):
                user.first_name = user_info.get('given_name', '')
                update_needed = True
                
            if user.last_name != user_info.get('family_name', '') and user_info.get('family_name'):
                user.last_name = user_info.get('family_name', '')
                update_needed = True
            
            if update_needed:
                user.save()
            
            # Update profile picture if it changed
            try:
                # Create profile if it doesn't exist
                profile, created = UserProfile.objects.get_or_create(user=user)
                
                if profile.profile_picture != user_info.get('picture'):
                    profile.profile_picture = user_info.get('picture')
                    profile.is_google_account = True
                    profile.save()
                    
            except Exception as e:
                print(f"Error updating user profile: {str(e)}")
        
        except User.DoesNotExist:
            # Create a new user
            username = user_info.get('email').split('@')[0]
            # Ensure username is unique
            base_username = username
            count = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{count}"
                count += 1
                
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=user_info['email'],
                first_name=user_info.get('given_name', ''),
                last_name=user_info.get('family_name', '')
            )
            user.set_unusable_password()  # Google account doesn't need a password
            user.save()
            
            # Create or update profile
            try:
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.profile_picture = user_info.get('picture')
                profile.is_google_account = True
                profile.save()
            except Exception as e:
                print(f"Error creating user profile: {str(e)}")
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
          # Redirect to frontend with tokens as URL parameters
        frontend_url = settings.CORS_ALLOWED_ORIGINS[0]
        redirect_url = f"{frontend_url}/auth/google-callback?access={str(refresh.access_token)}&refresh={str(refresh)}&user_id={user.id}"
        
        return redirect(redirect_url)