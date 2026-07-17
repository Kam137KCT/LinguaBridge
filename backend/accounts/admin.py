from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Translation preference", {"fields": ("preferred_language",)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Translation preference", {"fields": ("preferred_language",)}),
    )


admin.site.register(User, UserAdmin)