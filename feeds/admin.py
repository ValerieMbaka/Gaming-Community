from django.contrib import admin
from .models import Post, Comment, Like, Share


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'category', 'created_at', 'likes_count', 'comments_count', 'shares_count')
    list_filter = ('category', 'created_at')
    search_fields = ('content', 'author__first_name', 'author__last_name', 'author__custom_username')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'author', 'created_at')
    search_fields = ('content',)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'created_at')


@admin.register(Share)
class ShareAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'created_at')