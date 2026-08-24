import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LANGUAGE_LABELS } from '../data/mockData';

const CONFIDENCE_STYLES = {
  high: {
    color: 'var(--color-confidence-high)',
    bg: 'var(--color-confidence-high-bg)',
    label: 'High',
  },
  medium: {
    color: 'var(--color-confidence-medium)',
    bg: 'var(--color-confidence-medium-bg)',
    label: 'Medium',
  },
  low: {
    color: 'var(--color-confidence-low)',
    bg: 'var(--color-confidence-low-bg)',
    label: 'Low',
  },
};

function ConfidenceStamp({ level }) {
  const style = CONFIDENCE_STYLES[level];

  if (!style) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
      style={{
        background: style.bg,
        color: style.color,
        transform: 'rotate(-2deg)',
      }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: style.color }}
      />
      {style.label}
    </span>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageBubble({
  message: m,
  senderName,
  showAvatar,
  showName,
  isGroup,
  currentUser,
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  const isOwn = m.senderId === currentUser.id;
  const userLang =
    currentUser.preferred_language ?? currentUser.language;

  if (isOwn) {
    return (
      <div className="mb-1.5 flex flex-row-reverse items-end gap-2">
        <div className="w-7 shrink-0" />

        <div className="flex max-w-[72%] flex-col items-end">
          <div
            className="rounded-2xl rounded-br-sm px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white"
            style={{ background: 'var(--color-ink)' }}
          >
            <p className="wrap-break-word whitespace-pre-wrap">
              {m.text}
            </p>
          </div>

          <span className="mt-1 px-1 font-mono text-[10px] text-gray-400">
            {formatTime(m.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  const translated = m.translations?.[userLang];
  const isUnavailable = translated === null;
  const displayText = isUnavailable ? m.text : (translated ?? m.text);
  const hasTranslation =
    translated !== undefined && translated !== null;
  const confidence = m.confidence?.[userLang];

  return (
    <div className="mb-1.5 flex items-end gap-2">
      <div className="w-7 shrink-0">
        {showAvatar && (
          <div
            className="flex size-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ background: 'var(--color-ink-soft)' }}
          >
            {senderName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      <div className="flex max-w-[72%] min-w-0 flex-col items-start">
        {showName && isGroup && (
          <p
            className="mb-1 ml-1 text-[11px] font-semibold"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            {senderName}

            <span className="ml-1.5 font-mono text-[10px] font-normal opacity-70">
              · {LANGUAGE_LABELS[m.originalLang]}
            </span>
          </p>
        )}

        <div
          className="relative rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[13.5px] leading-relaxed"
          style={
            isUnavailable
              ? {
                  background: 'white',
                  border: '1.5px dashed #C6CDCB',
                  color: 'var(--color-ink)',
                }
              : {
                  background: 'white',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-fog-dim)',
                }
          }
        >
          <p className="wrap-break-word whitespace-pre-wrap">
            {displayText}
          </p>

          {isUnavailable && (
            <p
              className="mt-1.5 text-[11px] italic"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              Translation unavailable
            </p>
          )}

          {hasTranslation && (
            <div
              className="mt-2 flex items-center gap-2 pt-2"
              style={{ borderTop: '1.5px dashed #D5DAD8' }}
            >
              {showOriginal && (
                <p
                  className="mb-1.5 text-[12px] italic"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  {m.text}
                </p>
              )}

              <div className="flex items-center gap-2">
                {confidence && <ConfidenceStamp level={confidence} />}

                <button
                  type="button"
                  onClick={() => setShowOriginal((value) => !value)}
                  className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10.5px] font-semibold"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  <ChevronDown
                    size={10}
                    className={`transition-transform ${
                      showOriginal ? 'rotate-180' : ''
                    }`}
                  />

                  {showOriginal
                    ? 'Hide original'
                    : `Show original (${LANGUAGE_LABELS[m.originalLang]})`}
                </button>
              </div>
            </div>
          )}
        </div>

        <span className="mt-1 px-1 font-mono text-[10px] text-gray-400">
          {formatTime(m.timestamp)}
        </span>
      </div>
    </div>
  );
}