from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from .models import Gamer


class FirebaseBackend(BaseBackend):
    """
    Custom authentication backend for Firebase users.
    This backend handles Firebase authentication without creating Django User objects.
    """
    
    def authenticate(self, request, firebase_uid=None, firebase_email=None):
        """
        Authenticate Firebase users using session data.
        """
        if not request or not request.session.get('firebase_authenticated'):
            return None
        
        firebase_user_data = request.session.get('firebase_user')
        if not firebase_user_data:
            return None
        
        # Get the Gamer object for this Firebase user
        try:
            gamer = Gamer.objects.get(uid=firebase_user_data['uid'])
            return gamer
        except Gamer.DoesNotExist:
            return None
    
    def get_user(self, user_id):
        """
        Get user by ID. For Firebase users, this will be the Gamer object.
        """
        try:
            return Gamer.objects.get(pk=user_id)
        except Gamer.DoesNotExist:
            return None


class FirebaseSessionBackend(BaseBackend):
    """
    Session-based authentication backend for Firebase users.
    This allows Firebase users to be authenticated without Django User objects.
    """
    
    def authenticate(self, request, firebase_uid=None, firebase_email=None):
        """
        Authenticate using session data for Firebase users.
        """
        if not request or not request.session.get('firebase_authenticated'):
            return None
        
        firebase_user_data = request.session.get('firebase_user')
        if not firebase_user_data:
            return None
        
        # Create a simple user object for authentication
        # This is a temporary object that represents the Firebase user
        class FirebaseUser:
            def __init__(self, firebase_data, gamer):
                self.id = gamer.id
                self.email = firebase_data['email']
                self.first_name = firebase_data.get('first_name', '')
                self.last_name = firebase_data.get('last_name', '')
                self.is_authenticated = True
                self.is_anonymous = False
                self.is_superuser = False
                self.is_staff = False
                self.gamer = gamer
                self._firebase_data = firebase_data
            
            def get_username(self):
                return self.email
            
            def get_full_name(self):
                return f"{self.first_name} {self.last_name}".strip()
        
        try:
            gamer = Gamer.objects.get(uid=firebase_user_data['uid'])
            return FirebaseUser(firebase_user_data, gamer)
        except Gamer.DoesNotExist:
            return None

    def get_user(self, user_id):
        """
        Get user by ID. This is not used for Firebase users.
        """
        return None