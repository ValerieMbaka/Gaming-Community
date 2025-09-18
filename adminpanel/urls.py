from django.urls import path
from . import views

app_name = 'adminpanel'

urlpatterns = [
    path('', views.admin_dashboard, name='admin_dashboard'),
    # Core
    path('core/', views.core, name='core'),
    # Users
    path('users/', views.users_list, name='users_list'),
    path('users/points/', views.users_points, name='users_points'),
    path('users/bans/', views.users_bans, name='users_bans'),
    # Communities
    path('communities/manage/', views.communities_manage, name='communities_manage'),
    path('communities/approvals/', views.communities_approvals, name='communities_approvals'),
    path('communities/pricing/', views.communities_pricing, name='communities_pricing'),
    path('communities/games/', views.communities_games, name='communities_games'),
    path('communities/posts/', views.communities_posts, name='communities_posts'),
    path('communities/tournaments/', views.communities_tournaments, name='communities_tournaments'),
    # Competitions
    path('competitions/manage/', views.competitions_manage, name='competitions_manage'),
    path('competitions/results/', views.competitions_results, name='competitions_results'),
    # Leaderboards
    path('leaderboards/global/', views.leaderboards_global, name='leaderboards_global'),
    path('leaderboards/community/', views.leaderboards_community, name='leaderboards_community'),
    path('leaderboards/tournament/', views.leaderboards_tournament, name='leaderboards_tournament'),
    # Posts
    path('posts/all/', views.posts_all, name='posts_all'),
    path('posts/reports/', views.posts_reports, name='posts_reports'),
    # Notifications
    path('notifications/compose/', views.notifications_compose, name='notifications_compose'),
    path('notifications/history/', views.notifications_history, name='notifications_history'),
    path('notifications/admin-alerts/', views.notifications_admin_alerts, name='notifications_admin_alerts'),
    # Settings
    path('site_settings/', views.site_settings, name='site_settings'),
]


