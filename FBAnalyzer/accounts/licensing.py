from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse


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
