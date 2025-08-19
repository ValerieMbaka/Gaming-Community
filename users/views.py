from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from firebase_admin import auth, exceptions
from django.conf import settings
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
from django.views.decorators.http import require_GET
from django.utils import timezone


def register_view(request):
    if request.method == 'POST':
        try:
            email = request.POST.get('email')
            password = request.POST.get('password')
            full_name = request.POST.get('full_name', '').strip()
            
            # Check if user already exists with this email
            if CustomUser.objects.filter(email=email).exists():
                messages.error(request, "An account with this email already exists. Please login instead.")
                return redirect('users:login')
            
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
            messages.error(request, f"Registration failed: {str(e)}")
    
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
                # Add debug print
                print("Attempting to verify ID token...")
                
                # Verify the Firebase ID token against the initialized app with small clock skew tolerance
                decoded_token = auth.verify_id_token(
                    id_token,
                    app=getattr(settings, 'FIREBASE_APP', None),
                    clock_skew_seconds=60  # max allowed by SDK
                )
                print("Token decoded successfully:", decoded_token)
                
                firebase_uid = decoded_token['uid']
                firebase_email = decoded_token.get('email', '')
                print("Firebase UID:", firebase_uid)
                print("Firebase Email:", firebase_email)
                
                # First, try to find user by email (this ensures one email = one account)
                user = None
                created = False
                
                if firebase_email:
                    try:
                        user = CustomUser.objects.get(email=firebase_email)
                        print("Found existing user by email:", user.username)
                        
                        # Update Firebase UID if it has changed
                        if user.username != firebase_uid:
                            print(f"Updating Firebase UID from {user.username} to {firebase_uid}")
                            user.username = firebase_uid
                            user.save()
                    except CustomUser.DoesNotExist:
                        print("No user found by email, creating new user")
                        pass
                
                # If no user found by email, try by Firebase UID
                if not user:
                    try:
                        user = CustomUser.objects.get(username=firebase_uid)
                        print("Found existing user by Firebase UID:", user.username)
                        
                        # Update email if it has changed
                        if user.email != firebase_email:
                            print(f"Updating email from {user.email} to {firebase_email}")
                            user.email = firebase_email
                            user.save()
                    except CustomUser.DoesNotExist:
                        print("No user found by Firebase UID, creating new user")
                        pass
                
                # If still no user found, create a new one
                if not user:
                    user = CustomUser.objects.create(
                        username=firebase_uid,
                        email=firebase_email,
                        first_name=decoded_token.get('name', '').split(' ')[0] if decoded_token.get('name') else '',
                    )
                    created = True
                    print("Created new user:", user.username)
                
                # Update last login
                user.last_login = timezone.now()
                user.save()
                
                # Log the user in, specifying backend since multiple backends are configured
                login(request, user, backend='users.backends.FirebaseBackend')
                print("User logged in successfully")
                
                if not data.get('remember', False):
                    request.session.set_expiry(0)
                
                # Always redirect to dashboard - the modal will show if profile is incomplete
                redirect_url = reverse('users:user_dashboard')
                
                return JsonResponse({
                    'success': True,
                    'redirect_url': redirect_url,
                    'profile_complete': user.is_profile_complete(),
                    'user_created': created
                })
            
            except (InvalidIdTokenError, ExpiredIdTokenError, RevokedIdTokenError) as e:
                print("Token verification failed:", e.__class__.__name__, str(e))
                return JsonResponse(
                    {
                        'success': False,
                        'message': 'Invalid or expired session. Please login again.' if not settings.DEBUG else f'{e.__class__.__name__}: {str(e)}'
                    },
                    status=401
                )
            except CertificateFetchError as e:
                print("Certificate fetch error:", e.__class__.__name__, str(e))
                return JsonResponse(
                    {'success': False, 'message': 'Authentication service unavailable. Please try again later.'},
                    status=503
                )
            except Exception as e:
                print("Unexpected error during authentication:", e.__class__.__name__, str(e))
                return JsonResponse(
                    {
                        'success': False,
                        'message': 'Authentication failed.' if not settings.DEBUG else f'{e.__class__.__name__}: {str(e)}'
                    },
                    status=500
                )
        
        except json.JSONDecodeError as e:
            print("JSON decode error:", str(e))
            return JsonResponse(
                {'success': False, 'message': 'Invalid request format.'},
                status=400
            )
    
    return render(request, 'users/login.html')


def logout_view(request):
    # Clear any profile completion data from session and localStorage
    if 'profile_completed' in request.session:
        del request.session['profile_completed']
    
    # Logout the user
    logout(request)
    
    messages.success(request, "You have been successfully logged out. Please login again to access your dashboard.")
    return redirect('core:home')


@login_required
def user_dashboard(request):
    user = request.user
    
    # Debug logging
    print(f"Dashboard accessed for user: {user.username}")
    print(f"Profile completed flag: {user.profile_completed}")
    print(f"Is profile complete: {user.is_profile_complete()}")
    print(f"Bio: '{user.bio}'")
    print(f"Location: '{user.location}'")
    print(f"Platforms: {user.platforms}")
    print(f"Games: {user.games}")
    
    # If profile is marked as completed but doesn't actually meet requirements, reset it
    if user.profile_completed and not user.is_profile_complete():
        print("Profile was marked as completed but doesn't meet requirements. Resetting...")
        user.profile_completed = False
        user.save()
    
    # Calculate user stats based on profile data
    user_stats = {
        'games_count': len(user.games) if user.games and len(user.games) > 0 else 0,
        'platforms_count': len(user.platforms) if user.platforms and len(user.platforms) > 0 else 0,
        'join_date': user.date_joined.strftime("%B %Y") if user.date_joined else "Unknown",
        'age': None,
        'location': user.location if user.location and user.location != "Nairobi" and user.location != "" else "Location not set",
    }
    
    # Calculate age if date of birth is available
    if user.date_of_birth:
        from datetime import date
        today = date.today()
        age = today.year - user.date_of_birth.year - ((today.month, today.day) < (user.date_of_birth.month, user.date_of_birth.day))
        user_stats['age'] = age
    
    # Generate dynamic content based on user's games and platforms
    featured_game = None
    if user.games and len(user.games) > 0 and user.games[0]:
        featured_game = {
            'name': user.games[0],
            'hours_played': 1250,  # This would come from actual game data in a real app
            'win_rate': 87,
            'competitions': 24,
            'rank': 'Radiant' if 'Valorant' in user.games[0] else 'Elite' if 'FIFA' in user.games[0] else 'Master'
        }
    
    # Determine display username - prioritize custom username over Firebase UID
    display_username = user.username
    
    # If username looks like a Firebase UID (long alphanumeric string), use better fallback
    if len(user.username) > 28 or (len(user.username) > 20 and user.username.replace('_', '').replace('-', '').isalnum()):
        # Check if user has a custom username set (not Firebase UID)
        if hasattr(user, 'custom_username') and user.custom_username:
            display_username = user.custom_username
        elif user.first_name:
            display_username = user.first_name
        elif user.email:
            # Use email prefix but capitalize it nicely
            email_prefix = user.email.split('@')[0]
            display_username = email_prefix.capitalize()
        else:
            display_username = "User"
    
    return render(request, 'users/user_dashboard.html', {
        'user': user,
        'user_stats': user_stats,
        'featured_game': featured_game,
        'display_username': display_username
    })


@login_required
def profile_completion(request):
    if request.method == 'POST':
        form = ProfileCompletionForm(request.POST, request.FILES, instance=request.user)
        
        if form.is_valid():
            user = form.save()
            
            # The save method will automatically update profile_completed based on is_profile_complete()
            # Just ensure we save to trigger the automatic update
            user.save()
            print(f"Profile completion status for user {user.username}: {user.profile_completed}")
            print(f"Is profile complete: {user.is_profile_complete()}")
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                # Determine display username for response
                display_username = user.custom_username or user.first_name or user.email.split('@')[0].capitalize()
                
                return JsonResponse({
                    'success': True,
                    'profile_picture_url': user.profile_picture.url if user.profile_picture else '',
                    'username': user.custom_username or user.username,  # Return custom username if available
                    'display_username': display_username,
                    'bio': user.bio,
                    'about': user.about,
                    'location': user.location,
                    'platforms': user.platforms,
                    'games': user.games,
                    'profile_completed': user.profile_completed,
                    'is_profile_complete': user.is_profile_complete(),
                    'redirect_url': reverse('users:user_dashboard') if user.is_profile_complete() else None
                })
            
            messages.success(request, "Profile updated successfully!")
            if user.is_profile_complete():
                return redirect('users:user_dashboard')
            else:
                return redirect('users:complete_profile')
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


@login_required
def user_settings(request):
    """User settings page with profile editing and account management"""
    user = request.user
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'update_profile':
            # Handle profile update
            form = ProfileCompletionForm(request.POST, request.FILES, instance=user)
            if form.is_valid():
                user = form.save()
                messages.success(request, "Profile updated successfully!")
                return redirect('users:user_settings')
            else:
                messages.error(request, "Please correct the errors below.")
        
        elif action == 'delete_account':
            # Handle account deletion
            password = request.POST.get('password')
            if password:
                try:
                    # Delete the user from Django database
                    user.delete()
                    logout(request)
                    messages.success(request, "Account deleted successfully")
                    return redirect('core:home')
                except Exception as e:
                    messages.error(request, f"Error deleting account: {str(e)}")
            else:
                messages.error(request, "Password is required to delete your account.")
        
        elif action == 'change_password':
            # Handle password change
            current_password = request.POST.get('current_password')
            new_password = request.POST.get('new_password')
            confirm_password = request.POST.get('confirm_password')
            
            if new_password != confirm_password:
                messages.error(request, "New passwords don't match.")
            elif len(new_password) < 6:
                messages.error(request, "Password must be at least 6 characters long.")
            else:
                try:
                    # Update Firebase password
                    auth.update_user(
                        user.username,  # Firebase UID
                        password=new_password
                    )
                    messages.success(request, "Password updated successfully!")
                except Exception as e:
                    messages.error(request, f"Error updating password: {str(e)}")
    
    # Prepare forms
    profile_form = ProfileCompletionForm(instance=user)
    
    # Calculate user stats
    user_stats = {
        'games_count': len(user.games) if user.games else 0,
        'platforms_count': len(user.platforms) if user.platforms else 0,
        'join_date': user.date_joined.strftime("%B %Y") if user.date_joined else "Unknown",
        'last_login': user.last_login.strftime("%B %d, %Y") if user.last_login else "Never",
    }
    
    return render(request, 'users/user_settings.html', {
        'user': user,
        'profile_form': profile_form,
        'user_stats': user_stats
    })


@login_required
def edit_profile(request):
    """Edit profile page - moved from settings"""
    user = request.user
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'update_profile':
            form = ProfileCompletionForm(request.POST, request.FILES, instance=user)
            if form.is_valid():
                user = form.save()
                
                # Check if it's an AJAX request
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    # Calculate updated user stats
                    user_stats = {
                        'games_count': len(user.games) if user.games else 0,
                        'platforms_count': len(user.platforms) if user.platforms else 0,
                        'join_date': user.date_joined.strftime("%B %Y") if user.date_joined else "Unknown",
                    }
                    
                    return JsonResponse({
                        'success': True,
                        'message': 'Profile updated successfully!',
                        'user': {
                            'display_name': user.display_name,
                            'custom_username': user.custom_username,
                            'email': user.email,
                            'bio': user.bio,
                            'location': user.location,
                            'about': user.about,
                            'games': user.games,
                            'platforms': user.platforms,
                            'profile_picture_url': user.profile_picture.url if user.profile_picture else None,
                        },
                        'user_stats': user_stats
                    })
                else:
                    messages.success(request, "Profile updated successfully!")
                    return redirect('users:edit_profile')
            else:
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'success': False,
                        'errors': form.errors
                    }, status=400)
                else:
                    messages.error(request, "Please correct the errors below.")
    
    # Prepare forms
    profile_form = ProfileCompletionForm(instance=user)
    
    # Calculate user stats
    user_stats = {
        'games_count': len(user.games) if user.games else 0,
        'platforms_count': len(user.platforms) if user.platforms else 0,
        'join_date': user.date_joined.strftime("%B %Y") if user.date_joined else "Unknown",
        'last_login': user.last_login.strftime("%B %d, %Y") if user.last_login else "Never",
    }
    
    return render(request, 'users/edit_profile.html', {
        'user': user,
        'profile_form': profile_form,
        'user_stats': user_stats
    })


@require_GET
def check_username(request):
    username = (request.GET.get('username') or '').strip()
    # Basic pattern check: 3–20 chars, letters/numbers/underscore
    import re
    if not re.fullmatch(r'^[A-Za-z0-9_]{3,20}$', username):
        return JsonResponse({'available': False, 'reason': 'invalid_format'})
    qs = CustomUser.objects.filter(custom_username__iexact=username)
    if request.user.is_authenticated:
        qs = qs.exclude(pk=request.user.pk)
    is_available = not qs.exists()
    return JsonResponse({'available': is_available})