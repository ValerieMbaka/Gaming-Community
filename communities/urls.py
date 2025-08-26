from django.urls import path
from . import views

app_name = 'communities'

urlpatterns = [
    path('', views.communities_list, name='communities_list'),
    path('sports/', views.sports_community, name='sports_community'),
    path('racing/', views.racing_community, name='racing_community'),
    path('action/', views.action_community, name='action_community'),
    path('feeds/', views.feeds_view, name='feeds'),
]