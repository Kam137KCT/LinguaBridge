"""
One-time data preparation for Milestone 9 fine-tuning.

Combines:
- CCMatrix en-ne (web-mined, larger but noisier) as the primary
  training set
- FLORES-200 "dev" split (997 human-translated sentences) as a small,
  clean supplement

Deliberately does NOT touch FLORES-200 "devtest" — that split is
reserved exclusively for evaluation (evaluate_bleu.py), never trained
on, so the BLEU score actually means something.

Outputs train.jsonl / val.jsonl to backend/training/data/.
"""

import json
import os
import random

from datasets import load_dataset

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

MIN_LEN = 3          # drop near-empty fragments
MAX_LEN = 200         # drop absurdly long mined "sentences" (often misaligned junk)
MAX_LEN_RATIO = 3.0   # drop pairs where one side is way longer than the other (misalignment signal)


def clean_pairs(pairs):
    """Basic quality filtering for noisy mined data."""
    seen = set()
    cleaned = []
    for en, ne in pairs:
        en, ne = en.strip(), ne.strip()
        if not en or not ne:
            continue
        if len(en) < MIN_LEN or len(ne) < MIN_LEN:
            continue
        if len(en) > MAX_LEN or len(ne) > MAX_LEN:
            continue
        ratio = max(len(en), len(ne)) / max(1, min(len(en), len(ne)))
        if ratio > MAX_LEN_RATIO:
            continue
        key = (en, ne)
        if key in seen:  # drop exact duplicates
            continue
        seen.add(key)
        cleaned.append((en, ne))
    return cleaned


def load_ccmatrix():
    print("Loading CCMatrix en-ne...")
    try:
        ds = load_dataset("yhavinga/ccmatrix", "en-ne", split="train", trust_remote_code=True)
    except Exception as e:
        print(f"CCMatrix en-ne failed to load: {e}")
        return []
    pairs = [(row["translation"]["en"], row["translation"]["ne"]) for row in ds]
    print(f"CCMatrix raw pairs: {len(pairs)}")
    return pairs


def load_flores_dev():
    print("Loading FLORES-200 'dev' split (eng_Latn-npi_Deva)...")
    ds = load_dataset("Muennighoff/flores200", "eng_Latn-npi_Deva", split="dev", trust_remote_code=True)
    pairs = [(row["sentence_eng_Latn"], row["sentence_npi_Deva"]) for row in ds]
    print(f"FLORES dev pairs: {len(pairs)}")
    return pairs


def main():
    ccmatrix_pairs = clean_pairs(load_ccmatrix())
    flores_pairs = clean_pairs(load_flores_dev())

    print(f"CCMatrix after cleaning: {len(ccmatrix_pairs)}")
    print(f"FLORES dev after cleaning: {len(flores_pairs)}")

    all_pairs = ccmatrix_pairs + flores_pairs
    random.seed(42)
    random.shuffle(all_pairs)

    val_size = min(1000, max(50, len(all_pairs) // 20))  # ~5%, capped sensibly
    val_pairs = all_pairs[:val_size]
    train_pairs = all_pairs[val_size:]

    print(f"Final: {len(train_pairs)} train / {len(val_pairs)} val")

    with open(os.path.join(OUTPUT_DIR, "train.jsonl"), "w", encoding="utf-8") as f:
        for en, ne in train_pairs:
            f.write(json.dumps({"en": en, "ne": ne}, ensure_ascii=False) + "\n")

    with open(os.path.join(OUTPUT_DIR, "val.jsonl"), "w", encoding="utf-8") as f:
        for en, ne in val_pairs:
            f.write(json.dumps({"en": en, "ne": ne}, ensure_ascii=False) + "\n")

    print(f"Wrote data to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()