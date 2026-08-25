import { useState, useRef, useCallback } from 'react';
import { Smile, Send } from 'lucide-react';

const EMOJIS = ['😊', '❤️', '👍', '😂', '🎉', '🔥', '✅', '👋', '🙌', '💯', '🤝', '😍'];

export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [text, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div className="px-4 py-3" style={{ background: 'white', borderTop: '1px solid var(--color-fog-dim)' }}>
      {showEmoji && (
        <div
          className="mb-2 rounded-xl p-3 shadow-lg"
          style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}
        >
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { setText((t) => t + e); setShowEmoji(false); }}
                className="text-xl transition-transform hover:scale-125"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ color: showEmoji ? 'var(--color-bridge)' : 'var(--color-ink-soft)', background: showEmoji ? 'var(--color-bridge-dim)' : 'transparent' }}
        >
          <Smile size={18} />
        </button>

        <div
          className="flex flex-1 items-end rounded-2xl"
          style={{ background: 'var(--color-fog)', border: '1px solid var(--color-fog-dim)' }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            rows={1}
            className="max-h-30 flex-1 resize-none bg-transparent px-4 py-2.5 text-[13.5px] leading-relaxed outline-none placeholder:text-gray-400"
            style={{ color: 'var(--color-ink)' }}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg transition-all"
          style={{
            background: text.trim() ? 'var(--color-bridge)' : 'var(--color-fog-dim)',
            color: text.trim() ? 'white' : '#A9B2AF',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}