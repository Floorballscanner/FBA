from django.contrib import admin

from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'published_at', 'updated_at')
    list_filter = ('category', 'status')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'excerpt', 'body')
