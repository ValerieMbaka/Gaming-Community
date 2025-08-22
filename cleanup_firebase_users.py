#!/usr/bin/env python
"""
Script to clean up Django User objects that were created for Firebase users.
This ensures Firebase users don't appear in the Django Users table.
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'guild_space.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Gamer

def cleanup_firebase_users():
    """Remove Django User objects that were created for Firebase users"""
    print("Cleaning up Django User objects for Firebase users...")
    
    # Get all Gamer objects (Firebase users)
    gamers = Gamer.objects.all()
    firebase_uids = list(gamers.values_list('uid', flat=True))
    
    print(f"Found {len(firebase_uids)} Firebase users: {firebase_uids}")
    
    # Remove Django User objects for Firebase users
    deleted_count = 0
    for uid in firebase_uids:
        try:
            django_user = User.objects.get(username=uid)
            print(f"Removing Django User object for Firebase UID: {uid}")
            django_user.delete()
            deleted_count += 1
        except User.DoesNotExist:
            print(f"No Django User object found for Firebase UID: {uid}")
    
    print(f"Successfully removed {deleted_count} Django User objects")
    
    # Show remaining Django User objects (should only be admin users)
    remaining_users = User.objects.count()
    print(f"Remaining Django User objects: {remaining_users}")
    
    if remaining_users > 0:
        print("Remaining Django Users (should be admin users only):")
        for user in User.objects.all():
            print(f"  - {user.username} ({user.email}) - Superuser: {user.is_superuser}, Staff: {user.is_staff}")

if __name__ == '__main__':
    cleanup_firebase_users()
