from django.urls import path
from . import views

app_name = 'feeds'

urlpatterns = [
    path('', views.feeds_view, name='feeds'),
    # API endpoints
    path('api/posts/', views.api_list_posts, name='api_list_posts'),
    path('api/posts/create/', views.api_create_post, name='api_create_post'),
    path('api/posts/<int:post_id>/like/', views.api_toggle_like, name='api_toggle_like'),
    path('api/posts/<int:post_id>/share/', views.api_share_post, name='api_share_post'),
    path('api/posts/<int:post_id>/comments/', views.api_list_comments, name='api_list_comments'),
    path('api/posts/<int:post_id>/comments/create/', views.api_create_comment, name='api_create_comment'),
    path('api/members/', views.api_list_members, name='api_list_members'),
]
