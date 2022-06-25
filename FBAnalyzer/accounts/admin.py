from django.contrib import admin
from .models import Player, Team, Line, Game
# Register your models here.

admin.site.register(Player)
admin.site.register(Team)
admin.site.register(Game)
admin.site.register(Line)
