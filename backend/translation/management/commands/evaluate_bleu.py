from django.core.management.base import BaseCommand
from datasets import load_dataset
import sacrebleu

from translation.services import translate


class Command(BaseCommand):
    help = "Evaluate en->ne translation quality against FLORES-200 devtest using BLEU."

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit", type=int, default=20,
            help="Number of sentences to evaluate (devtest has 1012 total; each is a live model call).",
        )

    def handle(self, *args, **options):
        limit = options["limit"]

        self.stdout.write("Loading FLORES-200 devtest (eng_Latn-npi_Deva)...")
        dataset = load_dataset(
            "Muennighoff/flores200", "eng_Latn-npi_Deva", split="devtest", trust_remote_code=True
        )
        self.stdout.write(f"Columns: {dataset.column_names}")

        src_col = "sentence_eng_Latn"
        ref_col = "sentence_npi_Deva"

        subset = dataset.select(range(min(limit, len(dataset))))
        hypotheses, references = [], []

        for i, row in enumerate(subset):
            source_text = row[src_col]
            reference_text = row[ref_col]

            translated_text, confidence = translate(source_text, "en", "ne")
            if translated_text is None:
                self.stdout.write(f"[{i}] SKIPPED (no translation returned — check MODEL_MAP has en-ne mapped)")
                continue

            hypotheses.append(translated_text)
            references.append(reference_text)
            self.stdout.write(f"[{i}] src: {source_text}")
            self.stdout.write(f"     ref: {reference_text}")
            self.stdout.write(f"     hyp: {translated_text}  (confidence: {confidence})\n")

        if not hypotheses:
            self.stdout.write(self.style.ERROR("No hypotheses generated — nothing to score."))
            return

        bleu = sacrebleu.corpus_bleu(hypotheses, [references])
        self.stdout.write(self.style.SUCCESS(f"\nCorpus BLEU over {len(hypotheses)} sentences: {bleu.score:.2f}"))