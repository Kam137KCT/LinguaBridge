from django.apps import AppConfig


class TranslationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'translation'

    def ready(self):
        import os
        if os.getenv('EAGER_LOAD_MODELS') == 'True':
            from .services import _get_model_and_tokenizer
            from .model_registry import MODEL_MAP
            for model_name in set(MODEL_MAP.values()):
                _get_model_and_tokenizer(model_name)
