import { LANGUAGE_LABELS, LANGUAGE_NAMES } from '../data/mockData';

export default function EmptyState() {
  const langs = Object.keys(LANGUAGE_LABELS);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ background: 'var(--color-fog)' }}>
      <div
        className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center mb-6"
        style={{ borderColor: 'var(--color-bridge)', transform: 'rotate(-6deg)' }}
      >
        <span className="font-display text-[22px] font-600" style={{ color: 'var(--color-bridge)' }}>LB</span>
      </div>

      <h2 className="font-display text-[22px] mb-2" style={{ color: 'var(--color-ink)' }}>
        Pick a room to start
      </h2>
      <p className="text-[14px] text-center max-w-xs leading-relaxed mb-6" style={{ color: 'var(--color-ink-soft)' }}>
        Every message is translated into each person's own language, automatically.
      </p>

      <div className="flex items-center gap-2">
        {langs.map((l) => (
          <span
            key={l}
            className="font-mono text-[11px] font-600 px-2 py-1 rounded"
            style={{ background: 'white', color: 'var(--color-ink-soft)', border: '1px solid var(--color-fog-dim)' }}
            title={LANGUAGE_NAMES[l]}
          >
            {LANGUAGE_LABELS[l]}
          </span>
        ))}
      </div>
    </div>
  );
}