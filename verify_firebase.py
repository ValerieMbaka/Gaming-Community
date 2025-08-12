import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'guild_space.settings')

import django
django.setup()

from firebase_admin import auth

def test_firebase():
    try:
        print("Testing Firebase connection...")
        print(list(auth.list_users().iterate_all()))
        print("✅ Firebase connection successful!")
    except Exception as e:
        print(f"❌ Firebase test failed: {str(e)}")

if __name__ == "__main__":
    test_firebase()