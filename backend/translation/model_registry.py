"""
Maps (source_lang, target_lang) pairs to the model that handles them.
"""

MODEL_MAP = {
    ("en", "fr"): "Helsinki-NLP/opus-mt-en-fr",
    ("fr", "en"): "Helsinki-NLP/opus-mt-fr-en",
    ("en", "es"): "Helsinki-NLP/opus-mt-en-es",
    ("es", "en"): "Helsinki-NLP/opus-mt-es-en",

    # Milestone 9 — our own fine-tuned NLLB-200 checkpoints, replacing
    # both the earlier unsupported en-ne gap and the interim community
    # ne-en MarianMT model. Evaluated at BLEU 31.35 (en->ne) and 41.19
    # (ne->en) on FLORES-200 devtest using beam search — see
    # GENERATION_CONFIG below for why this is the one pair using
    # beam search rather than greedy decoding.
    ("en", "ne"): "KhBYaTh13/nllb-200-en-ne",
    ("ne", "en"): "KhBYaTh13/nllb-200-ne-en",
}

# Tracks which loading mechanism + tokenizer class each model needs.
# Everything defaults to "marian" (MarianTokenizer/MarianMTModel)
# unless listed here.
MODEL_ARCHITECTURE = {
    "KhBYaTh13/nllb-200-en-ne": "nllb",
    "KhBYaTh13/nllb-200-ne-en": "nllb",
}

# NLLB selects its target language via a language-code token
# (forced_bos_token_id), not a plain 2-letter code — needs its own
# mapping, separate from LANGUAGE_CHOICES used everywhere else.
NLLB_LANG_CODES = {
    "en": "eng_Latn",
    "ne": "npi_Deva",
}

# Per-model generation settings. NLLB uses beam search here
# specifically because evaluation showed it meaningfully outperforms
# greedy decoding for this model (BLEU 41.19/31.35 vs. an untested,
# likely lower greedy number) — no_repeat_ngram_size guards against
# the degenerate-repetition failure mode found in an earlier
# fine-tuning attempt on a different model. Every other model here
# defaults to greedy (num_beams=1) if not listed.
GENERATION_CONFIG = {
    "KhBYaTh13/nllb-200-en-ne": {"num_beams": 4, "no_repeat_ngram_size": 3},
    "KhBYaTh13/nllb-200-ne-en": {"num_beams": 4, "no_repeat_ngram_size": 3},
}

TARGET_TOKEN = {}


def resolve_pivot(source_lang, target_lang):
    """Returns 'en' if a two-hop pivot through English is possible,
    or None if no path exists at all (direct or pivoted)."""
    if (source_lang, target_lang) in MODEL_MAP:
        return None
    if source_lang == "en" or target_lang == "en":
        return None
    if (source_lang, "en") in MODEL_MAP and ("en", target_lang) in MODEL_MAP:
        return "en"
    return None