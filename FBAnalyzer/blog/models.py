"""The marketing site's blog - admin-authored articles about floorball analytics and
data-driven coaching, aimed at SEO/GEO discoverability (see the blog app's URLs/templates
for the public-facing side). Deliberately simple/low-infra to match the rest of this
project: no CMS, no rich-text editor, no media/Pillow pipeline - body is Markdown source
rendered on read, and cover_image is a plain URL (a path under static/blog/, uploaded by
hand) rather than a Django ImageField.
"""

import markdown

from django.db import models


class Post(models.Model):
    CATEGORY_CHOICES = [
        ('analytics-101', 'Analytics 101'),
        ('coaching-guides', 'Coaching Guides'),
        ('product', 'Product & Data'),
    ]
    STATUS_CHOICES = [('draft', 'Draft'), ('published', 'Published')]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    excerpt = models.CharField(max_length=300)  # card blurb, and the meta-description fallback
    meta_description = models.CharField(max_length=160, blank=True)
    cover_image = models.URLField(blank=True)
    body = models.TextField()  # Markdown source
    faq = models.JSONField(default=list, blank=True)  # [{"question": "...", "answer": "..."}, ...]
    author = models.CharField(max_length=100, default='Floorball Scanner')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return f'{self.title} ({self.status})'

    def body_html(self):
        # 'extra' - tables/fenced code; 'toc' - auto id="..." anchors on every heading, giving
        # search/AI crawlers stable, addressable section anchors without any extra markup work.
        return markdown.markdown(self.body, extensions=['extra', 'toc', 'sane_lists'])

    def reading_minutes(self):
        return max(1, len(self.body.split()) // 200)

    def meta_description_text(self):
        return self.meta_description or self.excerpt

    def faq_items(self):
        return [(item['question'], item['answer']) for item in self.faq]
