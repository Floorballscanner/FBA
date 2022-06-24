# This is the file where Django backend models = database tables are created

from django.db import models
import uuid

# Create your models here

class Player(models.Model):
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    jersey_number = models.IntegerField()
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self):
        """String for representing the Model object."""
        return f'{self.last_name} ({self.first_name})'

class Live(models.Model):
    objects = models.Manager()
    data = models.JSONField()
    #data = models.IntegerField()

    def __str__(self):
        return self.task

class Team(models.Model):
    objects = models.Manager()

    name = models.CharField(max_length=100)
    lineOn = models.IntegerField()
    possessionPeriod = models.IntegerField()
    possessionGame = models.IntegerField()
    goalsPeriod = models.IntegerField()
    goalsGame = models.IntegerField()
    xgPeriod = models.DecimalField(max_digits=5, decimal_places=2)
    xgGame = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return self.task

class Game(models.Model):
    date = models.DateTimeField(auto_now = True, blank = True)
    periodNr = models.IntegerField()
    gameClock = models.IntegerField()
    periodClock = models.IntegerField()

    def __str__(self):
        return self.task

class Line(models.Model):
    name = models.CharField(max_length=20)
    possessionPeriod = models.IntegerField()
    possessionGame = models.IntegerField()
    gfPeriod = models.IntegerField()
    gfGame = models.IntegerField()
    gaPeriod = models.IntegerField()
    gaGame = models.IntegerField()
    TOCPeriod = models.IntegerField()
    TOCGame = models.IntegerField()
    xGfPeriod = models.DecimalField(max_digits=5, decimal_places=2)
    xGfGame = models.DecimalField(max_digits=5, decimal_places=2)
    xGaPeriod = models.DecimalField(max_digits=5, decimal_places=2)
    xGaGame = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return self.task