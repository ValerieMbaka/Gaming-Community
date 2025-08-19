from django.contrib.auth import get_user_model
from firebase_admin import auth
from django.contrib.auth.backends import BaseBackend

User = get_user_model()

class FirebaseBackend(BaseBackend):
    def authenticate(self, request, uid=None):
        try:
            firebase_user = auth.get_user(uid)
            
            # First try to find user by email
            user = None
            if firebase_user.email:
                try:
                    user = User.objects.get(email=firebase_user.email)
                    # Update Firebase UID if it has changed
                    if user.username != uid:
                        user.username = uid
                        user.save()
                except User.DoesNotExist:
                    pass
            
            # If no user found by email, try by Firebase UID
            if not user:
                try:
                    user = User.objects.get(username=uid)
                    # Update email if it has changed
                    if user.email != firebase_user.email:
                        user.email = firebase_user.email
                        user.save()
                except User.DoesNotExist:
                    pass
            
            # If still no user found, create a new one
            if not user:
                user = User.objects.create(
                    username=uid,
                    email=firebase_user.email,
                    first_name=firebase_user.display_name or '',
                )
            
            # Update display name if it has changed
            if firebase_user.display_name and not user.first_name:
                user.first_name = firebase_user.display_name
                user.save()
                
            return user
        except Exception as e:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None