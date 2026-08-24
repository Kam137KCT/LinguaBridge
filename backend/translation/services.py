import hashlib
import json

import redis
import torch
from django.conf import settings
from transformers import MarianMTModel, MarianTokenizer, AutoTokenizer, AutoModelForSeq2SeqLM

from .model_registry import (
    MODEL_MAP, TARGET_TOKEN, MODEL_ARCHITECTURE, NLLB_LANG_CODES,
    GENERATION_CONFIG, resolve_pivot,
)

_redis_client = redis.Redis(
    host=getattr(settings, "REDIS_HOST", "127.0.0.1"),
    port=int(getattr(settings, "REDIS_PORT", 6379)),
    decode_responses=True,
)

CACHE_TTL_SECONDS = 60 * 60 * 24 * 7
_loaded = {}


def _get_model_and_tokenizer(model_name):
    if model_name not in _loaded:
        architecture = MODEL_ARCHITECTURE.get(model_name, "marian")
        if architecture in ("mt5", "nllb"):
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        else:
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
    if avg_log_prob >= -0.4:
        return "high"
    if avg_log_prob >= -1.0:
        return "medium"
    return "low"


def _run_model(text, model_name, source_lang=None, target_lang=None, target_token=None):
    model, tokenizer = _get_model_and_tokenizer(model_name)
    architecture = MODEL_ARCHITECTURE.get(model_name, "marian")
    gen_config = GENERATION_CONFIG.get(model_name, {})
    num_beams = gen_config.get("num_beams", 1)

    generate_kwargs = {
        "max_new_tokens": 256,
        "num_beams": num_beams,
        "output_scores": True,
        "return_dict_in_generate": True,
    }
    if "no_repeat_ngram_size" in gen_config:
        generate_kwargs["no_repeat_ngram_size"] = gen_config["no_repeat_ngram_size"]

    if architecture == "nllb":
        # NLLB selects target language via forced_bos_token_id, not a
        # text prefix — completely different mechanism from Marian's
        # >>lang<< token trick.
        tokenizer.src_lang = NLLB_LANG_CODES[source_lang]
        target_code = NLLB_LANG_CODES[target_lang]
        generate_kwargs["forced_bos_token_id"] = tokenizer.convert_tokens_to_ids(target_code)
        input_text = text
    else:
        input_text = f"{target_token} {text}" if target_token else text

    inputs = tokenizer([input_text], return_tensors="pt", padding=True, truncation=True)

    with torch.no_grad():
        output = model.generate(**inputs, **generate_kwargs)

    translated_text = tokenizer.decode(output.sequences[0], skip_special_tokens=True)

    # Beam search: HuggingFace already computes a length-normalized
    # sequence score (sum of log-probs / length**length_penalty, with
    # length_penalty=1.0 by default — i.e. average log-prob per token,
    # the same scale as the greedy calculation below), so the existing
    # confidence thresholds apply to both without separate calibration.
    if num_beams > 1 and getattr(output, "sequences_scores", None) is not None:
        avg_log_prob = output.sequences_scores[0].item()
        return translated_text, avg_log_prob

    if not output.scores:
        return translated_text, -999.0

    token_scores = torch.stack(output.scores, dim=0)
    log_probs = torch.log_softmax(token_scores, dim=-1)
    chosen_ids = output.sequences[0][1:1 + len(output.scores)]
    step_log_probs = [
        log_probs[i, 0, tok_id].item()
        for i, tok_id in enumerate(chosen_ids)
        if i < log_probs.shape[0]
    ]
    avg_log_prob = sum(step_log_probs) / len(step_log_probs) if step_log_probs else -999

    return translated_text, avg_log_prob


def translate(text, source_lang, target_lang):
    if source_lang == target_lang:
        return text, "high"

    if (source_lang, target_lang) not in MODEL_MAP and resolve_pivot(source_lang, target_lang) is None:
        return None, None

    cache_key = _cache_key(text, source_lang, target_lang)
    try:
        cached = _redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return data["text"], data["confidence"]
    except redis.RedisError:
        pass

    pivot = resolve_pivot(source_lang, target_lang)

    if pivot is None:
        model_name = MODEL_MAP[(source_lang, target_lang)]
        token = TARGET_TOKEN.get((source_lang, target_lang))
        translated_text, avg_log_prob = _run_model(
            text, model_name, source_lang=source_lang, target_lang=target_lang, target_token=token
        )
    else:
        step1_model = MODEL_MAP[(source_lang, pivot)]
        step1_token = TARGET_TOKEN.get((source_lang, pivot))
        pivot_text, pivot_log_prob = _run_model(
            text, step1_model, source_lang=source_lang, target_lang=pivot, target_token=step1_token
        )

        step2_model = MODEL_MAP[(pivot, target_lang)]
        step2_token = TARGET_TOKEN.get((pivot, target_lang))
        translated_text, step2_log_prob = _run_model(
            pivot_text, step2_model, source_lang=pivot, target_lang=target_lang, target_token=step2_token
        )

        avg_log_prob = min(pivot_log_prob, step2_log_prob)

    confidence = _confidence_from_score(avg_log_prob)

    try:
        _redis_client.setex(
            cache_key, CACHE_TTL_SECONDS, json.dumps({"text": translated_text, "confidence": confidence})
        )
    except redis.RedisError:
        pass

    return translated_text, confidence