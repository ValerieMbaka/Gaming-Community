from django.shortcuts import render

# Create your views here.

def communities_list(request):
    """
    View to display all gaming communities
    """
    # Dummy data for communities (will be replaced with database data later)
    communities_data = {
        'total_communities': 6,
        'total_members': 20598,  # Sum of all community members
    }
    
    return render(request, 'communities/communities.html', communities_data)

def community_pricing(request):
    """
    View to display the community pricing page
    """
    # Pricing plans data with actual features and pricing
    pricing_data = {
        'plans': [
            {
                'name': '1 Month',
                'duration': '1 month',
                'price': 1500,
                'currency': 'Kshs.',
                'features': [
                    'Access to all gaming communities',
                    'Maximum 2 tournaments per month'
                ],
                'popular': False
            },
            {
                'name': '3 Months',
                'duration': '3 months',
                'price': 2000,
                'currency': 'Kshs.',
                'features': [
                    'Access to all gaming communities',
                    'Leaderboard access',
                    'Maximum 8 tournaments per month',
                ],
                'popular': True
            },
            {
                'name': '6 Months',
                'duration': '6 months',
                'price': 3000,
                'currency': 'Kshs.',
                'features': [
                    'Access to all gaming communities',
                    'Leaderboard access',
                    'Maximum 15 tournaments per month',
                ],
                'popular': False
            },
            {
                'name': '1 Year',
                'duration': '1 year',
                'price': 5500,
                'currency': 'Kshs.',
                'features': [
                    'Access to all gaming communities',
                    'Leaderboard access',
                    'Unlimited tournaments',
                    '1 Physical premium event per year',
                    'VIP community status',
                ],
                'popular': False
            }
        ]
    }
    
    return render(request, 'communities/community_pricing.html', pricing_data)

def sports_community(request):
    """
    View to display the sports gaming community page
    """
    # Dummy data for sports community (will be replaced with database data later)
    sports_data = {
        'community_name': 'Sports',
        'total_members': 2847,
        'online_members': 156,
        'active_tournaments': 8,
    }
    
    return render(request, 'communities/sports_community.html', sports_data)

def racing_community(request):
    """
    View to display the racing gaming community page
    """
    # Dummy data for racing community (will be replaced with database data later)
    racing_data = {
        'community_name': 'Racing',
        'total_members': 1923,
        'online_members': 89,
        'active_tournaments': 6,
    }
    
    return render(request, 'communities/racing_community.html', racing_data)

def action_community(request):
    """
    View to display the action gaming community page
    """
    # Dummy data for action community (will be replaced with database data later)
    action_data = {
        'community_name': 'Action',
        'total_members': 3156,
        'online_members': 234,
        'active_tournaments': 12,
    }
    
    return render(request, 'communities/action_community.html', action_data)