from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get the current user's profile
    """
    user = request.user
    
    try:
        profile_picture = user.profile.profile_picture
        is_google_account = user.profile.is_google_account
    except:
        profile_picture = None
        is_google_account = False
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'profile_picture': profile_picture,
        'is_google_account': is_google_account,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    })
