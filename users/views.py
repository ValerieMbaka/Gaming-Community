from django.shortcuts import render, redirect



# Create your views here.
def login_view(request):
    return render(request, 'users/login.html')

def register_view(request):
    return render(request, 'users/register.html')

def user_dashboard(request):
    return render(request, 'users/user_dashboard.html')

def user_profile(request):
    return render(request, 'users/user_profile.html')