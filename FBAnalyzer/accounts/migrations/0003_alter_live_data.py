# Generated by Django 4.0.5 on 2022-06-23 18:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_game_line_live_team'),
    ]

    operations = [
        migrations.AlterField(
            model_name='live',
            name='data',
            field=models.IntegerField(),
        ),
    ]