import { useState } from 'react';
import { Search, Plus, Settings } from 'lucide-react';
import { CURRENT_USER, LANGUAGE_LABELS } from '../data/mockData';
import Avatar from './Avatar';
import Postmark from './Postmark';

function formatTime(date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

// Preview text is translated into the current user's language, falling
// back to the original if no translation exists for that pair — this
// mirrors the real per-recipient translation behavior.
function getPreview(room) {
  const last = room.messages[room.messages.length - 1];
  if (!last) return { text: '', unavailable: false };
  if (last.senderId === CURRENT_USER.id) return { text: last.text, unavailable: false };
  const translated = last.translations[CURRENT_USER.language];
  if (translated === undefined) return { text: last.text, unavailable: false };
  if (translated === null) return { text: last.text, unavailable: true };
  return { text: translated, unavailable: false };
}

export default function Sidebar({ rooms, activeId, onSelect, isOpen, onClose, onOpenProfile, onNewRoom }) {
  const [search, setSearch] = useState('');

  const filtered = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 w-72 flex flex-col transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'white', borderRight: '1px solid var(--color-fog-dim)' }}
      >
        <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5 mb-5">
            {/*<div
              className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: 'var(--color-bridge)', transform: 'rotate(-6deg)' }}
            >
              <span className="font-display text-[13px] font-600" style={{ color: 'var(--color-bridge)' }}>LB</span>
            </div>*/}
            <Postmark size={32} />
            <span className="font-display text-[16px] font-600 text-ink">LinguaBridge</span>
            <button
              onClick={onOpenProfile}
              className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              <Settings size={14} />
            </button>
          </div>

          {/*<div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg outline-none placeholder:text-gray-400 text-[color:var(--color-ink)]"
              style={{ background: 'var(--color-fog)', border: '1px solid var(--color-fog-dim)' }}
            />
          </div>*/}

          <div className="relative mb-3">
            {/* Search Icon */}
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg outline-none bg-fog border border-fog-dim text-ink"
            />
          </div>

          <button
            onClick={onNewRoom}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[12.5px] font-600 rounded-lg"
            style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
          >
            <Plus size={14} /> New room
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {filtered.map((room) => {
            const preview = getPreview(room);
            const last = room.messages[room.messages.length - 1];
            const isActive = room.id === activeId;

            return (
              <button
                key={room.id}
                onClick={() => { onSelect(room.id); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left mb-0.5 transition-all"
                style={{
                  background: isActive ? 'var(--color-bridge-dim)' : 'transparent',
                }}
              >
                <Avatar name={room.name} isGroup={room.isGroup} size={38} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className="text-[13px] font-600 truncate"
                      style={{ color: isActive ? 'var(--color-bridge)' : 'var(--color-ink)' }}
                    >
                      {room.name}
                    </span>
                    {last && (
                      <span className="font-mono text-[10.5px] text-gray-400 ml-2 shrink-0">
                        {formatTime(last.timestamp)}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[12px] truncate"
                    style={{ color: preview.unavailable ? 'var(--color-ink-soft)' : '#6B7573', fontStyle: preview.unavailable ? 'italic' : 'normal' }}
                  >
                    {preview.unavailable ? 'Translation unavailable' : preview.text}
                  </p>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-[12.5px] text-center mt-8" style={{ color: 'var(--color-ink-soft)' }}>
              No rooms match "{search}"
            </p>
          )}
        </div>

        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-fog-dim)' }}>
          <button onClick={onOpenProfile} className="w-full flex items-center gap-3 p-2 rounded-lg text-left">
            <Avatar name={CURRENT_USER.name} size={32} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-600 text-ink truncate">{CURRENT_USER.name}</p>
            </div>
            <span
              className="font-mono text-[10px] font-600 px-1.5 py-0.5 rounded"
              style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
            >
              {LANGUAGE_LABELS[CURRENT_USER.language]}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}