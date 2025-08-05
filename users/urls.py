from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('user_dashboard/', views.user_dashboard, name='user_dashboard'),
    path('user_profile/', views.user_profile, name='user_profile'),
]