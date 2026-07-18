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
          className="mb-2 p-3 rounded-xl shadow-lg"
          style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}
        >
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => { setText((t) => t + e); setShowEmoji(false); }}
                className="text-xl hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="w-9 h-9 mb-0.5 flex items-center justify-center rounded-lg shrink-0"
          style={{ color: showEmoji ? 'var(--color-bridge)' : 'var(--color-ink-soft)', background: showEmoji ? 'var(--color-bridge-dim)' : 'transparent' }}
        >
          <Smile size={18} />
        </button>

        <div
          className="flex-1 flex items-end rounded-2xl"
          style={{ background: 'var(--color-fog)', border: '1px solid var(--color-fog-dim)' }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Write a message..."
            rows={1}
            className="flex-1 px-4 py-2.5 bg-transparent resize-none outline-none text-[13.5px] placeholder:text-gray-400 max-h-30 leading-relaxed"
            style={{ color: 'var(--color-ink)' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-9 h-9 mb-0.5 flex items-center justify-center rounded-lg shrink-0 transition-all"
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