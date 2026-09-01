# Stripe Hosted Checkout — kevyt versio. Asiakas ohjataan Stripen omalle maksusivulle ja
# palaa onnistuneen maksun jälkeen takaisin. Ajaa rinnakkain Holvi-kaupan kanssa: molemmat
# päätyvät samaan License/LicenseSeat-malliin accounts.licensing.create_or_renew_license
# kautta, jota myös check_holvi_orders-komento käyttää.

import stripe

from django.conf import settings
from django.contrib import messages
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from accounts.licensing import create_or_renew_license

stripe.api_key = settings.STRIPE_SECRET_KEY


@require_POST
def start_checkout(request, tier):
    price_id = settings.STRIPE_PRICE_IDS.get(tier)
    if not price_id:
        messages.error(request, "This license isn't available for purchase yet.")
        return redirect('get-started')

    session = stripe.checkout.Session.create(
        mode='payment',
        line_items=[{'price': price_id, 'quantity': 1}],
        allow_promotion_codes=True,
        metadata={'tier': tier},
        success_url=request.build_absolute_uri('/buy/success/'),
        cancel_url=request.build_absolute_uri('/get-started/'),
    )
    return redirect(session.url)


def checkout_success(request):
    return render(request, 'accounts/stripe_checkout_success.html')


@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError):
        return HttpResponseBadRequest()

    # construct_event returns Stripe SDK objects (Event/Session), not plain dicts — they
    # support attribute and [] access but NOT .get(), so convert to a plain dict up front
    # rather than fighting the SDK's object wrappers field by field.
    event = event.to_dict()

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        tier = (session.get('metadata') or {}).get('tier')
        customer_details = session.get('customer_details') or {}
        email = customer_details.get('email')
        if tier and email:
            create_or_renew_license(email, tier)

    return HttpResponse(status=200)
