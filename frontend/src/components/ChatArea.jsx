import { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { useChatSocket } from '../hooks/useChatSocket';
import { DEV_CURRENT_USER_ID } from '../config/devConfig';

function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: 'var(--color-fog-dim)' }} />
      <span className="font-mono text-[10.5px] px-2" style={{ color: 'var(--color-ink-soft)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-fog-dim)' }} />
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
    <div className="text-center text-[12px] font-500 py-1.5" style={{ background: 'var(--color-marigold-dim)', color: 'var(--color-marigold)' }}>
      {labels[state]}
    </div>
  );
}

// function groupByDate(msgs) {
//   const map = new Map();
//   const now = new Date();
//   for (const msg of msgs) {
//     const diff = Math.floor((now - msg.timestamp) / 86400000);
//     const label = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday'
//       : msg.timestamp.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
//     if (!map.has(label)) map.set(label, []);
//     map.get(label).push(msg);
//   }
//   return Array.from(map.entries()).map(([label, msgs]) => ({ label, msgs }));
// }

function groupByDate(msgs) {
  const map = new Map();
  const now = new Date();
  for (const msg of msgs) {
    // Explicitly normalize string instances to valid Date objects
    const dateObj = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
    
    const diff = Math.floor((now - dateObj) / 86400000);
    const label = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday'
      : dateObj.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      
    if (!map.has(label)) map.set(label, []);
    // Reassign the clean Date object so child elements inherit it safely
    map.get(label).push({ ...msg, timestamp: dateObj });
  }
  return Array.from(map.entries()).map(([label, msgs]) => ({ label, msgs }));
}

export default function ChatArea({ room, onMenuOpen, onToast }) {
  // Real room id now, not the old hardcoded DEV_ROOM_ID.
  const { messages, historyLoaded, connectionState, sendMessage } = useChatSocket(room.id, DEV_CURRENT_USER_ID);
  const bottomRef = useRef(null);
  const prevCount = useRef(0);
  //const [messages, setMessages] = useState([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > prevCount.current && prevCount.current > 0) {
      const last = messages[messages.length - 1];
      if (last.senderId !== DEV_CURRENT_USER_ID) onToast(`New message from ${last.senderName}`);
    }
    prevCount.current = messages.length;
  }, [messages]);

  const handleSend = (text) => {
    sendMessage(text);
  };

  const grouped = groupByDate(messages);

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0" style={{ background: 'var(--color-fog)' }}>
      <ChatHeader room={room} onMenuOpen={onMenuOpen} />
      <ConnectionBanner state={connectionState} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!historyLoaded && (
          <p className="text-center text-[12.5px] mt-4" style={{ color: 'var(--color-ink-soft)' }}>
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