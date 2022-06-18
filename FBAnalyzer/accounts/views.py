# Views is the file that contains information and functions of different html-views.


from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from .models import Player
from django.http import HttpResponseRedirect
from django.urls import reverse
from accounts.forms import AddNewPlayer
from rest_framework import viewsets


@login_required
def index(request):
    return render(request,'accounts/index.html')

def new_game(request):
    return render(request, 'accounts/newgame.html')

def my_team(request):
    players = Player.objects.all().order_by('jersey_number')
    context = {
        'players': players,
    }

    return render(request, 'accounts/myteam.html', context = context)

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

    #  return render(request, 'accounts/myteam.html', context)

