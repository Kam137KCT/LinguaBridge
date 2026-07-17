from django.contrib.auth.models import AbstractUser
from django.db import models

from linguabridge_backend.constants import LANGUAGE_CHOICES


class User(AbstractUser):
    """Custom user model — adds preferred_language on top of Django's
    built-in username/email/password fields from AbstractUser."""

    preferred_language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default="en",
        help_text="Incoming messages are translated into this language.",
    )

    def __str__(self):
        return self.username