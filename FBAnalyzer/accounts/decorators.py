from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect

# Self-service trial tiers (the only ones whose User stays active past expiry,
# see deactivate_expired_licenses) get sent to their own dedicated "trial
# expired" landing page instead of a banner message, so it can remind them
# what they had and sell them straight into the right product.
TRIAL_EXPIRED_URL_NAMES = {
    'trial': 'trial-expired',
    'fliiga_trial': 'fliiga-trial-expired',
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
                # Expired/inactive license. Trial tiers get their own dedicated
                # "trial expired" landing page (reminds them what they had, sells
                # them straight into the matching product). Paid tiers (rarely seen
                # here in practice — deactivate_expired_licenses locks their User
                # out entirely, so this mostly only fires in the window before that
                # job next runs) go to get-started, which has a one-click Stripe
                # buy button for every tier — 'home' (index) requires an active
                # license too, so redirecting there would just bounce straight back
                # out here.
                if license.tier in TRIAL_EXPIRED_URL_NAMES:
                    return redirect(TRIAL_EXPIRED_URL_NAMES[license.tier])

                messages.error(
                    request,
                    f"Your {license.get_tier_display().lower()} license has expired. "
                    f"Please buy a new license to keep using Floorball Scanner.",
                )
                return redirect('get-started')

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
