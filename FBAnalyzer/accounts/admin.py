from django.contrib import admin
from .models import Player, Team, Game, Level, Shot, Line, Position
# Register your models here.

admin.site.register(Player)
admin.site.register(Team)
admin.site.register(Game)
admin.site.register(Level)
admin.site.register(Shot)
admin.site.register(Position)
admin.site.register(Line)