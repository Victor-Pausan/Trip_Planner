from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_groupmembership'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='group',
            name='users',
        ),
        migrations.AddField(
            model_name='group',
            name='users',
            field=models.ManyToManyField(
                to='auth.User',
                through='api.GroupMembership',
                related_name='trip_groups',
            ),
        ),
    ]