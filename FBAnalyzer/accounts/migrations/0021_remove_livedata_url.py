# Generated by Django 4.0.5 on 2022-08-20 12:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0020_livedata_url'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='livedata',
            name='url',
        ),
    ]
