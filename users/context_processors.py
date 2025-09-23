def firebase_user(request):
    """Context processor to make Firebase user data available in all templates"""
    firebase_user_data = request.session.get('firebase_user', {})
    firebase_authenticated = request.session.get('firebase_authenticated', False)
    
    if firebase_authenticated and firebase_user_data:
        # Get profile picture URL from session data
        profile_picture_url = firebase_user_data.get('profile_picture_url')
        
        # Return Firebase user data as a user-like object
        return {
            'firebase_user': {
                'is_authenticated': True,
                'uid': firebase_user_data.get('uid'),
                'email': firebase_user_data.get('email'),
                'first_name': firebase_user_data.get('first_name', ''),
                'last_name': firebase_user_data.get('last_name', ''),
                'custom_username': firebase_user_data.get('custom_username'),
                'bio': firebase_user_data.get('bio', ''),
                'location': firebase_user_data.get('location', ''),
                'profile_completed': firebase_user_data.get('profile_completed', False),
                'profile_picture': profile_picture_url
            }
        }
    
    return {'firebase_user': None}