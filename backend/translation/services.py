import hashlib
import json
import math

import redis
import torch
from django.conf import settings
from transformers import MarianMTModel, MarianTokenizer

from .model_registry import MODEL_MAP, TARGET_TOKEN, resolve_pivot

# One Redis connection reused across requests/consumers.
_redis_client = redis.Redis(
    host=settings.REDIS_HOST if hasattr(settings, "REDIS_HOST") else "127.0.0.1",
    port=int(getattr(settings, "REDIS_PORT", 6379)),
    decode_responses=True,
)

CACHE_TTL_SECONDS = 60 * 60 * 24 * 7  # 1 week

# Loaded models/tokenizers stay in memory after first use per process —
# reloading from disk on every translation would be far too slow.
_loaded = {}


def _get_model_and_tokenizer(model_name):
    if model_name not in _loaded:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        model.eval()
        _loaded[model_name] = (model, tokenizer)
    return _loaded[model_name]


def _cache_key(text, source_lang, target_lang):
    raw = f"{text}::{source_lang}::{target_lang}"
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return f"translation:{digest}"


def _confidence_from_score(avg_log_prob):
    """Maps average per-token log-probability to a coarse confidence
    bucket. Thresholds are a starting point — worth tuning once you
    have real output to look at, not a scientifically derived cutoff."""
    if avg_log_prob >= -0.4:
        return "high"
    if avg_log_prob >= -1.0:
        return "medium"
    return "low"


def _run_model(text, model_name, target_token=None):
    model, tokenizer = _get_model_and_tokenizer(model_name)

    input_text = f"{target_token} {text}" if target_token else text
    inputs = tokenizer([input_text], return_tensors="pt", padding=True, truncation=True)

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=256,
            num_beams=1,          # greedy — simpler confidence math than beam search
            output_scores=True,
            return_dict_in_generate=True,
        )

    translated_text = tokenizer.decode(output.sequences[0], skip_special_tokens=True)

    # Average log-probability of the chosen token at each generation step.
    token_scores = torch.stack(output.scores, dim=0)  # (steps, batch, vocab)
    log_probs = torch.log_softmax(token_scores, dim=-1)
    chosen_ids = output.sequences[0][1:1 + len(output.scores)]  # skip the initial decoder-start token
    step_log_probs = [
        log_probs[i, 0, tok_id].item()
        for i, tok_id in enumerate(chosen_ids)
        if i < log_probs.shape[0]
    ]
    avg_log_prob = sum(step_log_probs) / len(step_log_probs) if step_log_probs else -999

    return translated_text, avg_log_prob

def translate(text, source_lang, target_lang):
    """Returns (translated_text, confidence), or (None, None) if no
    translation path exists for this language pair at all — the
    frontend renders this as the 'Translation unavailable' state."""
    if source_lang == target_lang:
        return text, "high"

    if (source_lang, target_lang) not in MODEL_MAP and resolve_pivot(source_lang, target_lang) is None:
        return None, None  # e.g. en->ne right now — genuinely unsupported

    cache_key = _cache_key(text, source_lang, target_lang)
    cached = _redis_client.get(cache_key)
    if cached:
        data = json.loads(cached)
        return data["text"], data["confidence"]

    pivot = resolve_pivot(source_lang, target_lang)

    if pivot is None:
        model_name = MODEL_MAP[(source_lang, target_lang)]
        token = TARGET_TOKEN.get((source_lang, target_lang))
        translated_text, avg_log_prob = _run_model(text, model_name, target_token=token)
    else:
        step1_model = MODEL_MAP[(source_lang, pivot)]
        step1_token = TARGET_TOKEN.get((source_lang, pivot))
        pivot_text, pivot_log_prob = _run_model(text, step1_model, target_token=step1_token)

        step2_model = MODEL_MAP[(pivot, target_lang)]
        step2_token = TARGET_TOKEN.get((pivot, target_lang))
        translated_text, step2_log_prob = _run_model(pivot_text, step2_model, target_token=step2_token)

        avg_log_prob = min(pivot_log_prob, step2_log_prob)

    confidence = _confidence_from_score(avg_log_prob)

    _redis_client.setex(
        cache_key, CACHE_TTL_SECONDS, json.dumps({"text": translated_text, "confidence": confidence})
    )

    return translated_text, confidence