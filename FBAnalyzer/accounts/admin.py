from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.forms import BaseInlineFormSet

from .licensing import send_activation_email
from .models import Player, Team, Game, Level, Shot, Line, Position, LiveData, Time, License, LicenseSeat
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


class LicenseSeatInlineFormSet(BaseInlineFormSet):
    """Model-level LicenseSeat.clean() can't see sibling forms submitted in the same
    request (they're all still unsaved when each one validates), so max_seats has to be
    enforced here across the whole formset instead."""

    def clean(self):
        super().clean()
        if any(self.errors):
            return
        max_seats = self.instance.max_seats
        if max_seats is None:
            return
        count = sum(
            1 for form in self.forms
            if form.cleaned_data and not form.cleaned_data.get('DELETE', False)
        )
        if count > max_seats:
            raise ValidationError(f"This license allows at most {max_seats} seat(s), but {count} are set.")


class LicenseSeatInline(admin.TabularInline):
    model = LicenseSeat
    formset = LicenseSeatInlineFormSet
    extra = 0
    fields = ('email', 'user', 'activation_token')
    readonly_fields = ('activation_token',)


@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ('tier', 'seat_count', 'max_seats', 'is_active', 'starts_at', 'expires_at')
    list_filter = ('tier', 'is_active')
    inlines = [LicenseSeatInline]

    @admin.display(description="Seats")
    def seat_count(self, obj):
        return obj.seats.count()


@admin.register(LicenseSeat)
class LicenseSeatAdmin(admin.ModelAdmin):
    list_display = ('email', 'license', 'user', 'is_claimed')
    list_filter = ('license__tier',)
    search_fields = ('email', 'user__username')
    actions = ['send_activation_email_action']

    @admin.display(description="Claimed", boolean=True)
    def is_claimed(self, obj):
        return obj.user is not None

    @admin.action(description="Send activation email to selected (unclaimed) seats")
    def send_activation_email_action(self, request, queryset):
        unclaimed = queryset.filter(user__isnull=True)
        base_url = request.build_absolute_uri('/')
        sent = 0
        for seat in unclaimed:
            send_activation_email(seat, base_url)
            sent += 1
        skipped = queryset.count() - sent
        if sent:
            self.message_user(request, f"Sent {sent} activation email(s).")
        if skipped:
            self.message_user(
                request,
                f"Skipped {skipped} seat(s) that already have a user.",
                level=messages.WARNING,
            )
