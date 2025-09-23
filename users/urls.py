from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('gamer-dashboard/', views.gamer_dashboard, name='gamer_dashboard'),
    path('complete-profile/', views.profile_completion, name='complete_profile'),
    path('gamer-settings/', views.gamer_settings, name='gamer_settings'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('check-username/', views.check_username, name='check_username'),
    path('profile/<str:username>/', views.public_profile, name='public_profile'),
]