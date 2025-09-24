from django.shortcuts import render
from .models import Slider, About

def index(request):
    sliders = Slider.objects.filter(is_active=True)
    about = About.objects.filter(is_active=True).first()
    
    return render(request, 'core/index.html', {
        'sliders': sliders,
        'about': about
    })