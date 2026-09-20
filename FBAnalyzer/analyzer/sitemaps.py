"""XML sitemap (django.contrib.sitemaps) served at /sitemap.xml - replaces the old
hand-maintained, stale templates/sitemap.txt (still served at /sitemap, untouched, but no
longer the canonical sitemap). Auto-updates as blog posts are published, unlike the old file.
"""

from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from blog.models import Post

STATIC_VIEW_NAMES = ['frontpage', 'fliiga-product', 'references', 'get-started', 'blog-index']


class StaticViewSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.6

    def items(self):
        return STATIC_VIEW_NAMES

    def location(self, item):
        return reverse(item)


class BlogPostSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.8

    def items(self):
        return Post.objects.filter(status='published').order_by('-published_at')

    def lastmod(self, post):
        return post.updated_at

    def location(self, post):
        return reverse('blog-detail', args=[post.slug])
