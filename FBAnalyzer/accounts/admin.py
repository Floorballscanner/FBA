from django.conf import settings
from django.contrib import admin, messages
from django.core.mail import send_mail
from django.urls import reverse

from .models import Player, Team, Game, Level, Shot, Line, Position, LiveData, Time, License
# Register your models here.

admin.site.register(Player)
admin.site.register(Team)
admin.site.register(Game)
admin.site.register(Level)
admin.site.register(Shot)
admin.site.register(Position)
admin.site.register(Line)
admin.site.register(LiveData)
admin.site.register(Time)


@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ('email', 'tier', 'user', 'is_active', 'starts_at', 'expires_at')
    list_filter = ('tier', 'is_active')
    search_fields = ('email', 'user__username')
    actions = ['send_activation_email']

    @admin.action(description="Send activation email to selected (unclaimed) licenses")
    def send_activation_email(self, request, queryset):
        unclaimed = queryset.filter(user__isnull=True)
        sent = 0
        for license in unclaimed:
            activation_url = request.build_absolute_uri(
                reverse('license-activate', args=[license.activation_token])
            )
            send_mail(
                subject="Activate your Floorball Scanner license",
                message=(
                    f"Your Floorball Scanner license is ready to activate.\n\n"
                    f"Set up your username and password here:\n{activation_url}"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[license.email],
            )
            sent += 1
        skipped = queryset.count() - sent
        if sent:
            self.message_user(request, f"Sent {sent} activation email(s).")
        if skipped:
            self.message_user(
                request,
                f"Skipped {skipped} license(s) that already have a user.",
                level=messages.WARNING,
            )