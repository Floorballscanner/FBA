# Views is the file that contains information and functions of different html-views.


from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from rest_framework.response import Response

from .models import Player, Team, Game, Level, Position, Line, LiveData, Shot, Time, License, LicenseSeat, FliigaSeasonStats
from insights.models import MatchState, TeamSeasonStats
from django.http import HttpResponseRedirect, JsonResponse
from accounts.forms import AddNewPlayer, TrialSignupForm
from accounts.decorators import license_required, get_active_license
from datetime import datetime
from rest_framework import viewsets, generics
from rest_framework.decorators import action
from django.forms import modelformset_factory
from .serializers import UserSerializer, TeamSerializer, LineSerializer, PositionSerializer, LevelSerializer, TimeSerializer
from .serializers import GameSerializer, PlayerSerializer, PlayerUpdateSerializer, LiveDataSerializer, ShotSerializer


def activate(request, token):
    seat = get_object_or_404(LicenseSeat, activation_token=token, user__isnull=True)

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = seat.email
            user.save()

            seat.user = user
            seat.save()

            messages.success(request, "Your account is ready. Please log in.")
            return redirect('login')
    else:
        form = UserCreationForm()

    return render(request, 'accounts/activate.html', {'form': form, 'seat': seat})


def start_trial(request):
    if request.method == 'POST':
        form = TrialSignupForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = form.cleaned_data['email']
            user.save()

            license = License.objects.create(tier='trial', max_seats=1)
            LicenseSeat.objects.create(license=license, user=user, email=user.email)

            send_mail(
                subject="New trial license created",
                message=f"A new 14-day trial license was created for {user.email}.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],
            )

            messages.success(
                request,
                "Your 14-day trial is ready. Please log in — it includes full access "
                "except F-Liiga results."
            )
            return redirect(reverse('login') + '?trial_started=trial')
    else:
        form = TrialSignupForm()

    return render(request, 'accounts/start_trial.html', {'form': form})


def start_fliiga_trial(request):
    if request.method == 'POST':
        form = TrialSignupForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = form.cleaned_data['email']
            user.save()

            license = License.objects.create(tier='fliiga_trial', max_seats=1)
            LicenseSeat.objects.create(license=license, user=user, email=user.email)

            send_mail(
                subject="New F-Liiga trial license created",
                message=f"A new 7-day F-Liiga trial license was created for {user.email}.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],
            )

            messages.success(
                request,
                "Your 7-day F-Liiga trial is ready. Please log in — it includes the "
                "F-Liiga live page."
            )
            return redirect(reverse('login') + '?trial_started=fliiga_trial')
    else:
        form = TrialSignupForm()

    return render(request, 'accounts/start_fliiga_trial.html', {'form': form})


def trial_expired(request):
    return render(request, 'accounts/trial_expired.html')


def fliiga_trial_expired(request):
    return render(request, 'accounts/fliiga_trial_expired.html')

@login_required
@license_required('fliiga', 'fliiga_full', 'fliiga_trial', 'team', 'club', 'trial')
def index(request):
    license = get_active_license(request.user)
    if license is not None and license.tier in ('fliiga', 'fliiga_full', 'fliiga_trial'):
        # F-Liiga-only tiers don't have anything else to do in the full app —
        # send them straight to the page they actually have access to instead
        # of a dashboard full of links they can't use.
        return redirect('fliiga-main')
    return render(request,'accounts/index.html')

@login_required
@license_required('team', 'club', 'trial')
def edit_players(request):
    teams = Team.objects.all().order_by('name')
    levels = Level.objects.all().order_by('name')
    players = Player.objects.all().order_by('jersey_number')

    context = {
        'teams': teams,
        'levels': levels,
        'players': players,
    }

    return render(request, 'accounts/edit_players.html', context=context)

@login_required
@license_required('team', 'club', 'trial')
def edit_levels(request):
    levels = Level.objects.all().order_by('name')

    LevelFormSet = modelformset_factory(Level, fields=('name', 'country', 'isSenior', 'isMale', 'isNational'))
    if request.method == 'POST':
        formset = LevelFormSet(request.POST, request.FILES)
        if formset.is_valid():
            formset.save()
            # do something.
    else:
        formset = LevelFormSet()

    context = {
        'levels': levels,
        'formset': formset,
    }

    return render(request, 'accounts/edit_levels.html', context=context)

@login_required
@license_required('team', 'club', 'trial')
def edit_teams(request):
    teams = Team.objects.all().order_by('name')
    levels = Level.objects.all().order_by('name')

    context = {
        'teams': teams,
        'levels': levels,
    }

    return render(request, 'accounts/edit_teams.html', context=context)

@login_required
@license_required('team', 'club', 'trial')
def analyse(request):

    if request.user.is_staff:
        games = Game.objects.filter(date__gte=datetime(2026, 1, 1)).order_by('date')
    else:
        games = Game.objects.filter(user=request.user).order_by('date')

    teams = Team.objects.all().order_by('name')
    levels = Level.objects.all().order_by('name')
    players = Player.objects.all().order_by('jersey_number')

    context = {
        'teams': teams,
        'levels': levels,
        'players': players,
        'games': games,
    }

    return render(request, 'accounts/analysis.html', context = context)

def lite(request):
    return render(request, 'accounts/lite.html')

@login_required
@license_required('team', 'club', 'trial')
def add_new_player(request):

    """View function for adding a new player to the team."""
    player_instance = Player()

    # If this is a POST request then process the Form data
    if request.method == 'POST':

        # Create a form instance and populate it with data from the request (binding):
        form = AddNewPlayer(request.POST)
        # Check if the form is valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required (here we just write it to the model due_back field)
            player_instance.jersey_number = form.clean_jersey_number()
            player_instance.first_name = form.clean_first_name()
            player_instance.last_name = form.clean_last_name()
            player_instance.save()

    # If this is a GET (or any other method) create the default form.
    else:
        form = AddNewPlayer()

    players = Player.objects.all().order_by('jersey_number')
    context = {
        'players': players,
    }

    return HttpResponseRedirect(request.META.get('HTTP_REFERER'))

    #  return render(request, 'accounts/edit_playersedit_players.html', context)

# ViewSets define the view behavior.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all().order_by('name')
    serializer_class = TeamSerializer

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all().order_by("id")
    serializer_class = PositionSerializer

class LineViewSet(viewsets.ModelViewSet):
    queryset = Line.objects.all().order_by("id")
    serializer_class = LineSerializer

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all().order_by("id")
    serializer_class = GameSerializer

    # Some games' game_data still carries these pre-rendered shot-map PNGs from
    # before shot positions started being recorded (see shotMapData/updateSaveData()
    # in premiumfunctions.js) - multi-game aggregate views (premium_analysis.js) never
    # read them, only ever a handful of stat fields, so fetching them for every game
    # in an analyzed set was the actual source of Premium Analysis's memory/bandwidth
    # cost. GET /apis/games/<id>/light/ returns the same payload with these stripped.
    LEGACY_IMAGE_KEYS = ('cnvs_url', 'cnvs_1_url', 'cnvs_2_url', 'cnvs_3_url', 'cnvs_4_url', 'cnvs_5_url')

    @action(detail=True, methods=['get'])
    def light(self, request, pk=None):
        game = self.get_object()
        data = GameSerializer(game, context={'request': request}).data
        game_data = data.get('game_data') or {}
        for key in self.LEGACY_IMAGE_KEYS:
            game_data.pop(key, None)
        data['game_data'] = game_data
        return Response(data)

class LiveDataViewSet(viewsets.ModelViewSet):
    queryset = LiveData.objects.all()
    serializer_class = LiveDataSerializer

class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer

class ShotViewSet(viewsets.ModelViewSet):
    queryset = Shot.objects.all()
    serializer_class = ShotSerializer

class TimeViewSet(viewsets.ModelViewSet):
    queryset = Time.objects.all()
    serializer_class = TimeSerializer

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all().order_by('jersey_number')
    serializer_class = PlayerSerializer

class TeamList(generics.ListAPIView):
    serializer_class = TeamSerializer

    def get_queryset(self):

        queryset = Team.objects.all().order_by('name')
        level = self.request.query_params.get('level_id')
        if level is not None:
            queryset = queryset.filter(level__id=level)
        return queryset

class PlayerList(generics.ListAPIView):
    serializer_class = PlayerSerializer

    def get_queryset(self):

        queryset = Player.objects.all().order_by('jersey_number')
        team = self.request.query_params.get('team_id')
        if team is not None:
            queryset = queryset.filter(team__id=team)
        return queryset

class GameList(generics.ListAPIView):
    serializer_class = GameSerializer

    def get_queryset(self):

        queryset = Game.objects.all().order_by('-date')
        user = self.request.query_params.get('user_id')
        if user is not None:
            queryset = queryset.filter(user__id=user)
        return queryset

@login_required
@license_required('team', 'club', 'trial')
def premium_game(request):
    teams = Team.objects.all().order_by('name')
    levels = Level.objects.all().order_by('name')
    players = Player.objects.all().order_by('jersey_number')

    context = {
        'teams': teams,
        'levels': levels,
        'players': players,
    }
    return render(request, 'accounts/premiumgame.html', context=context)

@login_required
@license_required('team', 'club', 'trial')
def premium_analysis(request):

    if request.user.is_staff:
        games = Game.objects.filter(date__gte=datetime(2026, 1, 1)).order_by('date')

    else:
        games = Game.objects.filter(user=request.user).order_by('date')

    context = {
        'games': games,
    }

    return render(request, 'accounts/premium_analysis.html', context=context)

@login_required
@license_required('team', 'club', 'trial')
def edit_data(request):

    return render(request, 'accounts/editdata.html')

@login_required
@license_required('team', 'club', 'trial')
def saved_games(request):
    return render(request,'accounts/saved_games.html')

@login_required
@license_required('fliiga', 'fliiga_full', 'team', 'club', 'trial')
def update_info(request):

    return render(request, 'accounts/update_info.html')

class UpdatePlayer(generics.UpdateAPIView):
    serializer_class = PlayerUpdateSerializer
    queryset = Player.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        serializer = self.get_serializer(instance, data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

@login_required
@license_required('fliiga', 'fliiga_full', 'fliiga_trial', 'team', 'club')
def fliigagame(request, nr):
    return render(request, 'f-liiga_game.html')
@login_required
@license_required('fliiga', 'fliiga_full', 'fliiga_trial', 'team', 'club')
def fliiga_main(request):
    return render(request, 'f-liiga.html')
@login_required
@license_required('fliiga_full', 'team', 'club')
def fliiga_results(request):
    return render(request, 'f-liiga_results.html')
@login_required
@license_required('fliiga', 'fliiga_full', 'fliiga_trial', 'team', 'club')
def fliigalive(request):
    return render(request, 'f-liiga_live.html')
@login_required
@license_required('fliiga_full', 'team', 'club')
def fliiga_statistics(request):
    return render(request, 'f-liiga_statistics.html')

@login_required
@license_required('fliiga_full', 'team', 'club')
def fliiga_stats_api(request):
    """Serves a cached FliigaSeasonStats table (team/player/goalie), computed
    ahead of time by the compute_fliiga_stats management command instead of
    on every request. Returns status='pending' if that combination hasn't
    been computed yet (e.g. a brand new stage with no scheduler run since)."""

    season_id = request.GET.get('season')
    category = request.GET.get('category')
    stage = request.GET.get('stage')
    table = request.GET.get('table')

    table_field = {'teams': 'team_stats', 'players': 'player_stats', 'goalies': 'goalie_stats'}.get(table)
    if not (season_id and category and stage and table_field):
        return JsonResponse({'error': 'season, category, stage, and table are required'}, status=400)

    row = FliigaSeasonStats.objects.filter(season_id=season_id, category=category, stage=stage).first()
    if row is None:
        return JsonResponse({'status': 'pending'})

    return JsonResponse({
        'status': 'ready',
        'is_final': row.is_final,
        'computed_at': row.computed_at.isoformat(),
        'rows': getattr(row, table_field),
    })

@login_required
@license_required('fliiga_full', 'team', 'club')
def fliiga_team_analysis(request):
    return render(request, 'f-liiga_team_analysis.html')

@login_required
@license_required('fliiga_full', 'team', 'club')
def fliiga_team_list_api(request):
    """Distinct teams available to pick from for a category, pulled straight
    from MatchState's team_a/team_b sides (no separate Team model exists for
    F-Liiga - see insights.models module docstring)."""

    category = request.GET.get('category')
    if category not in ('men', 'women'):
        return JsonResponse({'error': 'category must be men or women'}, status=400)

    teams = {}
    qs = MatchState.objects.filter(category=category).exclude(team_a_id='').values_list(
        'team_a_id', 'team_a_name', 'team_b_id', 'team_b_name',
    )
    for team_a_id, team_a_name, team_b_id, team_b_name in qs:
        teams[team_a_id] = team_a_name
        if team_b_id:
            teams[team_b_id] = team_b_name

    rows = sorted(({'team_id': tid, 'team_name': name} for tid, name in teams.items()), key=lambda t: t['team_name'])
    return JsonResponse({'teams': rows})

@login_required
@license_required('fliiga_full', 'team', 'club')
def fliiga_team_stats_api(request):
    """Serves a cached TeamSeasonStats row, computed ahead of time by the
    compute_team_stats management command. Returns status='pending' if that
    combination hasn't been computed yet."""

    team_id = request.GET.get('team_id')
    category = request.GET.get('category')
    season_id = request.GET.get('season')
    stage = request.GET.get('stage', 'regular')
    if not (team_id and category and season_id):
        return JsonResponse({'error': 'team_id, category, and season are required'}, status=400)

    row = TeamSeasonStats.objects.filter(
        team_id=team_id, category=category, season_id=season_id, stage=stage,
    ).first()
    if row is None:
        return JsonResponse({'status': 'pending'})

    return JsonResponse({
        'status': 'ready',
        'team_name': row.team_name,
        'computed_at': row.computed_at.isoformat(),
        'facts': row.facts,
    })
