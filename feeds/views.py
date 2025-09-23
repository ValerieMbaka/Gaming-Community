from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import F

from .models import Post, Comment, Like, Share
from users.models import Gamer

# Create your views here.

def feeds_view(request):
    return render(request, 'feeds/feeds.html')


# Helpers
def get_current_gamer(request):
    # Placeholder: adapt to your auth integration
    if request.user.is_authenticated and hasattr(request.user, 'gamer'):
        return request.user.gamer
    # Fallback: return the first gamer (demo)
    return Gamer.objects.first()


@require_http_methods(["GET"])
def api_list_posts(request):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    category = request.GET.get('category')

    qs = Post.objects.select_related('author')
    if category and category != 'all':
        qs = qs.filter(category=category)

    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page)

    def serialize_post(p: Post):
        return {
            'id': p.id,
            'author': {
                'id': p.author_id,
                'name': p.author.display_name,
                'avatar': p.author.profile_picture.url if p.author.profile_picture else None,
            },
            'content': p.content,
            'image': p.image.url if p.image else None,
            'video_url': p.video_url,
            'category': p.category,
            'created_at': p.created_at.isoformat(),
            'likes': p.likes_count,
            'comments': p.comments_count,
            'shares': p.shares_count,
        }

    return JsonResponse({
        'results': [serialize_post(p) for p in page_obj.object_list],
        'has_next': page_obj.has_next(),
        'page': page,
    })


@require_http_methods(["POST"])
def api_create_post(request):
    gamer = get_current_gamer(request)
    if not gamer:
        return HttpResponseBadRequest('Not authenticated')

    content = request.POST.get('content', '').strip()
    category = request.POST.get('category', 'all')
    image = request.FILES.get('image')
    video_url = request.POST.get('video_url')

    if not content and not image and not video_url:
        return HttpResponseBadRequest('Content or media required')

    post = Post.objects.create(
        author=gamer,
        content=content,
        category=category,
        image=image,
        video_url=video_url,
    )

    return JsonResponse({'ok': True, 'post_id': post.id})


@require_http_methods(["POST"])
@transaction.atomic
def api_toggle_like(request, post_id: int):
    gamer = get_current_gamer(request)
    if not gamer:
        return HttpResponseBadRequest('Not authenticated')

    post = get_object_or_404(Post, id=post_id)
    like, created = Like.objects.get_or_create(post=post, user=gamer)
    if not created:
        like.delete()
        Post.objects.filter(id=post.id).update(likes_count=F('likes_count') - 1)
        liked = False
    else:
        Post.objects.filter(id=post.id).update(likes_count=F('likes_count') + 1)
        liked = True

    post.refresh_from_db(fields=['likes_count'])
    return JsonResponse({'liked': liked, 'likes': post.likes_count})


@require_http_methods(["POST"])
@transaction.atomic
def api_share_post(request, post_id: int):
    gamer = get_current_gamer(request)
    if not gamer:
        return HttpResponseBadRequest('Not authenticated')

    post = get_object_or_404(Post, id=post_id)
    Share.objects.get_or_create(post=post, user=gamer)
    Post.objects.filter(id=post.id).update(shares_count=F('shares_count') + 1)
    post.refresh_from_db(fields=['shares_count'])
    return JsonResponse({'ok': True, 'shares': post.shares_count})


@require_http_methods(["GET"])
def api_list_comments(request, post_id: int):
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    post = get_object_or_404(Post, id=post_id)
    qs = post.comments.select_related('author')
    paginator = Paginator(qs, page_size)
    page_obj = paginator.get_page(page)

    def serialize_comment(c: Comment):
        return {
            'id': c.id,
            'author': {
                'id': c.author_id,
                'name': c.author.display_name,
                'avatar': c.author.profile_picture.url if c.author.profile_picture else None,
            },
            'content': c.content,
            'created_at': c.created_at.isoformat(),
        }

    return JsonResponse({
        'results': [serialize_comment(c) for c in page_obj.object_list],
        'has_next': page_obj.has_next(),
        'page': page,
    })


@require_http_methods(["POST"])
@transaction.atomic
def api_create_comment(request, post_id: int):
    gamer = get_current_gamer(request)
    if not gamer:
        return HttpResponseBadRequest('Not authenticated')
    post = get_object_or_404(Post, id=post_id)
    content = request.POST.get('content', '').strip()
    if not content:
        return HttpResponseBadRequest('Empty comment')
    comment = Comment.objects.create(post=post, author=gamer, content=content)
    Post.objects.filter(id=post.id).update(comments_count=F('comments_count') + 1)
    return JsonResponse({'ok': True, 'comment_id': comment.id})


@require_http_methods(["GET"])
def api_list_members(request):
    q = request.GET.get('q', '').strip().lower()
    community = request.GET.get('community')
    members = Gamer.objects.all()
    if q:
        members = members.filter(first_name__icontains=q) | members.filter(last_name__icontains=q) | members.filter(custom_username__icontains=q)
    # community filter is app-specific; skipping detailed join for now
    results = [{
        'id': m.id,
        'name': m.display_name,
        'avatar': m.profile_picture.url if m.profile_picture else None,
    } for m in members[:100]]
    return JsonResponse({'results': results})