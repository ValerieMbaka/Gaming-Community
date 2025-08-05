from django.shortcuts import render

# Create your views
def index(request):
    """
    Render the index page of the gaming platform.
    """
    return render(request, 'core/index.html')