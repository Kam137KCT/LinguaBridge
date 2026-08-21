import json
import os
import random

from datasets import load_dataset

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

MIN_CHAR_LEN = 3
MAX_CHAR_LEN = 250
MAX_WORD_RATIO = 3.0
FLORES_UPSAMPLE_FACTOR = 5
CCMATRIX_MAX_PAIRS = 120_000  # Cap for 6GB GPU training budget


def clean_pairs(pairs):
    seen = set()
    cleaned = []
    for en, ne in pairs:
        en, ne = en.strip(), ne.strip()
        if not en or not ne:
            continue
        
        # Absolute character length limits
        if len(en) < MIN_CHAR_LEN or len(ne) < MIN_CHAR_LEN:
            continue
        if len(en) > MAX_CHAR_LEN or len(ne) > MAX_CHAR_LEN:
            continue
        
        # Word count ratio (more reliable for Devanagari vs. English)
        en_words = len(en.split())
        ne_words = len(ne.split())
        if en_words == 0 or ne_words == 0:
            continue
            
        word_ratio = max(en_words, ne_words) / min(en_words, ne_words)
        if word_ratio > MAX_WORD_RATIO:
            continue
        
        key = (en, ne)
        if key in seen:
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
    print(f"CCMatrix raw pairs loaded: {len(pairs)}")
    return pairs


def load_flores_dev():
    print("Loading FLORES-200 'dev' split...")
    ds = load_dataset("Muennighoff/flores200", "eng_Latn-npi_Deva", split="dev", trust_remote_code=True)
    pairs = [(row["sentence_eng_Latn"], row["sentence_npi_Deva"]) for row in ds]
    print(f"FLORES dev raw pairs loaded: {len(pairs)}")
    return pairs


def main():
    random.seed(42)

    # 1. Process FLORES dev set first to establish strict validation boundary
    flores_pairs = clean_pairs(load_flores_dev())
    random.shuffle(flores_pairs)
    
    val_size = min(200, len(flores_pairs) // 4)
    val_pairs = flores_pairs[:val_size]
    flores_train = flores_pairs[val_size:]
    
    val_set = set(val_pairs)  # For O(1) leak-prevention lookup

    # 2. Process CCMatrix
    raw_ccmatrix = load_ccmatrix()
    if len(raw_ccmatrix) > CCMATRIX_MAX_PAIRS * 2:
        # Pre-shuffle and sample to save memory during clean_pairs()
        random.shuffle(raw_ccmatrix)
        raw_ccmatrix = raw_ccmatrix[: CCMATRIX_MAX_PAIRS * 2]

    ccmatrix_cleaned = clean_pairs(raw_ccmatrix)
    
    # Filter out any validation pairs to prevent train/val leakage
    ccmatrix_filtered = [p for p in ccmatrix_cleaned if p not in val_set]
    
    if len(ccmatrix_filtered) > CCMATRIX_MAX_PAIRS:
        random.shuffle(ccmatrix_filtered)
        ccmatrix_filtered = ccmatrix_filtered[:CCMATRIX_MAX_PAIRS]

    # 3. Combine and shuffle training dataset
    train_pairs = ccmatrix_filtered + (flores_train * FLORES_UPSAMPLE_FACTOR)
    random.shuffle(train_pairs)

    print(f"Clean validation pairs (FLORES only): {len(val_pairs)}")
    print(f"Training pairs total: {len(train_pairs)} (CCMatrix: {len(ccmatrix_filtered)}, FLORES upsampled: {len(flores_train) * FLORES_UPSAMPLE_FACTOR})")

    # 4. Save JSONL files
    with open(os.path.join(OUTPUT_DIR, "train.jsonl"), "w", encoding="utf-8") as f:
        for en, ne in train_pairs:
            f.write(json.dumps({"en": en, "ne": ne}, ensure_ascii=False) + "\n")

    with open(os.path.join(OUTPUT_DIR, "val.jsonl"), "w", encoding="utf-8") as f:
        for en, ne in val_pairs:
            f.write(json.dumps({"en": en, "ne": ne}, ensure_ascii=False) + "\n")

    print(f"Dataset successfully prepared in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()