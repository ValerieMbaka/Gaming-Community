import os
import firebase_admin
from firebase_admin import credentials


def initialize_firebase():
    try:
        # Get the absolute path to the firebase credentials file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        cred_path = os.path.join(current_dir, 'django-4c5e9-firebase-adminsdk-fbsvc-c18ae0b3af.json')
        
        print(f"Looking for credentials at: {cred_path}")  # Debugging
        
        if not os.path.exists(cred_path):
            raise FileNotFoundError(f"Credentials file not found at {cred_path}")
        
        return firebase_admin.initialize_app(
            credentials.Certificate(cred_path))
    except Exception as e:
        print(f"Firebase initialization failed: {str(e)}")
        return None


# Initialize immediately
default_app = initialize_firebase()
if not default_app:
    print("Critical: Firebase initialization failed!")