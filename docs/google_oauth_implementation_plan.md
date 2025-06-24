# Google OAuth Integration Plan

## Backend Requirements
1. Install django-allauth: `pip install django-allauth`
2. Configure Google OAuth in settings.py
3. Add OAuth URLs to urlpatterns
4. Create Google OAuth application in Google Console
5. Set up environment variables for Client ID and Secret

## Frontend Requirements
1. Install Google OAuth library: `npm install @google-cloud/oauth2`
2. Add Google Sign-In button to Login/Signup pages
3. Handle OAuth callback and token exchange
4. Integrate with existing AuthService

## Implementation Notes
- This should be implemented as an additional option alongside username/password login
- Existing functionality should remain unchanged
- Users should be able to link Google accounts to existing accounts
- New users signing up with Google should have username auto-generated from email

## Security Considerations
- Implement proper CSRF protection for OAuth flows
- Validate OAuth tokens server-side
- Store minimal user data from Google profile
- Implement proper session management

This feature can be added later without affecting the current enhanced authentication system.
