from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, TwoFactorAuth

# Register your models here.
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name = 'Profile'
    verbose_name_plural = 'Profiles'


# Extend the UserAdmin to include the profile inline
class ExtendedUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)

    def get_inline_instances(self, request, obj=None):
        if obj:
            # Ensure user has a profile before rendering inlines
            UserProfile.get_or_create_profile(obj)
        return super().get_inline_instances(request, obj)


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, ExtendedUserAdmin)
admin.site.register(TwoFactorAuth)
