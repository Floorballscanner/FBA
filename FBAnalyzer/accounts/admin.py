from django.contrib import admin
from .models import Player, Team, Line, Live
# Register your models here.

admin.site.register(Player)
admin.site.register(Team)
admin.site.register(Live)
admin.site.register(Line)
