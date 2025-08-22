from django.urls import path
from . import views

app_name = 'communities'

urlpatterns = [
    path('', views.communities_list, name='communities_list'),
]