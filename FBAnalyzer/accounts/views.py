# Views is the file that contains information and functions of different html-views.


from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response

from .models import Player, Team, Game, Level, Position, Line, LiveData, Shot, Time
from django.http import HttpResponseRedirect
from accounts.forms import AddNewPlayer
from rest_framework import viewsets, generics
from django.forms import modelformset_factory
from .serializers import UserSerializer, TeamSerializer, LineSerializer, PositionSerializer, LevelSerializer, TimeSerializer
from .serializers import GameSerializer, PlayerSerializer, PlayerUpdateSerializer, LiveDataSerializer, ShotSerializer

@login_required
def index(request):
    return render(request,'accounts/index.html')

@login_required
def new_game(request):
    levels = Level.objects.all().order_by('name')

    context = {
        'levels': levels,
    }
    return render(request, 'accounts/newgame.html', context=context)

@login_required
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
def edit_teams(request):
    teams = Team.objects.all().order_by('name')
    levels = Level.objects.all().order_by('name')

    context = {
        'teams': teams,
        'levels': levels,
    }

    return render(request, 'accounts/edit_teams.html', context=context)

def analyse(request):

    if request.user.id == 3 or request.user.id == 2:
        games = Game.objects.order_by('date')
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
def test_environment(request):
    teams = Team.objects.all().order_by('name')
    levels = Level.objects.all().order_by('name')
    players = Player.objects.all().order_by('jersey_number')

    context = {
        'teams': teams,
        'levels': levels,
        'players': players,
    }
    return render(request, 'accounts/test_environment.html', context=context)

@login_required
def test_analysis(request):

    if request.user.id == 3 or request.user.id == 2:
        games = Game.objects.order_by('date')
    else:
        games = Game.objects.filter(user=request.user).order_by('date')

    context = {
        'games': games,
    }

    return render(request, 'accounts/test_analysis.html', context=context)

@login_required
def edit_data(request):

    return render(request, 'accounts/editdata.html')

@login_required
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
