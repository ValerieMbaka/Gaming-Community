import datetime


from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.core.exceptions import ValidationError
from django.utils import timezone
import json


class Gamer(models.Model):
    # Profile information
    uid = models.CharField(max_length=30, unique=True, verbose_name="Firebase UID") # Firebase UID field
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    custom_username = models.CharField(max_length=30, blank=True, null=True, verbose_name="Custom Username")
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(blank=False, default="Bio")
    about = models.TextField(blank=True, default="About")
    date_of_birth = models.DateField(null=False, default=datetime.date(2025, 1, 1))
    location = models.CharField(max_length=255, blank=False, default="")
    platforms = models.JSONField(default=list)
    games = models.JSONField(default=list)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    profile_completed = models.BooleanField(default=False)

    
    def clean(self):
        super().clean()
        if not self.bio:
            raise ValidationError({'bio': 'Bio is required'})
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
        location_ok = self.location and self.location != '' and len(self.location.strip()) > 0
        games_ok = self.games and len(self.games) > 0
        platforms_ok = self.platforms and len(self.platforms) > 0
        # Make custom username optional - not required for profile completion
        username_ok = True  # Always true since custom username is optional
        
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
        verbose_name = 'Gamer'
        verbose_name_plural = 'Gamers'
        constraints = [
            UniqueConstraint(Lower('uid'), name='unique_lower_uid'),
            UniqueConstraint('email', name='unique_email')
        ]