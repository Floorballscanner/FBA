# Generated by Django 4.0.5 on 2022-10-13 18:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0021_remove_livedata_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='game_data',
            field=models.JSONField(default={}),
            preserve_default=False,
        ),
    ]