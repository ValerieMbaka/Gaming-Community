from django.db import models

class Slider(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.TextField()
    background_image = models.ImageField(upload_to='sliders/')
    cta_text = models.CharField(max_length=100, blank=True)
    cta_link = models.URLField(blank=True)

    def __str__(self):
        return self.title

class About(models.Model):
    heading = models.CharField(max_length=255)
    content = models.TextField()
    image = models.ImageField(upload_to='about/', blank=True)

    def __str__(self):
        return self.heading

class Platform(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='platforms/')
    link = models.URLField(blank=True)

    def __str__(self):
        return self.name

