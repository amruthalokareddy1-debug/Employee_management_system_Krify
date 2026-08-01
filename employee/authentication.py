from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class VersionedJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that checks if the 'login_version' in the token
    matches the 'login_version' in the user's EmployeeProfile.
    """
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user is None:
            return None
        
        # Get login version from token
        token_version = validated_token.get('login_version')
        
        try:
            # Get current login version from profile
            current_version = user.employee_profile.login_version
        except Exception:
            # If user has no profile or other error, fallback to normal auth
            return user
            
        if token_version != current_version:
            raise AuthenticationFailed(
                'This session has been invalidated by a login on another device.',
                code='session_invalidated'
            )
            
        return user
