# This is the file where Django backend models = database tables are created

from django.db import models
import uuid

# Create your models here. Testipäivitys2..

class Player(models.Model):
    print(11)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    jersey_number = models.IntegerField()
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    def __str__(self):
        """String for representing the Model object."""
        return f'{self.last_name} ({self.first_name})'
