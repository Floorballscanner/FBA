from django.http import HttpResponsePermanentRedirect

# The bare apex domain (fbscanner.io) has occasionally left visitors with a stale,
# locally-cached negative DNS result even though its DNS record is healthy (see the
# fbscanner.io DNS investigation, 2026-09-10) - a request that never resolves never
# reaches this code, so this can't fix that. What it does do is keep a single
# canonical host for any request that *does* land on the bare domain, instead of
# both www.fbscanner.io and fbscanner.io serving traffic independently.
#
# Deliberately narrower than Django's built-in CommonMiddleware(PREPEND_WWW=True):
# that redirects any non-"www."-prefixed host unconditionally, which would also
# catch *.herokuapp.com (production's Heroku-provided fallback domain, staging)
# where prepending "www." would point at a domain that doesn't exist.
BARE_DOMAIN = 'fbscanner.io'
WWW_DOMAIN = 'www.fbscanner.io'


class RedirectBareDomainToWWW:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.get_host() == BARE_DOMAIN:
            return HttpResponsePermanentRedirect(
                'https://' + WWW_DOMAIN + request.get_full_path()
            )
        return self.get_response(request)
