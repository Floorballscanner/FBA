"""Shared Torneopal API access: the single source for season/category/stage
ID mappings and the api_get() fetch helper.

accounts/management/commands/compute_fliiga_stats.py and
insights/management/commands/backfill_match_events.py both import from here
instead of keeping their own copies, so a competition ID never drifts between
the two.
"""

import json
import urllib.request

API_KEY = 'n76qrhjnyygtcz7fzhg57sftbv6wtgjk'
API_BASE = 'https://salibandy.api.torneopal.com/taso/rest'

# season_id -> competition_id, same mapping used across the F-Liiga pages.
SEASON_COMPETITION_IDS = {
    '2024-2025': 'sb2024',
    '2025-2026': 'sb2025',
    '2026-2027': 'sb2026',
}
CATEGORY_IDS = {'men': '402', 'women': '384'}
CATEGORY_ID_MAP = {v: k for k, v in CATEGORY_IDS.items()}
STAGE_GROUP_IDS = {'regular': '1', 'playoffs': '2'}
STAGE_GROUP_ID_MAP = {v: k for k, v in STAGE_GROUP_IDS.items()}

MAX_WORKERS = 16


def api_get(endpoint, **params):
    query = '&'.join(f'{k}={v}' for k, v in params.items())
    url = f'{API_BASE}/{endpoint}?api_key={API_KEY}&{query}'
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.loads(response.read())
