from django.contrib import admin
from .models import Slider, About

@admin.register(Slider)
class SliderAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']

@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ['badge_text', 'heading', 'content', 'is_active']
    list_editable = ['is_active']
    fieldsets = (
        ('Main Content', {
            'fields': ('badge_text','heading', 'content', 'image', 'is_active')
        }),
        ('Statistics', {
            'fields': ('active_players', 'active_players_count', 'tournaments', 'tournaments_count', 'platforms', 'platforms_count')
        }),
    )

