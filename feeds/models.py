from django.db import models
from django.utils import timezone


class Post(models.Model):
    CATEGORY_CHOICES = (
        ("all", "All"),
        ("highlights", "Highlights"),
        ("tournaments", "Tournaments"),
        ("tips", "Tips"),
    )

    author = models.ForeignKey('users.Gamer', on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=24, choices=CATEGORY_CHOICES, default='all')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    # Cached counters for fast feeds
    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    shares_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"Post({self.id}) by {self.author_id}"


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey('users.Gamer', on_delete=models.SET_NULL, null=True, blank=True, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"Comment({self.id}) on {self.post_id}"


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey('users.Gamer', on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f"Like({self.user_id} -> {self.post_id})"


class Share(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey('users.Gamer', on_delete=models.CASCADE, related_name='shares')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f"Share({self.user_id} -> {self.post_id})"
