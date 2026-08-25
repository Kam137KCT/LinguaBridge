import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import Postmark from '../components/Postmark';
import { login } from '../api/client';

function PostcardStack() {
  const cards = [
    { lang: 'NE', text: 'नमस्ते! भोलि भेटौं?', sub: 'Hello! Shall we meet tomorrow?', rotate: -3 },
    { lang: 'FR', text: 'Avec plaisir !', sub: 'With pleasure!', rotate: 2 },
    { lang: 'ES', text: 'Nos vemos mañana', sub: 'See you tomorrow', rotate: -1.5 },
  ];
  return (
    <div className="relative w-full max-w-xs" style={{ height: 200 }}>
      {cards.map((c, i) => (
        <div
          key={c.lang}
          className="absolute inset-x-0 rounded-lg p-4 shadow-lg"
          style={{ top: i * 26, background: 'var(--color-fog)', transform: `rotate(${c.rotate}deg)`, zIndex: i }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-['display'] text-[15px] leading-snug text-(--color-ink)">{c.text}</p>
            <span
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
              style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
            >
              {c.lang}
            </span>
          </div>
          <p className="mt-1 text-[12px] italic" style={{ color: 'var(--color-ink-soft)' }}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

export default function LoginPage({ onLogin, onGoRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      <div
        className="relative hidden flex-1 flex-col items-center justify-center px-16 lg:flex"
        style={{ background: 'var(--color-ink)' }}
      >
        <div className="mb-14 flex items-center gap-3 self-start">
          <Postmark />
          <span className="font-['display'] text-2xl tracking-tight text-white">LinguaBridge</span>
        </div>
        <PostcardStack />
        <h2 className="mt-14 mb-3 text-center font-['display'] text-[26px] leading-tight text-white">
          Every message, delivered<br />in their language
        </h2>
        <p className="max-w-xs text-center text-[14px] leading-relaxed" style={{ color: '#AEB9CC' }}>
          Nepali, French, Spanish, and English — translated the moment it arrives.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-8" style={{ background: 'var(--color-fog)' }}>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Postmark size={32} />
            <span className="font-['display'] text-lg text-(--color-ink)">LinguaBridge</span>
          </div>

          <h1 className="mb-1 font-['display'] text-[28px] text-(--color-ink)">Welcome back</h1>
          <p className="mb-8 text-[14px]" style={{ color: 'var(--color-ink-soft)' }}>
            Sign in to keep the conversation going
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>
                Username or email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username or you@example.com"
                className="w-full rounded-lg bg-white px-3.5 py-2.5 text-[13.5px] text-(--color-ink) transition-all outline-none placeholder:text-gray-400"
                style={{ border: '1px solid #D5DAD8' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-bridge)')}
                onBlur={(e) => (e.target.style.borderColor = '#D5DAD8')}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white px-3.5 py-2.5 pr-10 text-[13.5px] text-(--color-ink) outline-none placeholder:text-gray-400"
                  style={{ border: '1px solid #D5DAD8' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-bridge)')}
                  onBlur={(e) => (e.target.style.borderColor = '#D5DAD8')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold text-white transition-all disabled:opacity-70"
              style={{ background: 'var(--color-bridge)' }}
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>
            Don't have an account?{' '}
            <button onClick={onGoRegister} className="font-semibold" style={{ color: 'var(--color-bridge)' }}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}