# users\admin.py
from django.contrib import admin
from .models import Gamer

# Register your models here.

@admin.register(Gamer)
class GamerAdmin(admin.ModelAdmin):
    """Admin interface for Gamer model - only shows Firebase users, not admin users"""
    
    list_display = ('custom_username', 'email', 'first_name', 'last_name', 'profile_completed', 'date_joined')
    list_filter = ('profile_completed', 'date_joined')
    search_fields = ('custom_username', 'email', 'first_name', 'last_name')
    readonly_fields = ('uid', 'date_joined', 'last_login')
    
    def get_queryset(self, request):
        """Filter out admin users from the Gamer list"""
        qs = super().get_queryset(request)
        # Only show users who have Firebase UIDs (not admin users)
        return qs.exclude(uid__isnull=True).exclude(uid='')
    
    def has_add_permission(self, request):
        """Prevent adding Gamer objects manually through admin"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Allow deletion of Gamer objects"""
        return True