from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request a password reset email
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Return success even if user doesn't exist for security
        return Response(
            {'message': 'If a user with this email exists, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )
    
    # Generate token
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Create reset link
    # In production, this should be a frontend URL
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
    
    # Send email
    try:
        send_mail(
            'Reset your password',
            f'Click the link below to reset your password:\n\n{reset_link}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        return Response(
            {'error': f'Email could not be sent: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return Response(
        {'message': 'If a user with this email exists, a password reset link has been sent.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_password_reset_token(request):
    """
    Verify a password reset token
    """
    uid = request.data.get('uid')
    token = request.data.get('token')
    
    if not uid or not token:
        return Response(
            {'error': 'UID and token are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'valid': False}, 
            status=status.HTTP_200_OK
        )
    
    if default_token_generator.check_token(user, token):
        return Response(
            {'valid': True},
            status=status.HTTP_200_OK
        )
    
    return Response(
        {'valid': False},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset user password with token
    """
    uid = request.data.get('uid')
    token = request.data.get('token')
    password = request.data.get('password')
    
    if not uid or not token or not password:
        return Response(
            {'error': 'UID, token, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'error': 'Invalid user ID'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if default_token_generator.check_token(user, token):
        user.set_password(password)
        user.save()
        return Response(
            {'message': 'Password reset successful'},
            status=status.HTTP_200_OK
        )
    
    return Response(
        {'error': 'Invalid or expired token'},
        status=status.HTTP_400_BAD_REQUEST
    )
