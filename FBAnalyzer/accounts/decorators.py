from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect

BUY_LICENSE_URL = 'https://holvi.com/shop/fbscanner/'
FLIIGA_PRODUCT_URL = 'https://holvi.com/shop/fbscanner/product/ad2423a19501be31d93808d0ce7e93a3/'

# Tiers that should point straight at their own product page instead of the
# general shop front when their license expires.
TIER_BUY_URLS = {
    'fliiga': FLIIGA_PRODUCT_URL,
    'fliiga_trial': FLIIGA_PRODUCT_URL,
}


def get_license(user):
    """Returns the user's seat's License regardless of whether it's still active, or
    None if the user has no seat at all."""
    seat = getattr(user, 'licenseseat', None)
    return seat.license if seat is not None else None


def get_active_license(user):
    """Returns the user's seat's License if it exists and is currently active, else None."""
    license = get_license(user)
    if license is not None and license.is_active:
        return license
    return None


def license_required(*tiers):
    """Restricts a view to users whose active License has one of the given tiers.

    Staff/superusers always pass. Assumes @login_required already ran (or runs
    first in the decorator chain) so request.user is authenticated.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            if request.user.is_staff or request.user.is_superuser:
                return view_func(request, *args, **kwargs)

            license = get_license(request.user)

            if license is not None and license.is_active and license.tier in tiers:
                return view_func(request, *args, **kwargs)

            if license is not None and not license.is_active:
                # Expired/inactive license: 'home' (index) requires an active license
                # too, so redirecting there would just bounce straight back out here —
                # send them to the public frontpage instead.
                buy_url = TIER_BUY_URLS.get(license.tier, BUY_LICENSE_URL)
                messages.error(
                    request,
                    f"Your {license.get_tier_display().lower()} license has expired. "
                    f"Please purchase a license at {buy_url} to keep using Floorball Scanner.",
                )
                return redirect('frontpage')

            if license is not None and license.is_active:
                # Active license, just the wrong tier for this specific page (e.g. a
                # trial or F-Liiga-only user hitting a full-app page). They still have
                # a working dashboard, so keep them inside the app instead of kicking
                # them out to the public site.
                messages.error(request, "Your subscription doesn't include access to this page.")
                return redirect('home')

            messages.error(request, "Your subscription doesn't include access to this page.")
            return redirect('frontpage')
        return wrapped
    return decorator
