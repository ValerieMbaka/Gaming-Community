import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
import json


class CustomUser(AbstractUser):
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    username = models.CharField(max_length=30, unique=True)  # Make mandatory in DB
    bio = models.TextField(blank=False, default="Bio")  # Now mandatory
    about = models.TextField(blank=True, default="About")  # Optional
    date_of_birth = models.DateField(null=False, default=datetime.date(2025, 1, 1))  # Now mandatory
    location = models.CharField(max_length=255, blank=False, default="Nairobi")  # Now mandatory
    platforms = models.JSONField(default=list)  # Will be mandatory in form
    games = models.JSONField(default=list)  # Will require at least one
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    
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
    
    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'