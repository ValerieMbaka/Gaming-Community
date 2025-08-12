from django import forms
from .models import CustomUser
import json
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
        model = CustomUser
        fields = [
            'profile_picture',
            'username',
            'bio',
            'about',
            'date_of_birth',
            'location',
            'platforms',
            'games'
        ]
        widgets = {
            'date_of_birth': forms.DateInput(attrs={'type': 'date', 'required': 'required'}),
            'bio': forms.Textarea(attrs={'rows': 3, 'required': 'required'}),
            'username': forms.TextInput(attrs={'required': 'required'}),
            'location': forms.TextInput(attrs={'required': 'required'}),
        }
        error_messages = {
            'username': {'required': "Username is required"},
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