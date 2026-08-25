import { useState } from 'react';
import { Search, Plus, Settings } from 'lucide-react';
import { LANGUAGE_LABELS } from '../data/mockData';
import Avatar from './Avatar';
import Postmark from './Postmark';

function formatTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function getPreview(room, currentUserId, currentUserLang) {
  if (!room?.messages) return { text: '', unavailable: false };
  const last = room.messages[room.messages.length - 1];
  if (!last) return { text: '', unavailable: false };
  if (last.senderId === currentUserId) return { text: last.text, unavailable: false };

  const translations = last.translations || {};
  const translated = translations[currentUserLang];
  if (translated === undefined) return { text: last.text, unavailable: false };
  if (translated === null) return { text: last.text, unavailable: true };
  return { text: translated, unavailable: false };
}

export default function Sidebar({ rooms, loading, activeId, currentUser, onSelect, isOpen, onClose, onOpenProfile, onNewRoom }) {
  const [search, setSearch] = useState('');
  const filtered = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
  const userLang = currentUser?.preferred_language ?? 'en';
  const displayName = currentUser?.username ?? 'User';

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-20 bg-black/20 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 transform flex-col transition-transform duration-200 ease-in-out lg:relative
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: 'white', borderRight: '1px solid var(--color-fog-dim)' }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="mb-5 flex items-center gap-2.5">
            <Postmark size={32} />
            <span className="text-[16px] font-semibold" style={{ color: 'var(--color-ink)' }}>LinguaBridge</span>
            <button
              onClick={onOpenProfile}
              className="ml-auto flex size-7 items-center justify-center rounded-lg"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              <Settings size={14} />
            </button>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg py-2 pr-3 pl-9 text-[13px] outline-none"
              style={{ background: 'var(--color-fog)', border: '1px solid var(--color-fog-dim)', color: 'var(--color-ink)' }}
            />
          </div>

          <button
            onClick={onNewRoom}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold"
            style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
          >
            <Plus size={14} /> New room
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {loading && (
            <p className="mt-6 text-center text-[12.5px]" style={{ color: 'var(--color-ink-soft)' }}>
              Loading rooms...
            </p>
          )}

          {!loading && filtered.map((room) => {
            const preview = getPreview(room, currentUser?.id, userLang);
            const messages = room.messages || [];
            const last = messages[messages.length - 1];
            const isActive = room.id === activeId;

            return (
              <button
                key={room.id}
                onClick={() => { onSelect(room.id); onClose(); }}
                className="mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all"
                style={{ background: isActive ? 'var(--color-bridge-dim)' : 'transparent' }}
              >
                <Avatar name={room.name} isGroup={room.isGroup} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span
                      className="truncate text-[13px] font-semibold"
                      style={{ color: isActive ? 'var(--color-bridge)' : 'var(--color-ink)' }}
                    >
                      {room.name}
                    </span>
                    {last && (
                      <span className="ml-2 shrink-0 font-mono text-[10.5px] text-gray-400">
                        {formatTime(last.timestamp)}
                      </span>
                    )}
                  </div>
                  <p
                    className="truncate text-[12px]"
                    style={{ color: preview.unavailable ? 'var(--color-ink-soft)' : '#6B7573', fontStyle: preview.unavailable ? 'italic' : 'normal' }}
                  >
                    {preview.unavailable ? 'Translation unavailable' : preview.text}
                  </p>
                </div>
              </button>
            );
          })}

          {!loading && filtered.length === 0 && (
            <p className="mt-8 text-center text-[12.5px]" style={{ color: 'var(--color-ink-soft)' }}>
              No rooms match "{search}"
            </p>
          )}
        </div>

        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--color-fog-dim)' }}>
          <button onClick={onOpenProfile} className="flex w-full items-center gap-3 rounded-lg p-2 text-left">
            <Avatar name={displayName} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold" style={{ color: 'var(--color-ink)' }}>{displayName}</p>
            </div>
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
              style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
            >
              {LANGUAGE_LABELS[userLang] || userLang}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}