import { Menu } from 'lucide-react';
import { CURRENT_USER, LANGUAGE_LABELS } from '../data/mockData';
import Avatar from './Avatar';

export default function ChatHeader({ room, onMenuOpen }) {
  const others = room.members.filter((m) => m.id !== CURRENT_USER.id);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ background: 'white', borderBottom: '1px solid var(--color-fog-dim)' }}
    >
      <button
        onClick={onMenuOpen}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg"
        style={{ color: 'var(--color-ink-soft)' }}
      >
        <Menu size={18} />
      </button>

      <Avatar name={room.name} isGroup={room.isGroup} size={36} />

      <div className="flex-1 min-w-0">
        <h2 className="text-[14px] font-600 truncate" style={{ color: 'var(--color-ink)' }}>
          {room.name}
        </h2>
        <p className="text-[12px]" style={{ color: room.isOnline ? 'var(--color-bridge)' : 'var(--color-ink-soft)' }}>
          {room.isGroup ? `${room.members.length} members` : room.isOnline ? 'Online' : 'Offline'}
        </p>
      </div>

      {/* Language badges — shows every language this message will need
          to be translated into, since that's the thing users of this
          product actually want to see at a glance. */}
      <div className="flex items-center -space-x-1">
        {[...new Set(others.map((m) => m.language))].map((lang) => (
          <span
            key={lang}
            className="font-mono text-[10px] font-600 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
            style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
            title={LANGUAGE_LABELS[lang]}
          >
            {LANGUAGE_LABELS[lang]}
          </span>
        ))}
      </div>
    </div>
  );
}