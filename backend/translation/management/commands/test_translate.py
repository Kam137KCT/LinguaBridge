from django.core.management.base import BaseCommand
from translation.services import translate

class Command(BaseCommand):
    help = "Quick manual test of the translation service."

    def handle(self, *args, **options):
        tests = [
            ("Hello, how are you?", "en", "fr"),
            ("Hello, how are you?", "en", "es"),
            ("Hello, how are you?", "en", "ne"),   # expect (None, None) now — this is correct
            ("Bonjour, comment ça va ?", "fr", "en"),
            ("Bonjour, comment ça va ?", "fr", "es"),  # pivots through English
            ("तपाईंलाई कस्तो छ?", "ne", "en"),      # new community model
        ]
        for text, src, tgt in tests:
            translated, confidence = translate(text, src, tgt)
            if translated is None:
                self.stdout.write(f"[{src}->{tgt}] {text!r} => UNAVAILABLE (no model for this pair)")
            else:
                self.stdout.write(f"[{src}->{tgt}] {text!r} => {translated!r} (confidence: {confidence})")