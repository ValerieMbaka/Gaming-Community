import os

def firebase_config(request):
    """Add Firebase configuration to template context"""
    return {
        'firebase_config': {
            'api_key': os.environ.get('FIREBASE_API_KEY', ''),
            'auth_domain': os.environ.get('FIREBASE_AUTH_DOMAIN', ''),
            'project_id': os.environ.get('FIREBASE_PROJECT_ID', ''),
            'storage_bucket': os.environ.get('FIREBASE_STORAGE_BUCKET', ''),
            'messaging_sender_id': os.environ.get('FIREBASE_MESSAGING_SENDER_ID', ''),
            'app_id': os.environ.get('FIREBASE_APP_ID', ''),
            'measurement_id': os.environ.get('FIREBASE_MEASUREMENT_ID', ''),
        }
    }
