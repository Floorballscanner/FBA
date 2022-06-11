from django.contrib import admin
from .models import Player, Live, Team, Game, Line
# Register your models here.

admin.site.register(Player)
admin.site.register(Live)
admin.site.register(Team)
admin.site.register(Game)
admin.site.register(Line)
