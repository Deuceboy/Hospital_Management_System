# Generated by Django 4.1.2 on 2023-08-25 10:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('hospital', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='user_type',
            field=models.PositiveSmallIntegerField(blank=True, choices=[(1, 'doctor'), (2, 'accountant'), (3, 'admin'), (4, 'nurse')], null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='groups',
            field=models.ManyToManyField(blank=True, related_name='custom_user_groups', related_query_name='user', to='auth.group', verbose_name='groups'),
        ),
        migrations.DeleteModel(
            name='UserProfile',
        ),
    ]