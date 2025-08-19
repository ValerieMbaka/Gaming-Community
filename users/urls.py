from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    path('complete-profile/', views.profile_completion, name='complete_profile'),
    path('settings/', views.user_settings, name='user_settings'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('check-username/', views.check_username, name='check_username'),
]