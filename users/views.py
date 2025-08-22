from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout

from django.http import JsonResponse
from firebase_admin import auth, exceptions
from django.conf import settings
from .forms import ProfileCompletionForm
from .models import Gamer
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
            first_name = request.POST.get('first_name', '').strip()
            last_name = request.POST.get('last_name', '').strip()
            
            # Check if user already exists with this email
            if Gamer.objects.filter(email=email).exists():
                messages.error(request, "An account with this email already exists. Please login instead.")
                return redirect('users:login')
            
            # Create Firebase user
            firebase_user = auth.create_user(
                email=email,
                password=password,
                display_name=f"{first_name} {last_name}".strip() or None
            )
            
            # Create Gamer object for gaming data (NO Django User creation)
            gamer = Gamer.objects.create(
                uid=firebase_user.uid,
                email=firebase_user.email,
                first_name=first_name,
                last_name=last_name
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
        return redirect('users:gamer_dashboard')
    
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
                        user = Gamer.objects.get(email=firebase_email)
                        print("Found existing user by email:", user.uid)
                        
                        # Update Firebase UID if it has changed
                        if user.uid != firebase_uid:
                            print(f"Updating Firebase UID from {user.uid} to {firebase_uid}")
                            user.uid = firebase_uid
                            user.save()
                    except Gamer.DoesNotExist:
                        print("No user found by email, creating new user")
                        pass
                
                # If no user found by email, try by Firebase UID
                if not user:
                    try:
                        user = Gamer.objects.get(uid=firebase_uid)
                        print("Found existing user by Firebase UID:", user.uid)
                        
                        # Update email if it has changed
                        if user.email != firebase_email:
                            print(f"Updating email from {user.email} to {firebase_email}")
                            user.email = firebase_email
                            user.save()
                    except Gamer.DoesNotExist:
                        print("No user found by Firebase UID, creating new user")
                        pass
                
                # If still no user found, create a new one
                if not user:
                    user = Gamer.objects.create(
                        uid=firebase_uid,
                        email=firebase_email,
                        first_name=decoded_token.get('name', '').split(' ')[0] if decoded_token.get('name') else '',
                    )
                    created = True
                    print("Created new user:", user.uid)
                
                # Update last login
                user.last_login = timezone.now()
                user.save()
                
                # For Firebase users, we don't create Django User objects
                # Instead, we'll use a custom authentication approach
                # Store Firebase user info in session for authentication
                request.session['firebase_user'] = {
                    'uid': firebase_uid,
                    'email': firebase_email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
                request.session['firebase_authenticated'] = True
                print("Firebase user logged in successfully")
                print(f"Firebase UID: {firebase_uid}")
                print(f"Firebase Email: {firebase_email}")
                print(f"Gamer UID: {user.uid}")
                print(f"Session authenticated: {request.session.get('firebase_authenticated', False)}")
                
                if not data.get('remember', False):
                    request.session.set_expiry(0)
                
                # Always redirect to dashboard - the modal will show if profile is incomplete
                redirect_url = reverse('users:gamer_dashboard')
                
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
    # Clear Firebase session data
    if 'firebase_authenticated' in request.session:
        del request.session['firebase_authenticated']
    if 'firebase_user' in request.session:
        del request.session['firebase_user']
    if 'profile_completed' in request.session:
        del request.session['profile_completed']
    
    # Also logout Django user if they were logged in
    if request.user.is_authenticated:
        logout(request)
    
    messages.success(request, "You have been successfully logged out. Please login again to access your dashboard.")
    return redirect('core:home')


def gamer_dashboard(request):
    # Check if user is authenticated via Firebase session
    if not request.session.get('firebase_authenticated'):
        messages.error(request, "Please login to access your dashboard.")
        return redirect('users:login')
    
    # Get Firebase user data from session
    firebase_user_data = request.session.get('firebase_user')
    if not firebase_user_data:
        messages.error(request, "Session expired. Please login again.")
        return redirect('users:login')
    
    print("=== DASHBOARD ACCESSED ===")
    print(f"Firebase user: {firebase_user_data}")
    print(f"Session authenticated: {request.session.get('firebase_authenticated')}")
    print(f"Firebase email: {firebase_user_data.get('email')}")
    
    # Get the associated Gamer object
    try:
        gamer = Gamer.objects.get(uid=firebase_user_data['uid'])
    except Gamer.DoesNotExist:
        messages.error(request, "User profile not found. Please contact support.")
        return redirect('users:login')
    
    # Debug logging
    print(f"Dashboard accessed for gamer: {gamer.uid}")
    print(f"Profile completed flag: {gamer.profile_completed}")
    print(f"Is profile complete: {gamer.is_profile_complete()}")
    print(f"Bio: '{gamer.bio}'")
    print(f"Location: '{gamer.location}'")
    print(f"Platforms: {gamer.platforms}")
    print(f"Games: {gamer.games}")
    
    # If profile is marked as completed but doesn't actually meet requirements, reset it
    if gamer.profile_completed and not gamer.is_profile_complete():
        print("Profile was marked as completed but doesn't meet requirements. Resetting...")
        gamer.profile_completed = False
        gamer.save()
    
    # Calculate user stats based on profile data
    user_stats = {
        'games_count': len(gamer.games) if gamer.games and len(gamer.games) > 0 else 0,
        'platforms_count': len(gamer.platforms) if gamer.platforms and len(gamer.platforms) > 0 else 0,
        'join_date': gamer.date_joined.strftime("%B %Y") if gamer.date_joined else "Unknown",
        'age': None,
        'location': gamer.location if gamer.location and gamer.location != "Nairobi" and gamer.location != "" else "Location not set",
    }
    
    # Calculate age if date of birth is available
    if gamer.date_of_birth:
        from datetime import date
        today = date.today()
        age = today.year - gamer.date_of_birth.year - ((today.month, today.day) < (gamer.date_of_birth.month, gamer.date_of_birth.day))
        user_stats['age'] = age
    
    # Generate dynamic content based on user's games and platforms
    featured_game = None
    if gamer.games and len(gamer.games) > 0 and gamer.games[0]:
        featured_game = {
            'name': gamer.games[0],
            'hours_played': 1250,  # This would come from actual game data in a real app
            'win_rate': 87,
            'competitions': 24,
            'rank': 'Radiant' if 'Valorant' in gamer.games[0] else 'Elite' if 'FIFA' in gamer.games[0] else 'Master'
        }
    
    # Determine display username - prioritize custom username over Firebase UID
    display_username = gamer.uid
    
    # If uid looks like a Firebase UID (long alphanumeric string), use better fallback
    if len(gamer.uid) > 28 or (len(gamer.uid) > 20 and gamer.uid.replace('_', '').replace('-', '').isalnum()):
        # Check if user has a custom username set (not the Firebase UID)
        if hasattr(gamer, 'custom_username') and gamer.custom_username:
            display_username = gamer.custom_username
        elif gamer.first_name:
            display_username = gamer.first_name
        elif gamer.email:
            # Use email prefix but capitalize it nicely
            email_prefix = gamer.email.split('@')[0]
            display_username = email_prefix.capitalize()
        else:
            display_username = "User"
    
    return render(request, 'users/gamer_dashboard.html', {
        'user': gamer,  # Pass the gamer object as user for templates
        'user_stats': user_stats,
        'featured_game': featured_game,
        'display_username': display_username
    })


def profile_completion(request):
    # Check if user is authenticated via Firebase session
    if not request.session.get('firebase_authenticated'):
        messages.error(request, "Please login to access profile completion.")
        return redirect('users:login')
    
    # Get Firebase user data from session
    firebase_user_data = request.session.get('firebase_user')
    if not firebase_user_data:
        messages.error(request, "Session expired. Please login again.")
        return redirect('users:login')
    
    # Get the associated Gamer object
    try:
        gamer = Gamer.objects.get(uid=firebase_user_data['uid'])
    except Gamer.DoesNotExist:
        messages.error(request, "User profile not found. Please contact support.")
        return redirect('users:login')
    
    if request.method == 'POST':
        form = ProfileCompletionForm(request.POST, request.FILES, instance=gamer)
        
        if form.is_valid():
            gamer = form.save()
            
            # The save method will automatically update profile_completed based on is_profile_complete()
            # Just ensure we save to trigger the automatic update
            gamer.save()
            print(f"Profile completion status for gamer {gamer.uid}: {gamer.profile_completed}")
            print(f"Is profile complete: {gamer.is_profile_complete()}")
            print(f"Bio: '{gamer.bio}' (valid: {gamer.bio and gamer.bio != 'Bio' and gamer.bio != '' and len(gamer.bio.strip()) > 0})")
            print(f"Location: '{gamer.location}' (valid: {gamer.location and gamer.location != 'Nairobi' and gamer.location != '' and len(gamer.location.strip()) > 0})")
            print(f"Games: {gamer.games} (valid: {gamer.games and len(gamer.games) > 0})")
            print(f"Platforms: {gamer.platforms} (valid: {gamer.platforms and len(gamer.platforms) > 0})")
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                # Determine display username for response
                display_username = gamer.custom_username or gamer.first_name or gamer.email.split('@')[0].capitalize()
                
                return JsonResponse({
                    'success': True,
                    'profile_picture_url': gamer.profile_picture.url if gamer.profile_picture else '',
                    'username': gamer.custom_username or gamer.uid,  # Return custom username if available
                    'display_username': display_username,
                    'bio': gamer.bio,
                    'about': gamer.about,
                    'location': gamer.location,
                    'date_of_birth': gamer.date_of_birth.strftime('%Y-%m-%d') if gamer.date_of_birth else None,
                    'platforms': gamer.platforms,
                    'games': gamer.games,
                    'profile_completed': gamer.profile_completed,
                    'is_profile_complete': gamer.is_profile_complete(),
                    'redirect_url': reverse('users:gamer_dashboard') if gamer.is_profile_complete() else None
                })
            
            messages.success(request, "Profile updated successfully!")
            if gamer.is_profile_complete():
                return redirect('users:gamer_dashboard')
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
        form = ProfileCompletionForm(instance=gamer)
    
    return render(request, 'users/profile_completion.html', {
        'form': form,
        'user': gamer  # Pass the gamer object as user for templates
    })


def user_settings(request):
    """User settings page with profile editing and account management"""
    # Check if user is authenticated via Firebase session
    if not request.session.get('firebase_authenticated'):
        messages.error(request, "Please login to access settings.")
        return redirect('users:login')
    
    # Get Firebase user data from session
    firebase_user_data = request.session.get('firebase_user')
    if not firebase_user_data:
        messages.error(request, "Session expired. Please login again.")
        return redirect('users:login')
    
    # Get the associated Gamer object
    try:
        gamer = Gamer.objects.get(uid=firebase_user_data['uid'])
    except Gamer.DoesNotExist:
        messages.error(request, "User profile not found. Please contact support.")
        return redirect('users:login')
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'update_profile':
            # Handle profile update
            form = ProfileCompletionForm(request.POST, request.FILES, instance=gamer)
            if form.is_valid():
                gamer = form.save()
                messages.success(request, "Profile updated successfully!")
                return redirect('users:user_settings')
            else:
                messages.error(request, "Please correct the errors below.")
        
        elif action == 'delete_account':
            # Handle account deletion
            password = request.POST.get('password')
            if password:
                try:
                    # Delete the gamer from Django database
                    gamer.delete()
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
                        gamer.uid,  # Firebase UID
                        password=new_password
                    )
                    messages.success(request, "Password updated successfully!")
                except Exception as e:
                    messages.error(request, f"Error updating password: {str(e)}")
    
    # Prepare forms
    profile_form = ProfileCompletionForm(instance=gamer)
    
    # Calculate user stats
    user_stats = {
        'games_count': len(gamer.games) if gamer.games else 0,
        'platforms_count': len(gamer.platforms) if gamer.platforms else 0,
        'join_date': gamer.date_joined.strftime("%B %Y") if gamer.date_joined else "Unknown",
        'last_login': gamer.last_login.strftime("%B %d, %Y") if gamer.last_login else "Never",
    }
    
    return render(request, 'users/gamer_settings.html', {
        'user': gamer,  # Pass the gamer object as user for templates
        'profile_form': profile_form,
        'user_stats': user_stats
    })


def edit_profile(request):
    """Edit profile page - only allows editing of specific fields"""
    # Check if user is authenticated via Firebase session
    if not request.session.get('firebase_authenticated'):
        messages.error(request, "Please login to access profile editing.")
        return redirect('users:login')
    
    # Get Firebase user data from session
    firebase_user_data = request.session.get('firebase_user')
    if not firebase_user_data:
        messages.error(request, "Session expired. Please login again.")
        return redirect('users:login')
    
    # Get the associated Gamer object
    try:
        gamer = Gamer.objects.get(uid=firebase_user_data['uid'])
    except Gamer.DoesNotExist:
        messages.error(request, "User profile not found. Please contact support.")
        return redirect('users:login')
    
    if request.method == 'POST':
        # Only handle editable fields: custom_username, bio, about, platforms, games, profile_picture
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                # Validate required fields
                custom_username = request.POST.get('custom_username', '').strip()
                bio = request.POST.get('bio', '').strip()
                about = request.POST.get('about', '').strip()
                platforms = request.POST.get('platforms', '[]')
                games = request.POST.get('games', '[]')
                
                # Validate custom_username
                if not custom_username:
                    return JsonResponse({
                        'success': False,
                        'message': 'Username is required.'
                    }, status=400)
                
                # Check username format
                import re
                if not re.fullmatch(r'^[A-Za-z0-9_]{3,20}$', custom_username):
                    return JsonResponse({
                        'success': False,
                        'message': 'Username must be 3-20 characters, letters, numbers, and underscores only.'
                    }, status=400)
                
                # Check username availability (excluding current user)
                existing_gamer = Gamer.objects.filter(custom_username__iexact=custom_username).exclude(pk=gamer.pk)
                if existing_gamer.exists():
                    return JsonResponse({
                        'success': False,
                        'message': 'This username is already taken.'
                    }, status=400)
                
                # Validate bio
                if not bio or len(bio) < 10 or len(bio) > 160:
                    return JsonResponse({
                        'success': False,
                        'message': 'Bio must be 10-160 characters.'
                    }, status=400)
                
                # Validate about (optional)
                if about and (len(about) < 30 or len(about) > 500):
                    return JsonResponse({
                        'success': False,
                        'message': 'About must be 30-500 characters if provided.'
                    }, status=400)
                
                # Parse platforms and games
                try:
                    platforms_list = json.loads(platforms) if platforms else []
                    games_list = json.loads(games) if games else []
                except json.JSONDecodeError:
                    return JsonResponse({
                        'success': False,
                        'message': 'Invalid platforms or games data.'
                    }, status=400)
                
                # Validate platforms and games
                if not platforms_list:
                    return JsonResponse({
                        'success': False,
                        'message': 'At least one platform must be selected.'
                    }, status=400)
                
                if not games_list:
                    return JsonResponse({
                        'success': False,
                        'message': 'At least one game must be selected.'
                    }, status=400)
                
                # Update only editable fields
                gamer.custom_username = custom_username
                gamer.bio = bio
                gamer.about = about
                gamer.platforms = platforms_list
                gamer.games = games_list
                
                # Handle profile picture upload
                if 'profile_picture' in request.FILES:
                    gamer.profile_picture = request.FILES['profile_picture']
                
                # Save the gamer object
                gamer.save()
                
                # Calculate updated user stats
                user_stats = {
                    'games_count': len(gamer.games) if gamer.games else 0,
                    'platforms_count': len(gamer.platforms) if gamer.platforms else 0,
                    'join_date': gamer.date_joined.strftime("%B %Y") if gamer.date_joined else "Unknown",
                }
                
                return JsonResponse({
                    'success': True,
                    'message': 'Profile updated successfully!',
                    'user': {
                        'display_name': gamer.display_name,
                        'custom_username': gamer.custom_username,
                        'email': gamer.email,
                        'bio': gamer.bio,
                        'location': gamer.location,
                        'about': gamer.about,
                        'games': gamer.games,
                        'platforms': gamer.platforms,
                        'profile_picture_url': gamer.profile_picture.url if gamer.profile_picture else None,
                    },
                    'user_stats': user_stats
                })
                
            except Exception as e:
                print(f"Error updating profile: {e}")
                return JsonResponse({
                    'success': False,
                    'message': 'An error occurred while updating your profile. Please try again.'
                }, status=500)
        else:
            # Non-AJAX request - redirect to settings
            messages.info(request, "Please use the form to update your profile.")
            return redirect('users:gamer_settings')
    
    # Prepare forms for display (read-only for non-editable fields)
    profile_form = ProfileCompletionForm(instance=gamer)
    
    # Calculate user stats for display
    display_user_stats = {
        'games_count': len(gamer.games) if gamer.games else 0,
        'platforms_count': len(gamer.platforms) if gamer.platforms else 0,
        'join_date': gamer.date_joined.strftime("%B %Y") if gamer.date_joined else "Unknown",
        'last_login': gamer.last_login.strftime("%B %d, %Y") if gamer.last_login else "Never",
    }
    
    return render(request, 'users/edit_profile.html', {
        'user': gamer,  # Pass the gamer object as user for templates
        'profile_form': profile_form,
        'user_stats': display_user_stats
    })


@require_GET
def check_username(request):
    username = (request.GET.get('username') or '').strip()
    # Basic pattern check: 3–20 chars, letters/numbers/underscore
    import re
    if not re.fullmatch(r'^[A-Za-z0-9_]{3,20}$', username):
        return JsonResponse({'available': False, 'reason': 'invalid_format'})
    qs = Gamer.objects.filter(custom_username__iexact=username)
    
    # Check if user is authenticated via Firebase session
    if request.session.get('firebase_authenticated'):
        firebase_user_data = request.session.get('firebase_user')
        if firebase_user_data:
            try:
                current_gamer = Gamer.objects.get(uid=firebase_user_data['uid'])
                qs = qs.exclude(pk=current_gamer.pk)
            except Gamer.DoesNotExist:
                pass
    
    is_available = not qs.exists()
    return JsonResponse({'available': is_available})