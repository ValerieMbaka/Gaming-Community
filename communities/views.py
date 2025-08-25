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