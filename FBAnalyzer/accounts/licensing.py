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


def send_renewal_email(seat, base_url):
    """Emails a returning customer (existing LicenseSeat, so no activation link needed) to
    confirm the renewal and remind them to log in with their existing account — their User
    may have just been reactivated after sitting expired/deactivated for a while."""
    license = seat.license
    login_url = base_url.rstrip('/') + '/accounts/login/'
    reset_url = base_url.rstrip('/') + '/accounts/password_reset/'
    expires_str = license.expires_at.strftime('%d.%m.%Y') if license.expires_at else 'unknown'
    send_mail(
        subject="Your Floorball Scanner license has been renewed",
        message=(
            f"Your {license.get_tier_display()} license is now active until {expires_str}.\n\n"
            f"Log in with your existing account here:\n{login_url}\n\n"
            f"Forgot your password? Reset it here:\n{reset_url}"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[seat.email],
    )


def create_or_renew_license(email, tier):
    """Creates a new License+LicenseSeat for `email`, or renews/upgrades the existing one
    if a LicenseSeat with that email already exists. Shared by check_holvi_orders and the
    Stripe checkout webhook so both purchase paths behave identically. Returns
    (LicenseSeat, is_new).

    New: creates a License(tier=tier) + LicenseSeat(email=email) and emails an activation
    link — no user exists yet, so there's nothing to reactivate.
    Existing: extends expires_at by one LICENSE_DURATION from max(now, current expiry),
    updates tier/max_seats (e.g. an F-Liiga seat upgrading to Team), and reactivates the
    license plus any already-activated seat users. Does not email here — callers that want
    to notify the customer about a renewal (e.g. the Stripe webhook) should call
    send_renewal_email themselves, since check_holvi_orders' customers already get a Holvi
    order receipt and don't need a second email.
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
        return existing_seat, False

    license = License.objects.create(tier=tier, max_seats=None if tier == 'club' else 1)
    seat = LicenseSeat.objects.create(license=license, email=email)
    send_activation_email(seat, settings.SITE_URL)
    return seat, True
