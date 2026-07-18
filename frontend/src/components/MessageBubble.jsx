import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LANGUAGE_LABELS } from '../data/mockData';
import { DEV_CURRENT_USER_ID, DEV_CURRENT_USER_LANGUAGE } from '../config/devConfig';

const CONFIDENCE_STYLES = {
  high: { color: 'var(--color-confidence-high)', bg: 'var(--color-confidence-high-bg)', label: 'High' },
  medium: { color: 'var(--color-confidence-medium)', bg: 'var(--color-confidence-medium-bg)', label: 'Medium' },
  low: { color: 'var(--color-confidence-low)', bg: 'var(--color-confidence-low-bg)', label: 'Low' },
};

// The confidence badge is styled as a small rotated "stamp" sitting on
// the dashed seam between translated and original text — the page's
// signature element, reused at bubble scale.
function ConfidenceStamp({ level }) {
  const s = CONFIDENCE_STYLES[level];
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[10px] font-600 px-1.5 py-0.5 rounded"
      style={{ background: s.bg, color: s.color, transform: 'rotate(-2deg)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message: m, senderName, showAvatar, showName, isGroup }) {
  const [showOriginal, setShowOriginal] = useState(false);
  const isOwn = m.senderId === DEV_CURRENT_USER_ID;

  if (isOwn) {
    return (
      <div className="flex items-end gap-2 flex-row-reverse mb-1.5 animate-message-in">
        <div className="w-7 shrink-0" />
        <div className="max-w-[72%] flex flex-col items-end">
          <div
            className="px-3.5 py-2.5 rounded-2xl rounded-br-sm text-[13.5px] leading-relaxed text-white"
            style={{ background: 'var(--color-ink)' }}
          >
            <p className="whitespace-pre-wrap-break-word">{m.text}</p>
          </div>
          <span className="font-mono text-[10px] text-gray-400 mt-1 px-1">{formatTime(m.timestamp)}</span>
        </div>
      </div>
    );
  }

  // Incoming message — resolve translation state for the current user's language.
  const translated = m.translations[DEV_CURRENT_USER_LANGUAGE];
  const isUnavailable = translated === null;
  const displayText = isUnavailable ? m.text : (translated ?? m.text);
  const hasTranslation = translated !== undefined && translated !== null;
  const confidence = m.confidence?.[DEV_CURRENT_USER_LANGUAGE];

  return (
    <div className="flex items-end gap-2 mb-1.5 animate-message-in">
      <div className="w-7 shrink-0">
        {showAvatar && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-display text-[11px] font-600 text-white"
            style={{ background: 'var(--color-ink-soft)' }}
          >
            {senderName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      <div className="max-w-[72%] flex flex-col items-start min-w-0">
        {showName && isGroup && (
          <p className="text-[11px] font-600 mb-1 ml-1" style={{ color: 'var(--color-ink-soft)' }}>
            {senderName}
            <span className="font-mono ml-1.5 text-[10px] font-400 opacity-70">
              · {LANGUAGE_LABELS[m.originalLang]}
            </span>
          </p>
        )}

        <div
          className="relative px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-[13.5px] leading-relaxed"
          style={
            isUnavailable
              ? { background: 'white', border: '1.5px dashed #C6CDCB', color: 'var(--color-ink)' }
              : { background: 'white', color: 'var(--color-ink)', border: '1px solid var(--color-fog-dim)' }
          }
        >
          <p className="whitespace-pre-wrap wrap-break-words">{displayText}</p>

          {isUnavailable && (
            <p className="text-[11px] italic mt-1.5" style={{ color: 'var(--color-ink-soft)' }}>
              Translation unavailable
            </p>
          )}

          {hasTranslation && (
            <div className="mt-2 pt-2" style={{ borderTop: '1.5px dashed #D5DAD8' }}>
              {showOriginal && (
                <p className="text-[12px] italic mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>
                  {m.text}
                </p>
              )}
              <div className="flex items-center gap-2">
                {confidence && <ConfidenceStamp level={confidence} />}
                <button
                  onClick={() => setShowOriginal((v) => !v)}
                  className="text-[10.5px] font-600 flex items-center gap-0.5 rounded px-1.5 py-0.5"
                  style={{ color: 'var(--color-ink-soft)' }}
                >
                  <ChevronDown size={10} className={`transition-transform ${showOriginal ? 'rotate-180' : ''}`} />
                  {showOriginal ? 'Hide original' : `Show original (${LANGUAGE_LABELS[m.originalLang]})`}
                </button>
              </div>
            </div>
          )}
        </div>

        <span className="font-mono text-[10px] text-gray-400 mt-1 px-1">{formatTime(m.timestamp)}</span>
      </div>
    </div>
  );
}