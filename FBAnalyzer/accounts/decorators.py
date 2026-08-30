from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect


def get_active_license(user):
    """Returns the user's seat's License if it exists and is currently active, else None."""
    seat = getattr(user, 'licenseseat', None)
    if seat is not None and seat.license.is_active:
        return seat.license
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

            license = get_active_license(request.user)
            if license is not None and license.tier in tiers:
                return view_func(request, *args, **kwargs)

            messages.error(request, "Your subscription doesn't include access to this page.")
            return redirect('frontpage')
        return wrapped
    return decorator
