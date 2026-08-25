import { LANGUAGE_LABELS, LANGUAGE_NAMES } from '../data/mockData';

export default function EmptyState() {
  const langs = Object.keys(LANGUAGE_LABELS);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8" style={{ background: 'var(--color-fog)' }}>
      <div
        className="mb-6 flex size-16 items-center justify-center rounded-full border-2 border-dashed"
        style={{ borderColor: 'var(--color-bridge)', transform: 'rotate(-6deg)' }}
      >
        <span className="font-['display'] text-[22px] font-semibold" style={{ color: 'var(--color-bridge)' }}>
          LB
        </span>
      </div>

      <h2 className="mb-2 font-['display'] text-[22px]" style={{ color: 'var(--color-ink)' }}>
        Pick a room to start
      </h2>
      <p className="mb-6 max-w-xs text-center text-[14px] leading-relaxed" style={{ color: 'var(--color-ink-soft)' }}>
        Every message is translated into each person's own language, automatically.
      </p>

      <div className="flex items-center gap-2">
        {langs.map((l) => (
          <span
            key={l}
            className="rounded px-2 py-1 font-mono text-[11px] font-semibold"
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