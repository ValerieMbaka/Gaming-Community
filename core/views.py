# views.py
from django.shortcuts import render
from .models import Slider, About, Platform

def index(request):
    sliders = Slider.objects.all()
    about = About.objects.first()
    platforms = Platform.objects.all()
    return render(request, 'core/index.html', {
        'sliders': sliders,  # Fixed variable name
        'about': about,
        'platforms': platforms
    })