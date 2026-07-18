"""
Maps (source_lang, target_lang) pairs to the model that handles them.

en<->ne is intentionally NOT mapped right now. Testing showed
Helsinki-NLP/opus-mt-en-inc doesn't have a working vocabulary entry for
the "npi" target token (confirmed: it resolves to <unk>), so english to
nepali translation is unsupported until Milestone 9's fine-tuned model
replaces this gap. This surfaces correctly as the "Translation
unavailable" state already built into the frontend, rather than
silently returning garbled output.
"""

MODEL_MAP = {
    ("en", "fr"): "Helsinki-NLP/opus-mt-en-fr",
    ("fr", "en"): "Helsinki-NLP/opus-mt-fr-en",
    ("en", "es"): "Helsinki-NLP/opus-mt-en-es",
    ("es", "en"): "Helsinki-NLP/opus-mt-es-en",

    # Community-trained checkpoint, not an official Helsinki-NLP model.
    # Standing in for ne->en only until Milestone 9's own fine-tuned
    # model is ready. Verify actual output quality before relying on
    # this for anything beyond development testing.
    ("ne", "en"): "iamTangsang/MarianMT-Nepali-to-English",

    # ("en", "ne") deliberately absent — see module docstring.
}

# Target-language token required for any multi-target model in
# MODEL_MAP. None of the models above currently need one — this stays
# empty until en-ne (or another multi-target model) is reintroduced
# with a verified working token.
TARGET_TOKEN = {}


def resolve_pivot(source_lang, target_lang):
    """Returns 'en' if a two-hop pivot through English is possible,
    or None if no path exists at all (direct or pivoted)."""
    if (source_lang, target_lang) in MODEL_MAP:
        return None  # direct model exists, no pivot needed

    # A pivot through English only makes sense if neither side already
    # IS English, and both hops actually exist in MODEL_MAP.
    if source_lang == "en" or target_lang == "en":
        return None

    if (source_lang, "en") in MODEL_MAP and ("en", target_lang) in MODEL_MAP:
        return "en"

    return None