from users.models import Gamer


def award_points_for_activity(user, activity_type, amount=None):
    """
    Award points to a user for different activities
    
    Args:
        user: Gamer instance
        activity_type: Type of activity (e.g., 'profile_completion', 'game_win', 'competition_participation')
        amount: Optional custom amount, otherwise uses default amounts
    """
    # Default point amounts for different activities
    default_points = {
        'profile_completion': 100,
        'game_win': 50,
        'game_loss': 10,
        'competition_participation': 25,
        'competition_win': 200,
        'competition_runner_up': 100,
        'daily_login': 5,
        'achievement_unlocked': 75,
        'community_join': 30,
        'first_game_added': 50,
    }
    
    # Use custom amount if provided, otherwise use default
    points_to_award = amount if amount is not None else default_points.get(activity_type, 10)
    
    if points_to_award > 0:
        success = user.add_points(points_to_award)
        if success:
            return {
                'success': True,
                'points_awarded': points_to_award,
                'new_total': user.points,
                'activity': activity_type
            }
    
    return {
        'success': False,
        'points_awarded': 0,
        'new_total': user.points,
        'activity': activity_type
    }


def get_user_points_rank(user):
    """
    Get user's rank based on points (placeholder for future implementation)
    """
    # This would be implemented with a more sophisticated ranking system
    if user.points >= 2000:
        return "Elite"
    elif user.points >= 1500:
        return "Master"
    elif user.points >= 1000:
        return "Advanced"
    elif user.points >= 500:
        return "Intermediate"
    else:
        return "Beginner"


def get_top_players(limit=10):
    """
    Get top players by points
    """
    return Gamer.objects.order_by('-points')[:limit]
