from django.db import models

class Slider(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.TextField()
    background_image = models.ImageField(upload_to='sliders/')
    cta_text = models.CharField(max_length=100, blank=True)
    cta_link = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return self.title

class About(models.Model):
    badge_text = models.CharField(max_length=100)
    heading = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='about/', blank=True)
    is_active = models.BooleanField(default=True)
    
    # Statistics fields
    active_players = models.CharField(max_length=50, default="Active Players")
    tournaments = models.CharField(max_length=50, default="Tournaments")
    platforms = models.CharField(max_length=50, default="Platforms")
    active_players_count = models.CharField(max_length=50, default="10K+")
    tournaments_count = models.CharField(max_length=50, default="100+")
    platforms_count = models.CharField(max_length=50, default="4")
    
    def __str__(self):
        return self.heading
