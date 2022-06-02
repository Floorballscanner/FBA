from django import forms
from django.core.exceptions import ValidationError
from .models import Player

class AddNewPlayer(forms.Form):

    first_name = forms.CharField(help_text="Enter the first name of the player.")
    last_name = forms.CharField(help_text="Enter the last name of the player.")
    jersey_number = forms.IntegerField(help_text="Enter the jersey number of the player.")

    def clean_jersey_number(self):
        data = self.cleaned_data['jersey_number']

        # Check if a number is not negative or zero
        if data < 1:
            raise ValidationError('Invalid number - should be larger than 0')

        # Check if a number is not over 99.
        if data > 99:
            raise ValidationError('Invalid number - should be smaller than 100')

        # Remember to always return the cleaned data.
        return data

    def clean_last_name(self):
        data = self.cleaned_data['last_name']

        # Remember to always return the cleaned data.
        return data

    def clean_first_name(self):
        data = self.cleaned_data['first_name']

        # Remember to always return the cleaned data.
        return data

class changeTeam(forms.Form):

    Line_choices = [
        ('first', 'Line 1'),
        ('second', 'Line 2'),
        ('third', 'Line 3'),
        ('goalies', 'Goalies'),
        ('others', 'Others'),
    ]

    Positions = [
        ('LF', 'Left Forward'),
        ('C', 'Center'),
        ('RF', 'Right Forward'),
        ('LD', 'Left Defence'),
        ('RD', 'Right Defence'),
    ]

    players = Player.objects.all().order_by('jersey_number')
    context = {
        'players': players,
    }

    line_choice = forms.ChoiceField(label='Line of the player', widget=forms.Select(choices=Line_choices))
    position = forms.ChoiceField(label='Player position', widget=forms.Select(choices=Positions))
    player_name = forms.ChoiceField(label='Player', widget=forms.Select(choices=context))

class ContactForm(forms.Form):

    first_name = forms.CharField(max_length = 50)
    last_name = forms.CharField(max_length = 50)
    email_address = forms.EmailField(max_length = 150)
    message = forms.CharField(widget = forms.Textarea, max_length = 2000)