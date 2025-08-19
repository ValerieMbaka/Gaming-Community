from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages


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
            
            # Check if profile is complete
            if not request.user.is_profile_complete():
                # Allow access to dashboard but the modal will show
                # Only redirect if trying to access profile completion page directly
                if request.path == reverse('users:complete_profile'):
                    messages.warning(
                        request, 
                        "Please complete your profile through the dashboard."
                    )
                    return redirect('users:user_dashboard')
        
        response = self.get_response(request)
        return response
