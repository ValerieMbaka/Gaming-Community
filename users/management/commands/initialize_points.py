from django.core.management.base import BaseCommand
from users.models import Gamer
import random


class Command(BaseCommand):
    help = 'Initialize points for existing users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--min-points',
            type=int,
            default=100,
            help='Minimum points to assign (default: 100)'
        )
        parser.add_argument(
            '--max-points',
            type=int,
            default=2000,
            help='Maximum points to assign (default: 2000)'
        )

    def handle(self, *args, **options):
        gamers = Gamer.objects.all()
        updated_count = 0
        
        for gamer in gamers:
            if gamer.points == 0:  # Only update users with 0 points
                # Generate random points between min and max
                points = random.randint(options['min_points'], options['max_points'])
                gamer.points = points
                gamer.save(update_fields=['points'])
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Updated {gamer.display_name} with {points} points'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} users with initial points'
            )
        )
