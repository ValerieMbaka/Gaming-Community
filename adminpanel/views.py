from django.shortcuts import render


def admin_dashboard(request):
    return render(request, 'adminpanel/admin_dashboard.html', {'page_title': 'Admin Dashboard'})


# Core
def core(request):
    return render(request, 'adminpanel/pages/core.html', {'page_title': 'Core Management'})


# Users
def users_list(request):
    return render(request, 'adminpanel/pages/users_list.html', {'page_title': 'Users List'})


def users_points(request):
    return render(request, 'adminpanel/pages/users_points.html', {'page_title': 'Points & Rewards'})


def users_bans(request):
    return render(request, 'adminpanel/pages/users_bans.html', {'page_title': 'Bans & Suspensions'})


# Communities
def communities_manage(request):
    return render(request, 'adminpanel/pages/communities_manage.html', {'page_title': 'Manage Communities'})


def communities_approvals(request):
    return render(request, 'adminpanel/pages/communities_approvals.html', {'page_title': 'Membership Approvals'})


def communities_pricing(request):
    return render(request, 'adminpanel/pages/communities_pricing.html', {'page_title': 'Pricing Manager'})


def communities_games(request):
    return render(request, 'adminpanel/pages/communities_games.html', {'page_title': 'Games Manager'})


def communities_posts(request):
    return render(request, 'adminpanel/pages/communities_posts.html', {'page_title': 'Community Feeds & Posts'})


def communities_tournaments(request):
    return render(request, 'adminpanel/pages/communities_tournaments.html', {'page_title': 'Community Tournaments'})


# Competitions
def competitions_manage(request):
    return render(request, 'adminpanel/pages/competitions_manage.html', {'page_title': 'Manage Competitions'})


def competitions_results(request):
    return render(request, 'adminpanel/pages/competitions_results.html', {'page_title': 'Competition Results'})


# Leaderboards
def leaderboards_global(request):
    return render(request, 'adminpanel/pages/leaderboards_global.html', {'page_title': 'Global Leaderboard'})


def leaderboards_community(request):
    return render(request, 'adminpanel/pages/leaderboards_community.html', {'page_title': 'Community Leaderboards'})


def leaderboards_tournament(request):
    return render(request, 'adminpanel/pages/leaderboards_tournament.html', {'page_title': 'Tournament Leaderboards'})


# Posts
def posts_all(request):
    return render(request, 'adminpanel/pages/posts_all.html', {'page_title': 'All Posts'})


def posts_reports(request):
    return render(request, 'adminpanel/pages/posts_reports.html', {'page_title': 'Post Reports'})


# Notifications
def notifications_compose(request):
    return render(request, 'adminpanel/pages/notifications_compose.html', {'page_title': 'User Notifications'})


def notifications_history(request):
    return render(request, 'adminpanel/pages/notifications_history.html', {'page_title': 'Notification History'})


def notifications_admin_alerts(request):
    return render(request, 'adminpanel/pages/notifications_admin_alerts.html', {'page_title': 'Admin Alerts'})


# Settings
def site_settings(request):
    return render(request, 'adminpanel/pages/site_settings.html', {'page_title': 'Site Settings'})

