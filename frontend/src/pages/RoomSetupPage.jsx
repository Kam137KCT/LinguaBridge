import { useState } from 'react';
import { ArrowLeft, Copy, Check, Users, MessageCircle } from 'lucide-react';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function RoomSetupPage({ onBack, onRoomReady }) {
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreatedCode(generateRoomCode());
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setJoinError('Room codes are 6 characters.');
      return;
    }
    setJoinError('');
    onRoomReady({ name: `Room ${code}`, isGroup: true });
  };

  const tabStyle = (active) => ({
    background: active ? 'var(--color-bridge)' : 'transparent',
    color: active ? 'white' : 'var(--color-ink-soft)',
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--color-fog)' }}>
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-500 mb-6"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <h1 className="font-display text-[26px] text-[color:var(--color-ink)] mb-1">Start a room</h1>
        <p className="text-[14px] mb-6" style={{ color: 'var(--color-ink-soft)' }}>
          Create a new room to invite others, or join one with a code.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg mb-6" style={{ background: 'var(--color-fog-dim)' }}>
          <button
            onClick={() => { setMode('create'); setCreatedCode(null); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[13px] font-600 transition-all"
            style={tabStyle(mode === 'create')}
          >
            <Users size={14} /> Create room
          </button>
          <button
            onClick={() => { setMode('join'); setJoinError(''); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[13px] font-600 transition-all"
            style={tabStyle(mode === 'join')}
          >
            <MessageCircle size={14} /> Join room
          </button>
        </div>

        {mode === 'create' && (
          createdCode ? (
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: 'white', border: '2px dashed var(--color-bridge)' }}
            >
              <p className="text-[12px] font-600 uppercase tracking-wider mb-3" style={{ color: 'var(--color-ink-soft)' }}>
                Room created — share this code
              </p>
              <div className="font-mono text-[32px] font-600 tracking-[0.3em] mb-4" style={{ color: 'var(--color-bridge)' }}>
                {createdCode}
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-600 mb-5"
                style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy code'}
              </button>
              <button
                onClick={() => onRoomReady({ name: roomName, isGroup: true })}
                className="w-full py-2.5 text-white text-[14px] font-600 rounded-lg"
                style={{ background: 'var(--color-ink)' }}
              >
                Go to room
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>
                  Room name
                </label>
                <input
                  type="text" required value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Project Team, Family Chat"
                  className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg outline-none bg-white text-[color:var(--color-ink)] placeholder:text-gray-400"
                  style={{ border: '1px solid #D5DAD8' }}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-white text-[14px] font-600 rounded-lg"
                style={{ background: 'var(--color-bridge)' }}
              >
                Create room
              </button>
            </form>
          )
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>
                Room code
              </label>
              <input
                type="text" value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="w-full px-3.5 py-2.5 text-[16px] font-mono tracking-[0.2em] rounded-lg outline-none bg-white text-[color:var(--color-ink)] placeholder:text-gray-300 text-center"
                style={{ border: '1px solid #D5DAD8' }}
              />
              {joinError && (
                <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-confidence-low)' }}>{joinError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-white text-[14px] font-600 rounded-lg"
              style={{ background: 'var(--color-bridge)' }}
            >
              Join room
            </button>
          </form>
        )}
      </div>
    </div>
  );
}