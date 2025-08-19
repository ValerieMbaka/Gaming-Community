#!/usr/bin/env python
"""
Test script to verify profile completion logic
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'guild_space.settings')
django.setup()

from users.models import CustomUser
import json

def test_profile_completion():
    """Test the profile completion logic"""
    print("Testing profile completion logic...")
    
    # Create a test user
    test_user = CustomUser.objects.create(
        username='test_user_123',
        email='test@example.com',
        bio='Test bio',
        location='Test Location',
        platforms=['pc'],
        games=['Valorant']
    )
    
    print(f"Created test user: {test_user.username}")
    print(f"Profile completed flag: {test_user.profile_completed}")
    print(f"Is profile complete: {test_user.is_profile_complete()}")
    
    # Test with incomplete profile
    test_user.bio = 'Bio'  # Reset to default
    test_user.save()
    
    print(f"After resetting bio to default:")
    print(f"Profile completed flag: {test_user.profile_completed}")
    print(f"Is profile complete: {test_user.is_profile_complete()}")
    
    # Test with complete profile
    test_user.bio = 'Complete bio'
    test_user.save()
    
    print(f"After setting complete bio:")
    print(f"Profile completed flag: {test_user.profile_completed}")
    print(f"Is profile complete: {test_user.is_profile_complete()}")
    
    # Clean up
    test_user.delete()
    print("Test completed successfully!")

if __name__ == '__main__':
    test_profile_completion()

