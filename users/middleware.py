from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages
from .models import Gamer


class ProfileCompletionMiddleware:
    """
    Middleware to enforce profile completion for authenticated users.
    Allows dashboard access but ensures profile completion modal shows for incomplete profiles.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # List of URLs that don't require profile completion
        exempt_urls = [
            reverse('users:logout'),
            reverse('core:home'),
            '/admin/',
            '/static/',
            '/media/',
        ]
        
        # Check if user is authenticated and accessing a protected URL
        if (request.user.is_authenticated and 
            not any(request.path.startswith(url) for url in exempt_urls)):
            
            # Skip profile completion check for admin users
            if request.user.is_superuser or request.user.is_staff:
                response = self.get_response(request)
                return response
            
            # Get the associated Gamer object to check profile completion
            try:
                gamer = Gamer.objects.get(email=request.user.email)
                profile_complete = gamer.is_profile_complete()
            except Gamer.DoesNotExist:
                # If no Gamer object exists, consider profile incomplete
                profile_complete = False
            
            # Check if profile is complete
            if not profile_complete:
                # Allow access to dashboard but the modal will show
                # Only redirect if trying to access profile completion page directly
                if request.path == reverse('users:complete_profile'):
                    messages.warning(
                        request, 
                        "Please complete your profile through the dashboard."
                    )
                    return redirect('users:gamer_dashboard')
        
        response = self.get_response(request)
        return response
