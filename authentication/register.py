from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth.models import User
from .models import UserProfile

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user with email, username and password
    """
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
        return Response(
            {'error': 'Email already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user    
    try:
        user = User.objects.create_user(
            username=username, 
            password=password, 
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create an empty profile for the user
        UserProfile.objects.get_or_create(user=user)
        
        return Response(
            {'message': 'User registered successfully'}, 
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
