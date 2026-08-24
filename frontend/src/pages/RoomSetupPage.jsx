import { useState } from 'react';
import { ArrowLeft, Copy, Check, Users, MessageCircle } from 'lucide-react';
import { createRoom, joinRoom } from '../api/client';

export default function RoomSetupPage({ onBack, onRoomReady, onToast = () => {} }) {
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [roomName, setRoomName] = useState('');
  const isGroup = true;
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);
    try {
      const room = await createRoom(roomName.trim(), isGroup);
      const code = room.inviteCode || room.invite_code || room.code || 'N/A';
      setCreatedCode(code);
      setCreatedRoom(room);
      onToast(`Room "${room.name}" created!`);
    } catch (err) {
      onToast(err.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!createdCode) return;
    navigator.clipboard?.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (joinCode.trim().length !== 6) return;
    setJoining(true);
    setJoinError('');
    try {
      const room = await joinRoom(joinCode.trim().toUpperCase());
      onToast(`Joined ${room.name || 'room'}!`);
      onRoomReady(room); // Pass full room object to App
    } catch (err) {
      const errorMsg = err.message || 'Invalid room code';
      setJoinError(errorMsg);
      onToast(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  const tabStyle = (active) => ({
    background: active ? 'var(--color-bridge)' : 'transparent',
    color: active ? 'white' : 'var(--color-ink-soft)',
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-6" style={{ background: 'var(--color-fog)' }}>
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <h1 className="mb-1 text-[26px]" style={{ color: 'var(--color-ink)' }}>Start a room</h1>
        <p className="mb-6 text-[14px]" style={{ color: 'var(--color-ink-soft)' }}>
          Create a new room to invite others, or join one with a code.
        </p>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg p-1" style={{ background: 'var(--color-fog-dim)' }}>
          <button
            onClick={() => { setMode('create'); setCreatedCode(null); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[13px] font-semibold transition-all"
            style={tabStyle(mode === 'create')}
          >
            <Users size={14} /> Create room
          </button>
          <button
            onClick={() => { setMode('join'); setJoinError(''); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[13px] font-semibold transition-all"
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
              <p className="mb-3 text-[12px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-ink-soft)' }}>
                Room created — share this code
              </p>
              <div className="mb-4 font-mono text-[32px] font-semibold tracking-[0.3em]" style={{ color: 'var(--color-bridge)' }}>
                {createdCode}
              </div>
              <button
                onClick={handleCopy}
                className="mb-5 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold"
                style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy code'}
              </button>
              <button
                onClick={() => onRoomReady(createdRoom)}
                className="w-full rounded-lg py-2.5 text-[14px] font-semibold text-white"
                style={{ background: 'var(--color-ink)' }}
              >
                Go to room
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>
                  Room name
                </label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Project Team, Family Chat"
                  className="w-full rounded-lg bg-white px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-gray-400"
                  style={{ border: '1px solid #D5DAD8' }}
                  disabled={creating}
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--color-bridge)' }}
              >
                {creating ? 'Creating...' : 'Create room'}
              </button>
            </form>
          )
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>
                Room code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                placeholder="ABC123"
                maxLength={6}
                disabled={joining}
                className="w-full rounded-lg bg-white px-3.5 py-2.5 text-center font-mono text-[16px] tracking-[0.2em] text-gray-900 outline-none placeholder:text-gray-300"
                style={{ border: '1px solid #D5DAD8' }}
              />
              {joinError && (
                <p className="mt-1.5 text-[12px]" style={{ color: 'var(--color-confidence-low)' }}>
                  {joinError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={joining || joinCode.length !== 6}
              className="w-full rounded-lg py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--color-bridge)' }}
            >
              {joining ? 'Joining...' : 'Join room'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}