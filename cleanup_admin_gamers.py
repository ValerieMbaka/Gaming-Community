#!/usr/bin/env python
"""
Script to clean up admin users from the Gamer table.
Run this script to remove any admin/superuser entries from the Gamer model.
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'guild_space.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Gamer

def cleanup_admin_gamers():
    """Remove admin users from the Gamer table"""
    print("Cleaning up admin users from Gamer table...")
    
    # Get all admin users
    admin_users = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
    admin_emails = list(admin_users.values_list('email', flat=True))
    
    print(f"Found {len(admin_emails)} admin users: {admin_emails}")
    
    # Remove Gamer objects for admin users
    deleted_count = 0
    for email in admin_emails:
        try:
            gamer = Gamer.objects.get(email=email)
            print(f"Removing Gamer object for admin user: {email}")
            gamer.delete()
            deleted_count += 1
        except Gamer.DoesNotExist:
            print(f"No Gamer object found for admin user: {email}")
    
    print(f"Successfully removed {deleted_count} admin Gamer objects")
    
    # Show remaining Gamer objects
    remaining_gamers = Gamer.objects.count()
    print(f"Remaining Gamer objects: {remaining_gamers}")
    
    if remaining_gamers > 0:
        print("Remaining Gamer users:")
        for gamer in Gamer.objects.all():
            print(f"  - {gamer.email} (UID: {gamer.uid})")

if __name__ == '__main__':
    cleanup_admin_gamers()
