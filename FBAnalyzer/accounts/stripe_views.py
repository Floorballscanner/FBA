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

from accounts.decorators import get_active_license
from accounts.licensing import create_or_renew_license, send_renewal_email
from accounts.models import LicenseSeat

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

    session_kwargs = {}
    if tier == 'fliiga_full_upgrade':
        # The discounted price (161 = 200 - 39) is only for people who already hold a
        # paid F-Liiga Live license - gate at session-creation time rather than just
        # hiding the button, and prefill (not just suggest) the email so the discount
        # can't be claimed under a different address at Stripe's own checkout screen.
        # The webhook re-checks this independently before granting the tier, since
        # Checkout's customer_email is still just a prefill, not an enforced lock.
        if not request.user.is_authenticated:
            messages.error(request, "Please log in to upgrade your F-Liiga license.")
            return redirect('login')
        license = get_active_license(request.user)
        if license is None or license.tier != 'fliiga':
            messages.error(request, "This upgrade is only available to existing F-Liiga Live license holders.")
            return redirect('fliiga-main')
        session_kwargs['customer_email'] = request.user.email

    session = stripe.checkout.Session.create(
        mode='payment',
        line_items=[{'price': price_id, 'quantity': 1}],
        allow_promotion_codes=True,
        metadata={'tier': tier},
        branding_settings=BRANDING_SETTINGS,
        payment_method_types=settings.STRIPE_PAYMENT_METHOD_TYPES,
        success_url=request.build_absolute_uri('/buy/success/') + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url=request.build_absolute_uri('/get-started/'),
        **session_kwargs,
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
            license_tier, extend_expiry = tier, True
            if tier == 'fliiga_full_upgrade':
                license_tier, extend_expiry = 'fliiga_full', False
                # Re-verify eligibility independently of the session-creation check in
                # start_checkout: Checkout's customer_email is only a prefill, not an
                # enforced lock, so someone could still type a different address here.
                # Without this, that email would fall into create_or_renew_license's
                # "no existing seat" branch and get a brand-new full-price-equivalent
                # license for the discounted price.
                existing_seat = LicenseSeat.objects.filter(email__iexact=email).first()
                if not existing_seat or existing_seat.license.tier != 'fliiga':
                    send_mail(
                        subject="Stripe F-Liiga Full upgrade payment needs manual review",
                        message=(
                            f"A 161€ F-Liiga Full upgrade payment came in for {email}, but that "
                            f"address doesn't have an active F-Liiga Live license. No license was "
                            f"changed automatically - please review and resolve manually."
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[settings.DEFAULT_FROM_EMAIL],
                    )
                    return HttpResponse(status=200)

            # Checkout collects the buyer's email but never wires it into the charge's
            # receipt_email, so Stripe's "Successful payments" email-receipt setting has
            # nothing to send to unless we set it explicitly here.
            payment_intent_id = session.get('payment_intent')
            if payment_intent_id:
                try:
                    stripe.PaymentIntent.modify(payment_intent_id, receipt_email=email)
                except stripe.StripeError:
                    pass

            seat, is_new = create_or_renew_license(email, license_tier, extend_expiry=extend_expiry)
            if not is_new:
                send_renewal_email(seat, settings.SITE_URL)

            amount_total = session.get('amount_total')
            currency = (session.get('currency') or '').upper()
            amount_str = f"{amount_total / 100:.2f} {currency}" if amount_total is not None else "unknown amount"
            send_mail(
                subject="New Stripe payment received",
                message=(
                    f"A new Stripe payment was completed.\n\n"
                    f"Tier: {license_tier}{' (via ' + tier + ' price)' if tier != license_tier else ''}\n"
                    f"Email: {email}\n"
                    f"Amount: {amount_str}\n"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],
            )

    return HttpResponse(status=200)
