import email
import imaplib
import re

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.licensing import send_activation_email
from accounts.models import License, LicenseSeat

HOLVI_SENDER = 'orders@holvi.com'

# Checked in this order so a multi-item order picks the highest tier.
TIER_KEYWORDS = [
    ('club', 'club licence'),
    ('team', 'team licence'),
    ('fliiga', 'f-liiga'),
]

EMAIL_RE = re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+')


def extract_buyer_email(body):
    """The order email also contains our own merchant address on a separate
    "Holvi-kauppias" line, so this only looks at the "Maksaja" (payer) line."""
    for line in body.splitlines():
        if line.strip().lower().startswith('maksaja'):
            match = EMAIL_RE.search(line)
            if match:
                return match.group(0)
    return None


def extract_tier(body):
    lower = body.lower()
    for tier, keyword in TIER_KEYWORDS:
        if keyword in lower:
            return tier
    return None


def get_plain_text_body(msg):
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == 'text/plain':
                charset = part.get_content_charset() or 'utf-8'
                return part.get_payload(decode=True).decode(charset, errors='replace')
        for part in msg.walk():
            if part.get_content_type() == 'text/html':
                charset = part.get_content_charset() or 'utf-8'
                html = part.get_payload(decode=True).decode(charset, errors='replace')
                return re.sub(r'<[^<]+?>', ' ', html)
        return ''
    charset = msg.get_content_charset() or 'utf-8'
    payload = msg.get_payload(decode=True)
    return payload.decode(charset, errors='replace') if payload else ''


class Command(BaseCommand):
    help = "Reads unread Holvi order emails and turns them into new or renewed licenses."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Don't create/modify anything, send email, or mark messages read.",
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            self.stderr.write("EMAIL_HOST_USER/EMAIL_HOST_PASSWORD not configured; nothing to do.")
            return

        imap = imaplib.IMAP4_SSL('imap.gmail.com')
        imap.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        imap.select('INBOX')

        status, data = imap.search(None, 'UNSEEN', 'FROM', f'"{HOLVI_SENDER}"')
        if status != 'OK':
            self.stderr.write(f"IMAP search failed: {status}")
            imap.logout()
            return

        message_ids = data[0].split()
        self.stdout.write(f"Found {len(message_ids)} unread Holvi order email(s).")

        for msg_id in message_ids:
            status, msg_data = imap.fetch(msg_id, '(RFC822)')
            if status != 'OK' or not msg_data or msg_data[0] is None:
                continue
            msg = email.message_from_bytes(msg_data[0][1])
            body = get_plain_text_body(msg)

            buyer_email = extract_buyer_email(body)
            tier = extract_tier(body)

            if not buyer_email or not tier:
                self.stdout.write(
                    f"Could not parse order (email={buyer_email}, tier={tier}) — flagging for manual review."
                )
                if not dry_run:
                    send_mail(
                        subject="Manual review needed: unrecognized Holvi order",
                        message=(
                            f"Could not automatically process a Holvi order.\n\n"
                            f"Extracted email: {buyer_email}\nExtracted tier: {tier}\n\n"
                            f"Raw message body:\n{body}"
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[settings.DEFAULT_FROM_EMAIL],
                    )
                    imap.store(msg_id, '+FLAGS', '\\Seen')
                continue

            existing_seat = LicenseSeat.objects.filter(email__iexact=buyer_email).first()

            if existing_seat:
                license = existing_seat.license
                self.stdout.write(
                    f"{'[dry-run] ' if dry_run else ''}Renewing {buyer_email} -> tier={tier} "
                    f"(license id={license.pk})"
                )
                if not dry_run:
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
                    imap.store(msg_id, '+FLAGS', '\\Seen')
            else:
                self.stdout.write(f"{'[dry-run] ' if dry_run else ''}Creating new {tier} license for {buyer_email}")
                if not dry_run:
                    license = License.objects.create(tier=tier, max_seats=None if tier == 'club' else 1)
                    seat = LicenseSeat.objects.create(license=license, email=buyer_email)
                    send_activation_email(seat, settings.SITE_URL)
                    imap.store(msg_id, '+FLAGS', '\\Seen')

        imap.logout()
