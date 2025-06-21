from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import TwoFactorAuth, UserProfile
import uuid
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user with email, username and password
    """
    # Debug: Log the incoming registration request
    print("📝 Registration Request Data:", request.data)
    
    # Extract data from request
    email = request.data.get('email')
    username = request.data.get('username')
    password = request.data.get('password')
    confirm_password = request.data.get('confirm_password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    # Validate required fields
    if not email or not username or not password:
        return Response(
            {'error': 'Email, username, and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate password match
    if password != confirm_password:
        return Response(
            {'error': 'Passwords do not match'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
      # Check if email already exists
    if User.objects.filter(email=email).exists():
        print(f"❌ Registration failed: Email '{email}' already exists")
        return Response(
            {'error': f"Email '{email}' already exists"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if username already exists
    if User.objects.filter(username=username).exists():
        print(f"❌ Registration failed: Username '{username}' already exists")
        return Response(
            {'error': f"Username '{username}' already exists"}, 
            status=status.HTTP_400_BAD_REQUEST
        )    # Create user    
    try:
        print(f"🔍 Creating user: username={username}, email={email}, first_name={first_name}, last_name={last_name}")
        
        # Double-check to avoid race conditions
        if User.objects.filter(email=email).exists():
            print(f"⚠️ Race condition - Email '{email}' now exists")
            return Response(
                {'error': f"Email '{email}' already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if User.objects.filter(username=username).exists():
            print(f"⚠️ Race condition - Username '{username}' now exists")
            return Response(
                {'error': f"Username '{username}' already exists"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_user(
            username=username, 
            password=password, 
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create an empty profile for the user
        profile, created = UserProfile.objects.get_or_create(user=user)
        print(f"👤 User profile created: {created}, profile_id={profile.profile_id}")
        
        return Response(
            {'message': 'User registered successfully'}, 
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login view with enhanced debugging
    """
    import uuid
    
    # Get credentials from request
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Print debug info
    print(f"Login attempt with: username={username}, email={email}, password={'*' * len(password) if password else None}")
    
    # Validate required fields
    if not (email or username) or not password:
        print("Login error: Missing credentials")
        return Response(
            {'error': 'Email/username and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Find the user using either email or username
    try:
        if email:
            print(f"Looking up user by email: {email}")
            user = User.objects.get(email=email)
        else:
            print(f"Looking up user by username: {username}")
            user = User.objects.get(username=username)
        
        print(f"Found user: {user.username} (ID: {user.id})")
    except User.DoesNotExist:
        print(f"User not found with {'email: ' + email if email else 'username: ' + username}")
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Authenticate the user
    authenticated_user = authenticate(request, username=user.username, password=password)
    if not authenticated_user:
        print(f"Authentication failed for user: {user.username}")
        return Response(
            {'error': 'Invalid credentials. Please check your username/email and password.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
        
    # Check if 2FA is enabled for this user
    try:
        # Ensure the user has a TwoFactorAuth record
        two_factor, created = TwoFactorAuth.objects.get_or_create(
            user=authenticated_user,
            defaults={'is_enabled': False}
        )
        
        if created:
            print(f"Created new 2FA record for user: {authenticated_user.username}")
            
        if two_factor.is_enabled:
            print(f"2FA is enabled for user: {authenticated_user.username}")
            # If 2FA is enabled, return a partial login response
            return Response({
                'two_factor_required': True,
                'user_id': authenticated_user.id,
                'email': authenticated_user.email,
                'username': authenticated_user.username
            })
        else:
            print(f"2FA is disabled for user: {authenticated_user.username}")
    except Exception as e:
        print(f"Error checking 2FA status: {str(e)}")
        # Continue with login if there's an issue with 2FA
        
    # If 2FA is not enabled, proceed with normal login
    print(f"Generating tokens for user: {authenticated_user.username}")
    refresh = RefreshToken.for_user(authenticated_user)
    
    # Get profile picture if available
    profile_picture = None
    profile = None
    is_google_account = False
    
    try:
        # Ensure the user has a profile
        profile, created = UserProfile.objects.get_or_create(
            user=authenticated_user,
            defaults={'profile_id': uuid.uuid4()}
        )
        profile_picture = profile.profile_picture
        is_google_account = profile.is_google_account
        
        if created:
            print(f"Created new profile for user: {authenticated_user.username}")
        print(f"Got profile for user: {authenticated_user.username}, picture: {profile_picture}")
    except Exception as e:
        print(f"Error getting user profile: {str(e)}")
        
    # Return the response with tokens and user info
    print(f"Login successful for user: {authenticated_user.username}")
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': {
            'id': authenticated_user.id,
            'username': authenticated_user.username,
            'email': authenticated_user.email,
            'profile_picture': profile_picture,
            'is_google_account': is_google_account
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get the user profile information
    """
    user = request.user
    
    # Check if 2FA is enabled
    try:
        two_factor = TwoFactorAuth.objects.get(user=user)
        two_factor_enabled = two_factor.is_enabled
    except TwoFactorAuth.DoesNotExist:
        two_factor_enabled = False
    
    # Get profile info
    try:
        profile = user.profile
        profile_picture = profile.profile_picture
        is_google_account = profile.is_google_account
    except:
        profile_picture = None
        is_google_account = False
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'profile_picture': profile_picture,
        'is_google_account': is_google_account,
        'two_factor_enabled': two_factor_enabled
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def check_google_oauth_config(request):
    """
    Check if Google OAuth is configured
    """
    client_id = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', None)
    client_secret = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_SECRET', None)
    
    is_configured = bool(client_id and client_secret)
    
    return Response({
        'is_configured': is_configured
    })
