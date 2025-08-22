from django import forms
from .models import Gamer
import json
import re
from django.core.exceptions import ValidationError


class ProfileCompletionForm(forms.ModelForm):
    platforms = forms.CharField(
        widget=forms.HiddenInput(),
        required=True,
        error_messages={'required': 'At least one platform is required'}
    )
    games = forms.CharField(
        widget=forms.HiddenInput(),
        required=True,
        error_messages={'required': 'At least one game is required'}
    )
    
    class Meta:
        model = Gamer
        fields = [
            'profile_picture',
            'custom_username',
            'bio',
            'about',
            'date_of_birth',
            'location',
            'platforms',
            'games'
        ]
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date', 'required': 'required'}),
            'bio': forms.TextInput(attrs={
                'required': 'required',
                'maxlength': '160',
                'minlength': '10',
                'placeholder': 'Short one-line bio (10–160 chars)'
            }),
            'custom_username': forms.TextInput(attrs={
                'required': 'required',
                'maxlength': '20',
                'minlength': '3',
                'pattern': '^[A-Za-z0-9_]{3,20}$',
                'title': '3–20 characters. Letters, numbers, underscores only'
            }),
            'location': forms.TextInput(attrs={'required': 'required'}),
            'about': forms.Textarea(attrs={
                'rows': 4,
                'maxlength': '500',
                'minlength': '30',
                'placeholder': 'About you (optional, 30–500 chars). Supports emojis and line breaks.'
            }),
        }
        error_messages = {
            'custom_username': {'required': "Username is required"},
            'bio': {'required': "Bio is required"},
            'date_of_birth': {'required': "Date of birth is required"},
            'location': {'required': "Location is required"},
        }
    
    def clean_platforms(self):
        platforms = self.cleaned_data.get('platforms', '[]')
        try:
            platforms_list = json.loads(platforms)
            if not platforms_list:
                raise ValidationError("At least one platform is required")
            return platforms_list
        except json.JSONDecodeError:
            raise ValidationError("Invalid platforms data")
    
    def clean_games(self):
        games = self.cleaned_data.get('games', '[]')
        try:
            games_list = json.loads(games)
            if not games_list:
                raise ValidationError("At least one game is required")
            return games_list
        except json.JSONDecodeError:
            raise ValidationError("Invalid games data")

    def clean_custom_username(self):
        custom_username = self.cleaned_data.get('custom_username', '').strip()
        if not re.fullmatch(r'^[A-Za-z0-9_]{3,20}$', custom_username or ''):
            raise ValidationError('Username must be 3–20 characters and contain only letters, numbers, and underscores')
        # Case-insensitive uniqueness check preserving original casing
        existing = Gamer.objects.filter(custom_username__iexact=custom_username)
        if self.instance and self.instance.pk:
            existing = existing.exclude(pk=self.instance.pk)
        if existing.exists():
            raise ValidationError('This username is already taken. Please choose another.')
        return custom_username

    def clean_bio(self):
        bio = (self.cleaned_data.get('bio') or '').strip()
        if len(bio) < 10 or len(bio) > 160:
            raise ValidationError('Bio must be between 10 and 160 characters')
        if '\n' in bio or '\r' in bio:
            raise ValidationError('Bio must be a single line')
        return bio

    def clean_about(self):
        about = (self.cleaned_data.get('about') or '').strip()
        if about:
            if len(about) < 30 or len(about) > 500:
                raise ValidationError('About must be between 30 and 500 characters')
        return about