from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
from django.utils import timezone

from accounts.models import License, LicenseSeat


def send_activation_email(seat, base_url):
    """Emails the seat's activation link. base_url is the site root, e.g. 'https://fbscanner.io/'."""
    activation_url = base_url.rstrip('/') + reverse('license-activate', args=[seat.activation_token])
    send_mail(
        subject="Activate your Floorball Scanner license",
        message=(
            f"Your Floorball Scanner license is ready to activate.\n\n"
            f"Set up your username and password here:\n{activation_url}"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[seat.email],
    )


def create_or_renew_license(email, tier):
    """Creates a new License+LicenseSeat for `email`, or renews/upgrades the existing one
    if a LicenseSeat with that email already exists. Shared by check_holvi_orders and the
    Stripe checkout webhook so both purchase paths behave identically. Returns the
    LicenseSeat.

    New: creates a License(tier=tier) + LicenseSeat(email=email) and emails an activation
    link — no user exists yet, so there's nothing to reactivate.
    Existing: extends expires_at by one LICENSE_DURATION from max(now, current expiry),
    updates tier/max_seats (e.g. an F-Liiga seat upgrading to Team), and reactivates the
    license plus any already-activated seat users.
    """
    existing_seat = LicenseSeat.objects.filter(email__iexact=email).first()

    if existing_seat:
        license = existing_seat.license
        now = timezone.now()
        base = license.expires_at if license.expires_at and license.expires_at > now else now
        license.tier = tier
        license.max_seats = None if tier == 'club' else 1
        license.expires_at = base + License.LICENSE_DURATION
        license.is_active = True
        license.save()
        for seat in license.seats.all():
            if seat.user is not None:
                seat.user.is_active = True
                seat.user.save(update_fields=['is_active'])
        return existing_seat

    license = License.objects.create(tier=tier, max_seats=None if tier == 'club' else 1)
    seat = LicenseSeat.objects.create(license=license, email=email)
    send_activation_email(seat, settings.SITE_URL)
    return seat
