import pyotp
import qrcode
from io import BytesIO
import base64
import random
import string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import TwoFactorAuth
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class TwoFactorSetupView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Generate a TOTP secret and QR code for 2FA setup
        """
        user = request.user
        
        # Get or create 2FA record
        two_factor, created = TwoFactorAuth.objects.get_or_create(user=user)
        
        if two_factor.is_enabled and not request.GET.get('force'):
            return Response({
                'message': '2FA is already enabled',
                'is_enabled': True
            })
        
        # Generate a new secret
        secret_key = pyotp.random_base32()
        two_factor.secret_key = secret_key
        two_factor.save()
        
        # Generate the TOTP provisioning URI
        totp = pyotp.TOTP(secret_key)
        uri = totp.provisioning_uri(user.email, issuer_name="CodeDocgen")
        
        # Generate QR code
        qr = qrcode.make(uri)
        buffered = BytesIO()
        qr.save(buffered)
        qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        # Generate backup codes
        backup_codes = self._generate_backup_codes()
        two_factor.backup_codes = backup_codes
        two_factor.save()
        
        return Response({
            'secret_key': secret_key,
            'qr_code': f"data:image/png;base64,{qr_base64}",
            'backup_codes': backup_codes,
        })
    
    def post(self, request):
        """
        Verify and activate 2FA
        """
        user = request.user
        code = request.data.get('code')
        
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            two_factor = TwoFactorAuth.objects.get(user=user)
            totp = pyotp.TOTP(two_factor.secret_key)
            
            if totp.verify(code):
                two_factor.is_enabled = True
                two_factor.save()
                return Response({
                    'message': '2FA enabled successfully',
                    'is_enabled': True,
                    'backup_codes': two_factor.backup_codes
                })
            else:
                return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
        except TwoFactorAuth.DoesNotExist:
            return Response({'error': '2FA not set up'}, status=status.HTTP_400_BAD_REQUEST)
    
    def _generate_backup_codes(self, count=10, length=10):
        """
        Generate backup codes for 2FA
        """
        codes = []
        for _ in range(count):
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
            formatted_code = '-'.join([code[i:i+5] for i in range(0, len(code), 5)])
            codes.append(formatted_code)
        return codes

class TwoFactorVerifyView(APIView):
    def post(self, request):
        """
        Verify a 2FA code during login
        """
        user_id = request.data.get('user_id')
        code = request.data.get('code')
        backup_code = request.data.get('backup_code')
        
        if not user_id or (not code and not backup_code):
            return Response({'error': 'User ID and code are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            two_factor = TwoFactorAuth.objects.get(user=user, is_enabled=True)
            
            if code:
                # Verify TOTP code
                totp = pyotp.TOTP(two_factor.secret_key)
                if not totp.verify(code):
                    return Response({'error': 'Invalid code'}, status=status.HTTP_400_BAD_REQUEST)
            elif backup_code:
                # Verify backup code
                if backup_code not in two_factor.backup_codes:
                    return Response({'error': 'Invalid backup code'}, status=status.HTTP_400_BAD_REQUEST)
                # Remove used backup code
                two_factor.backup_codes.remove(backup_code)
                two_factor.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Get profile picture if available
            profile_picture = None
            try:
                if hasattr(user, 'profile'):
                    profile_picture = user.profile.profile_picture
            except Exception:
                pass
                
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'profile_picture': profile_picture
                }
            })
            
        except (User.DoesNotExist, TwoFactorAuth.DoesNotExist):
            return Response({'error': 'Invalid user or 2FA not enabled'}, status=status.HTTP_400_BAD_REQUEST)

class TwoFactorDisableView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Disable 2FA for a user
        """
        user = request.user
        
        try:
            two_factor = TwoFactorAuth.objects.get(user=user)
            two_factor.is_enabled = False
            two_factor.secret_key = None
            two_factor.backup_codes = []
            two_factor.save()
            
            return Response({
                'message': '2FA disabled successfully',
                'is_enabled': False
            })
        except TwoFactorAuth.DoesNotExist:
            return Response({'message': '2FA was not enabled'}, status=status.HTTP_200_OK)

class TwoFactorStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get the 2FA status for the current user
        """
        user = request.user
        
        try:
            two_factor = TwoFactorAuth.objects.get(user=user)
            return Response({
                'is_enabled': two_factor.is_enabled
            })
        except TwoFactorAuth.DoesNotExist:
            return Response({
                'is_enabled': False
            })