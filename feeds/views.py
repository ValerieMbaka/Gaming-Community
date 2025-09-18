from django.shortcuts import render

# Create your views here.

def feeds_view(request):
    """
    View for the gaming feeds page.
    Displays a social media-style feed with gaming posts, filters, and interactions.
    """
    return render(request, 'feeds/feeds.html')
