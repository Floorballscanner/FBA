"""Client-push ingestion for the F-Liiga insight engine.

fliigalivegame.js's existing 10s Torneopal poll pushes each tick's match +
event data here instead of a separate backend poller (see the client-push
architecture note in models.py). Payload mirrors Torneopal's own getMatch
response shape so the caller doesn't need to pre-derive anything; all
derivation happens in insights.ingest.ingest_match_tick, shared with the
historical backfill command so both paths agree.

Expected JSON body:
{
  "match_id": "...", "category_id": "402"|"384",
  "season_id": "2025-2026", "group_id": "1"|"2", "date": "2025-09-13",
  "status": "<Torneopal match.status>", "live_period": "<Torneopal match.live_period>",
  "period_lengths_sec": [...],
  "team_a_id": "...", "team_b_id": "...", "team_a_name": "...", "team_b_name": "...",
  "score_a": 0, "score_b": 0,
  "events": [{event_id, code, team, team_id, player_id, period, time_sec,
              description, location, player_name, ...}, ...]
}
"""

import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST

from accounts.decorators import license_required

from .ingest import fetch_and_ingest_match, ingest_match_tick
from .models import Insight, PostGameAnalysis, PregameAnalysis
from .pregame import compute_pregame_analysis
from .torneopal import CATEGORY_ID_MAP, STAGE_GROUP_ID_MAP

LIVE_INSIGHTS_LIMIT = 10


@login_required
@license_required('fliiga', 'fliiga_trial', 'team', 'club')
@require_POST
def ingest_match_events(request):
    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({'error': 'invalid JSON body'}, status=400)

    match_id = payload.get('match_id')
    events = payload.get('events')
    if not match_id or not isinstance(events, list):
        return JsonResponse({'error': 'match_id and events are required'}, status=400)

    category = CATEGORY_ID_MAP.get(str(payload.get('category_id')))
    if category is None:
        return JsonResponse({'error': 'unrecognised category_id'}, status=400)

    new_status = ingest_match_tick(
        match_id=match_id,
        category=category,
        season_id=payload.get('season_id'),
        stage=STAGE_GROUP_ID_MAP.get(str(payload.get('group_id'))),
        date=payload.get('date'),
        status=payload.get('status'),
        live_period=payload.get('live_period'),
        period_lengths=payload.get('period_lengths_sec') or [],
        team_a_id=payload.get('team_a_id'),
        team_b_id=payload.get('team_b_id'),
        team_a_name=payload.get('team_a_name'),
        team_b_name=payload.get('team_b_name'),
        score_a=payload.get('score_a'),
        score_b=payload.get('score_b'),
        events=events,
    )

    return JsonResponse({'status': 'ok', 'match_status': new_status})


@login_required
@license_required('fliiga', 'fliiga_trial', 'team', 'club')
@require_GET
def pregame_analysis(request, match_id):
    """Lazy-fallback: serves the PregameAnalysis computed ahead of time by
    the compute_pregame command, computing it on the spot if that hasn't
    happened yet (e.g. a match nobody's looked at before the scheduled job
    reached it) - same fallback idea as accounts.views.fliiga_stats_api."""

    analysis = PregameAnalysis.objects.filter(match_id=match_id).first()
    if analysis is None:
        analysis = compute_pregame_analysis(match_id)
    if analysis is None:
        return JsonResponse({'status': 'pending'})

    return JsonResponse({
        'status': 'ready',
        'is_final': analysis.is_final,
        'computed_at': analysis.computed_at.isoformat(),
        'text': analysis.text,
        'facts': analysis.facts,
    })


@login_required
@license_required('fliiga', 'fliiga_trial', 'team', 'club')
@require_GET
def post_game_analysis(request, match_id):
    """Lazy-fallback: serves the PostGameAnalysis eagerly computed by
    ingest_match_tick's post-game trigger branch the moment a live push saw
    the match reach 'played'. For the rare match that was never live-pushed
    (browser closed early, license lapsed mid-game, etc.) this recovers it by
    fetching the match fresh from Torneopal and running it through the same
    ingestion path the backfill command uses."""

    analysis = PostGameAnalysis.objects.filter(match_id=match_id).first()
    if analysis is None:
        fetch_and_ingest_match(match_id)
        analysis = PostGameAnalysis.objects.filter(match_id=match_id).first()
    if analysis is None:
        return JsonResponse({'status': 'pending'})

    return JsonResponse({
        'status': 'ready',
        'computed_at': analysis.computed_at.isoformat(),
        'text': analysis.text,
        'facts': analysis.facts,
    })


@login_required
@license_required('fliiga', 'fliiga_trial', 'team', 'club')
@require_GET
def live_insights(request, match_id):
    """The live, tick-by-tick insight feed for a match in progress (see
    insights.live_insights.evaluate_match_insights, run every ~60s from
    ingest_match_tick). Excludes wp_swing's own silent bookkeeping rows
    (empty text) that exist only so the next evaluation has a true previous
    win-probability value to diff against."""

    insights = (
        Insight.objects.filter(match_id=match_id).exclude(text='').order_by('-created_at')[:LIVE_INSIGHTS_LIMIT]
    )
    return JsonResponse({
        'insights': [
            {
                'type': i.insight_type, 'text': i.text,
                'score': float(i.score), 'created_at': i.created_at.isoformat(),
            }
            for i in insights
        ],
    })
