import { Menu } from 'lucide-react';
import { LANGUAGE_LABELS } from '../data/mockData';
import Avatar from './Avatar';

export default function ChatHeader({ room, currentUser, onMenuOpen }) {
  const membersList = room.members || [];
  const others = membersList.filter((m) => m.id !== currentUser.id);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{ background: 'white', borderBottom: '1px solid var(--color-fog-dim)' }}
    >
      <button
        onClick={onMenuOpen}
        className="flex size-8 items-center justify-center rounded-lg lg:hidden"
        style={{ color: 'var(--color-ink-soft)' }}
      >
        <Menu size={18} />
      </button>

      <Avatar name={room.name} isGroup={room.isGroup} size={36} />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[14px] font-semibold" style={{ color: 'var(--color-ink)' }}>
          {room.name}
        </h2>
        <p className="text-[12px]" style={{ color: room.isOnline ? 'var(--color-bridge)' : 'var(--color-ink-soft)' }}>
          {room.isGroup ? `${membersList.length} members` : room.isOnline ? 'Online' : 'Offline'}
        </p>
      </div>

      <div className="flex items-center -space-x-1">
        {[...new Set(others.map((m) => m.language))].map((lang) => (
          <span
            key={lang}
            className="flex size-6 items-center justify-center rounded-full border-2 border-white font-mono text-[10px] font-semibold"
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