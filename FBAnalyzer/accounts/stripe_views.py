# Stripe Hosted Checkout — kevyt versio. Asiakas ohjataan Stripen omalle maksusivulle ja
# palaa onnistuneen maksun jälkeen takaisin. Ajaa rinnakkain Holvi-kaupan kanssa: molemmat
# päätyvät samaan License/LicenseSeat-malliin accounts.licensing.create_or_renew_license
# kautta, jota myös check_holvi_orders-komento käyttää.

import stripe

from django.conf import settings
from django.contrib import messages
from django.core.mail import send_mail
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from accounts.licensing import create_or_renew_license, send_renewal_email

stripe.api_key = settings.STRIPE_SECRET_KEY

# Matches --landing-navy / --landing-bg in static/css/landing.css, so Checkout's button
# and background colors read as the same brand as the rest of the site.
BRANDING_SETTINGS = {
    'display_name': 'Floorball Scanner',
    'border_style': 'rounded',
    'background_color': '#f5f6fa',
    'button_color': '#002072',
}
if settings.STRIPE_BRANDING_ICON_FILE_ID:
    BRANDING_SETTINGS['icon'] = {'type': 'file', 'file': settings.STRIPE_BRANDING_ICON_FILE_ID}


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
        branding_settings=BRANDING_SETTINGS,
        payment_method_types=settings.STRIPE_PAYMENT_METHOD_TYPES,
        success_url=request.build_absolute_uri('/buy/success/') + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url=request.build_absolute_uri('/get-started/'),
    )
    return redirect(session.url)


def checkout_success(request):
    # session_id lets the success page report a real purchase event (value/currency/tier)
    # to GA instead of a generic pageview — best-effort only, the license itself is always
    # provisioned by the webhook regardless of whether this lookup succeeds.
    purchase = None
    session_id = request.GET.get('session_id')
    if session_id:
        try:
            session = stripe.checkout.Session.retrieve(session_id)
        except stripe.StripeError:
            session = None
        if session is not None:
            # session.metadata is itself a StripeObject, not a plain dict — it supports []
            # but not .get(), same gotcha as the webhook payload (see stripe_webhook above).
            tier = session.metadata['tier'] if session.metadata and 'tier' in session.metadata else None
            if tier and session.amount_total is not None:
                purchase = {
                    'transaction_id': session.id,
                    'value': session.amount_total / 100,
                    'currency': (session.currency or 'eur').upper(),
                    'tier': tier,
                }
    return render(request, 'accounts/stripe_checkout_success.html', {'purchase': purchase})


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
            seat, is_new = create_or_renew_license(email, tier)
            if not is_new:
                send_renewal_email(seat, settings.SITE_URL)

            amount_total = session.get('amount_total')
            currency = (session.get('currency') or '').upper()
            amount_str = f"{amount_total / 100:.2f} {currency}" if amount_total is not None else "unknown amount"
            send_mail(
                subject="New Stripe payment received",
                message=(
                    f"A new Stripe payment was completed.\n\n"
                    f"Tier: {tier}\n"
                    f"Email: {email}\n"
                    f"Amount: {amount_str}\n"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],
            )

    return HttpResponse(status=200)
