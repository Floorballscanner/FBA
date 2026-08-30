from django.utils import timezone

from accounts.decorators import get_active_license


def license_status(request):
    """Exposes the logged-in user's remaining license days to every template
    rendered through app_layout.html, so it can show e.g. "5 days left"."""
    user = getattr(request, 'user', None)
    if user is None or not user.is_authenticated or user.is_staff or user.is_superuser:
        return {}

    license = get_active_license(user)
    if license is None or license.expires_at is None:
        return {}

    days_left = (license.expires_at - timezone.now()).days
    return {
        'license_days_left': max(days_left, 0),
        'license_tier_display': license.get_tier_display(),
    }
