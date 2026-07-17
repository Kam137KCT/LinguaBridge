import { useEffect, useRef, useState } from 'react';
import { CURRENT_USER } from '../data/mockData';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: 'var(--color-fog-dim)' }} />
      <span className="font-mono text-[10.5px] px-2" style={{ color: 'var(--color-ink-soft)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-fog-dim)' }} />
    </div>
  );
}

function TypingIndicator({ name }) {
  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: 'var(--color-fog-dim)' }} />
      <div className="flex flex-col items-start">
        <p className="text-[11px] mb-1 ml-1" style={{ color: 'var(--color-ink-soft)' }}>{name}</p>
        <div
          className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
          style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}
        >
          <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function groupByDate(msgs) {
  const map = new Map();
  const now = new Date();
  for (const msg of msgs) {
    const diff = Math.floor((now - msg.timestamp) / 86400000);
    const label = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday'
      : msg.timestamp.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    if (!map.has(label)) map.set(label, []);
    map.get(label).push(msg);
  }
  return Array.from(map.entries()).map(([label, msgs]) => ({ label, msgs }));
}

// Placeholder client-side simulation — replaced by the real WebSocket
// flow in Milestone 5. Deliberately naive: no real translation logic
// belongs on the frontend.
function simulateReply(room) {
  const other = room.members.find((m) => m.id !== CURRENT_USER.id);
  if (!other) return null;
  return {
    id: `reply-${Date.now()}`,
    senderId: other.id,
    text: '[reply]',
    translations: { [CURRENT_USER.language]: 'Got it, thanks!' },
    originalLang: other.language,
    timestamp: new Date(),
    confidence: { [CURRENT_USER.language]: 'high' },
  };
}

export default function ChatArea({ room, onMenuOpen, onToast }) {
  const [messages, setMessages] = useState(room.messages);
  const [showTyping, setShowTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(room.messages);
    setShowTyping(false);
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  const handleSend = (text) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: CURRENT_USER.id,
      text,
      translations: {},
      originalLang: CURRENT_USER.language,
      timestamp: new Date(),
      confidence: {},
    };
    setMessages((prev) => [...prev, newMsg]);
    onToast('Message sent');

    setTimeout(() => setShowTyping(true), 700);
    setTimeout(() => {
      setShowTyping(false);
      const reply = simulateReply(room);
      if (reply) {
        setMessages((prev) => [...prev, reply]);
        onToast('New message received');
      }
    }, 2400);
  };

  const grouped = groupByDate(messages);
  const otherMember = room.members.find((m) => m.id !== CURRENT_USER.id);

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--color-fog)' }}>
      <ChatHeader room={room} onMenuOpen={onMenuOpen} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {grouped.map(({ label, msgs }) => (
          <div key={label}>
            <DateSeparator label={label} />
            {msgs.map((msg, i) => {
              const prev = msgs[i - 1];
              const showAvatar = !prev || prev.senderId !== msg.senderId;
              const sender = room.members.find((m) => m.id === msg.senderId);
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  senderName={sender?.name}
                  showAvatar={showAvatar}
                  showName={showAvatar}
                  isGroup={room.isGroup}
                />
              );
            })}
          </div>
        ))}

        {showTyping && otherMember && <TypingIndicator name={otherMember.name.split(' ')[0]} />}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}