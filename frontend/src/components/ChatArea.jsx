import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useChatSocket } from '../hooks/useChatSocket';

function DateSeparator({ label }) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1" style={{ background: 'var(--color-fog-dim)' }} />
      <span className="px-2 font-mono text-[10.5px]" style={{ color: 'var(--color-ink-soft)' }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: 'var(--color-fog-dim)' }} />
    </div>
  );
}

function ConnectionBanner({ state }) {
  if (state === 'open') return null;
  const labels = {
    connecting: 'Connecting...',
    closed: 'Disconnected — messages will not send',
    error: 'Connection error — messages will not send',
  };
  return (
    <div
      className="py-1.5 text-center text-[12px] font-medium"
      style={{ background: 'var(--color-marigold-dim)', color: 'var(--color-marigold)' }}
    >
      {labels[state]}
    </div>
  );
}

function groupByDate(msgs) {
  const map = new Map();
  const now = new Date();
  for (const msg of msgs) {
    const dateObj = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
    const diff = Math.floor((now - dateObj) / 86400000);
    const label =
      diff === 0
        ? 'Today'
        : diff === 1
        ? 'Yesterday'
        : dateObj.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    if (!map.has(label)) map.set(label, []);
    map.get(label).push({ ...msg, timestamp: dateObj });
  }
  return Array.from(map.entries()).map(([label, msgs]) => ({ label, msgs }));
}

export default function ChatArea({ room, currentUser, onMenuOpen, onToast }) {
  const { messages, historyLoaded, connectionState, sendMessage } = useChatSocket(room.id);
  const bottomRef = useRef(null);
  const prevCount = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > prevCount.current && prevCount.current > 0) {
      const last = messages[messages.length - 1];
      if (last.senderId !== currentUser.id) onToast(`New message from ${last.senderName}`);
    }
    prevCount.current = messages.length;
  }, [messages, currentUser.id, onToast]);

  const handleSend = (text) => {
    sendMessage(text);
  };

  const grouped = groupByDate(messages);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col" style={{ background: 'var(--color-fog)' }}>
      <ChatHeader room={room} currentUser={currentUser} onMenuOpen={onMenuOpen} />
      <ConnectionBanner state={connectionState} />

      <div className="flex-1 overflow-y-auto p-4">
        {!historyLoaded && (
          <p className="mt-4 text-center text-[12.5px]" style={{ color: 'var(--color-ink-soft)' }}>
            Loading messages...
          </p>
        )}
        {grouped.map(({ label, msgs }) => (
          <div key={label}>
            <DateSeparator label={label} />
            {msgs.map((msg, i) => {
              const prev = msgs[i - 1];
              const showAvatar = !prev || prev.senderId !== msg.senderId;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  senderName={msg.senderName}
                  showAvatar={showAvatar}
                  showName={showAvatar}
                  isGroup={room.isGroup}
                  currentUser={currentUser}
                />
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}