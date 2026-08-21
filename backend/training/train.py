"""
Milestone 9 — fine-tunes Helsinki-NLP/opus-mt-en-inc directly toward
en->ne only, without ever using the broken >>lang<< multi-target
token mechanism. Since this checkpoint will only ever be used for one
direction after fine-tuning, the model learns (via gradient descent
on real data) to always produce Nepali — sidestepping the missing
vocabulary entry entirely rather than working around it.

Sized for a 6GB laptop GPU: small batch size + gradient accumulation
to reach a reasonable effective batch size, fp16 mixed precision.
"""

import argparse
import os

import numpy as np
from datasets import load_dataset
from transformers import (
    MarianMTModel,
    MarianTokenizer,
    DataCollatorForSeq2Seq,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
)

BASE_MODEL = "Helsinki-NLP/opus-mt-en-inc"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MAX_LENGTH = 128  # chat messages are short; covers almost all real cases


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--output_dir", default=os.path.join(os.path.dirname(__file__), "en-ne-finetuned"))
    p.add_argument("--epochs", type=float, default=3)
    p.add_argument("--batch_size", type=int, default=8)
    p.add_argument("--grad_accum", type=int, default=4)  # effective batch = batch_size * grad_accum = 32
    p.add_argument("--max_train_samples", type=int, default=None, help="For a quick smoke test before the full run.")
    return p.parse_args()


def main():
    args = parse_args()

    print("Loading base model and tokenizer:", BASE_MODEL)
    tokenizer = MarianTokenizer.from_pretrained(BASE_MODEL)
    model = MarianMTModel.from_pretrained(BASE_MODEL)

    print("Loading prepared dataset...")
    dataset = load_dataset(
        "json",
        data_files={
            "train": os.path.join(DATA_DIR, "train.jsonl"),
            "validation": os.path.join(DATA_DIR, "val.jsonl"),
        },
    )

    if args.max_train_samples:
        dataset["train"] = dataset["train"].select(range(min(args.max_train_samples, len(dataset["train"]))))
        print(f"Smoke test: using only {len(dataset['train'])} training examples.")

    print(f"Train: {len(dataset['train'])} | Validation: {len(dataset['validation'])}")

    def preprocess(examples):
        model_inputs = tokenizer(examples["en"], max_length=MAX_LENGTH, truncation=True)
        labels = tokenizer(text_target=examples["ne"], max_length=MAX_LENGTH, truncation=True)
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    tokenized = dataset.map(preprocess, batched=True, remove_columns=["en", "ne"])

    data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

    training_args = Seq2SeqTrainingArguments(
        output_dir=os.path.join(os.path.dirname(__file__), "checkpoints"),
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        num_train_epochs=args.epochs,
        fp16=True,
        save_safetensors=False,   # MarianMT ties embed/lm_head weights — safetensors
                                   # drops the "duplicate" aliases, causing them to
                                   # silently reinitialize randomly on reload. The
                                   # older pickle-based .bin format saves tied
                                   # weights correctly under every alias.
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=2,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        logging_steps=50,
        report_to="none",
        predict_with_generate=False,
    )

    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
        data_collator=data_collator,
        processing_class=tokenizer,  # Updated from tokenizer=tokenizer to silence HuggingFace warning
    )

    print("Starting training...")
    trainer.train()

    print(f"Saving final model to {args.output_dir}")
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print("Done.")


if __name__ == "__main__":
    main()