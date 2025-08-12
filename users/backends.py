from django.contrib.auth import get_user_model
from firebase_admin import auth
from django.contrib.auth.backends import BaseBackend

User = get_user_model()

class FirebaseBackend(BaseBackend):
    def authenticate(self, request, uid=None):
        try:
            firebase_user = auth.get_user(uid)
            user, created = User.objects.get_or_create(
                username=uid,
                defaults={
                    'email': firebase_user.email,
                    'first_name': firebase_user.display_name or '',
                }
            )
            if not created and firebase_user.display_name and not user.first_name:
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