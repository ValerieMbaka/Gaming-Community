from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from firebase_admin import auth, exceptions
from .forms import ProfileCompletionForm
from .models import CustomUser
import json
from django.urls import reverse
from firebase_admin.auth import (
    InvalidIdTokenError,
    ExpiredIdTokenError,
    RevokedIdTokenError,
    CertificateFetchError
)


def register_view(request):
    if request.method == 'POST':
        try:
            email = request.POST.get('email')
            password = request.POST.get('password')
            full_name = request.POST.get('full_name', '').strip()
            
            # Create Firebase user
            user = auth.create_user(
                email=email,
                password=password,
                display_name=full_name or None
            )
            
            # Create Django user
            django_user = CustomUser.objects.create(
                username=user.uid,
                email=user.email,
                first_name=full_name.split(' ')[0] if full_name else '',
                last_name=' '.join(full_name.split(' ')[1:]) if len(full_name.split(' ')) > 1 else ''
            )
            
            messages.success(request, "Registration successful! Please login.")
            return redirect('users:login')
        
        except exceptions.FirebaseError as e:
            error_message = str(e)
            if 'email' in error_message:
                messages.error(request, "This email is already in use. Please use a different email.")
            elif 'password' in error_message:
                messages.error(request, "Password should be at least 6 characters.")
            else:
                messages.error(request, f"Registration failed: {error_message}")
        except Exception as e:
            messages.error(request, "An unexpected error occurred during registration. Please try again.")
        
        return redirect('users:register')
    
    return render(request, 'users/register.html')


def login_view(request):
    if request.user.is_authenticated:
        return redirect('users:user_dashboard')
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            id_token = data.get('id_token')
            
            if not id_token:
                return JsonResponse(
                    {'success': False, 'message': 'Missing authentication token'},
                    status=400
                )
            
            try:
                # Verify the Firebase ID token
                decoded_token = auth.verify_id_token(id_token)
                firebase_uid = decoded_token['uid']
                
                # Get or create Django user
                user, created = CustomUser.objects.get_or_create(
                    username=firebase_uid,
                    defaults={
                        'email': decoded_token.get('email', ''),
                        'first_name': decoded_token.get('name', '').split(' ')[0] if decoded_token.get('name') else '',
                    }
                )
                
                # Log the user in
                login(request, user)
                
                if not data.get('remember', False):
                    request.session.set_expiry(0)
                
                return JsonResponse({
                    'success': True,
                    'redirect_url': reverse('users:user_dashboard'),
                    'profile_complete': bool(user.bio and user.profile_picture)
                })
            
            except (InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError):
                return JsonResponse(
                    {'success': False, 'message': 'Invalid or expired session. Please login again.'},
                    status=401
                )
            except CertificateFetchError:
                return JsonResponse(
                    {'success': False, 'message': 'Authentication service unavailable. Please try again later.'},
                    status=503
                )
            except Exception as e:
                return JsonResponse(
                    {'success': False, 'message': 'Authentication failed.'},
                    status=500
                )
        
        except json.JSONDecodeError:
            return JsonResponse(
                {'success': False, 'message': 'Invalid request format.'},
                status=400
            )
    
    return render(request, 'users/login.html')


def logout_view(request):
    logout(request)
    messages.success(request, "You have been successfully logged out.")
    return redirect('core:home')


@login_required
def user_dashboard(request):
    return render(request, 'users/user_dashboard.html', {
        'user': request.user
    })


@login_required
def profile_completion(request):
    if request.method == 'POST':
        form = ProfileCompletionForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            user = form.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'profile_picture_url': user.profile_picture.url if user.profile_picture else '',
                    'username': user.username
                })
            
            messages.success(request, "Profile updated successfully!")
            return redirect('users:user_dashboard')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'errors': form.errors
                }, status=400)
            
            messages.error(request, "Please correct the errors below.")
    else:
        form = ProfileCompletionForm(instance=request.user)
    
    return render(request, 'users/profile_completion.html', {
        'form': form,
        'user': request.user
    })