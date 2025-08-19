import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.core.exceptions import ValidationError
from django.utils import timezone
import json


class CustomUser(AbstractUser):
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    username = models.CharField(max_length=30, unique=True)  # This will store Firebase UID
    custom_username = models.CharField(max_length=30, blank=True, null=True)  # User's chosen username
    bio = models.TextField(blank=False, default="Bio")
    about = models.TextField(blank=True, default="About")
    date_of_birth = models.DateField(null=False, default=datetime.date(2025, 1, 1))
    location = models.CharField(max_length=255, blank=False, default="Nairobi")
    platforms = models.JSONField(default=list)
    games = models.JSONField(default=list)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    profile_completed = models.BooleanField(default=False)
    
    def clean(self):
        super().clean()
        if not self.bio:
            raise ValidationError({'bio': 'Bio is required'})
        if not self.date_of_birth:
            raise ValidationError({'date_of_birth': 'Date of birth is required'})
        if not self.location:
            raise ValidationError({'location': 'Location is required'})
        if not self.platforms:
            raise ValidationError({'platforms': 'At least one platform is required'})
        if not self.games:
            raise ValidationError({'games': 'At least one game is required'})
    
    def is_profile_complete(self):
        """Check if the user's profile is complete"""
        # Check individual conditions first
        bio_ok = self.bio and self.bio != 'Bio' and self.bio != '' and len(self.bio.strip()) > 0
        location_ok = self.location and self.location != 'Nairobi' and self.location != '' and len(self.location.strip()) > 0
        games_ok = self.games and len(self.games) > 0
        platforms_ok = self.platforms and len(self.platforms) > 0
        username_ok = self.custom_username and self.custom_username != '' and len(self.custom_username.strip()) > 0
        
        # All conditions must be met
        is_complete = bio_ok and location_ok and games_ok and platforms_ok and username_ok
        
        # Update the profile_completed flag if it doesn't match the actual state
        if is_complete != self.profile_completed:
            self.profile_completed = is_complete
            # Don't save here to avoid infinite recursion, let the caller save
        
        return is_complete
    
    def save(self, *args, **kwargs):
        """Override save to ensure profile completion is properly set"""
        # Update profile completion status before saving
        self.is_profile_complete()  # This will update self.profile_completed if needed
        super().save(*args, **kwargs)
    
    @property
    def display_name(self):
        """Get the best display name for the user"""
        if self.custom_username:
            return self.custom_username
        elif self.first_name:
            return self.first_name
        elif self.email:
            return self.email.split('@')[0].capitalize()
        else:
            return "User"
    
    def __str__(self):
        return self.display_name
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        constraints = [
            UniqueConstraint(Lower('username'), name='unique_lower_username'),
            UniqueConstraint('email', name='unique_email')
        ]