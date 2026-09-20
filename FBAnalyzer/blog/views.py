from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, render

from .models import Post

POSTS_PER_PAGE = 12


def post_list(request):
    posts = Post.objects.filter(status='published').order_by('-published_at')
    category = request.GET.get('category')
    if category:
        posts = posts.filter(category=category)

    paginator = Paginator(posts, POSTS_PER_PAGE)
    page = paginator.get_page(request.GET.get('page'))

    return render(request, 'blog_index.html', {
        'page': page,
        'categories': Post.CATEGORY_CHOICES,
        'active_category': category,
    })


def post_detail(request, slug):
    post = get_object_or_404(Post, slug=slug, status='published')
    related = (
        Post.objects.filter(status='published', category=post.category)
        .exclude(pk=post.pk)
        .order_by('-published_at')[:3]
    )
    return render(request, 'blog_post.html', {'post': post, 'related_posts': related})
