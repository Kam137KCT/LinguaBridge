from django.db import models

from chat.models import Message
from linguabridge_backend.constants import LANGUAGE_CHOICES

CONFIDENCE_CHOICES = [
    ("high", "High"),
    ("medium", "Medium"),
    ("low", "Low"),
]


class Translation(models.Model):
    """One row per (message, target_language) — this is what makes
    translation per-recipient rather than per-conversation. A null
    translated_text represents the 'Translation unavailable' state
    the frontend already handles."""

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="translations")
    target_language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    translated_text = models.TextField(null=True, blank=True)
    confidence = models.CharField(max_length=10, choices=CONFIDENCE_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "target_language")

    def __str__(self):
        status = self.translated_text[:30] if self.translated_text else "unavailable"
        return f"{self.message_id} → {self.target_language}: {status}"