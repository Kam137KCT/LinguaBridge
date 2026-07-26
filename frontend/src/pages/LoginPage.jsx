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
            <p className="font-display text-[15px] text-ink leading-snug">{c.text}</p>
            <span
              className="font-mono text-[10px] font-600 px-1.5 py-0.5 rounded shrink-0"
              style={{ background: 'var(--color-bridge-dim)', color: 'var(--color-bridge)' }}
            >
              {c.lang}
            </span>
          </div>
          <p className="text-[12px] italic mt-1" style={{ color: 'var(--color-ink-soft)' }}>{c.sub}</p>
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
      // login() already saves tokens under the correct keys internally
      // and returns just the user object — no manual localStorage here.
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div
        className="hidden lg:flex flex-1 flex-col items-center justify-center px-16 relative"
        style={{ background: 'var(--color-ink)' }}
      >
        <div className="flex items-center gap-3 mb-14 self-start">
          <Postmark />
          <span className="font-display text-2xl text-white tracking-tight">LinguaBridge</span>
        </div>
        <PostcardStack />
        <h2 className="font-display text-[26px] text-white text-center mt-14 mb-3 leading-tight">
          Every message, delivered<br />in their language
        </h2>
        <p className="text-[14px] text-center max-w-xs leading-relaxed" style={{ color: '#AEB9CC' }}>
          Nepali, French, Spanish, and English — translated the moment it arrives.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-8" style={{ background: 'var(--color-fog)' }}>
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Postmark size={32} />
            <span className="font-display text-lg text-ink">LinguaBridge</span>
          </div>

          <h1 className="font-display text-[28px] text-ink mb-1">Welcome back</h1>
          <p className="text-[14px] mb-8" style={{ color: 'var(--color-ink-soft)' }}>
            Sign in to keep the conversation going
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-[13px] bg-red-50 text-red-600 border border-red-200 flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>
                Username or email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username or you@example.com"
                className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg outline-none bg-white text-ink placeholder:text-gray-400 transition-all"
                style={{ border: '1px solid #D5DAD8' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-bridge)')}
                onBlur={(e) => (e.target.style.borderColor = '#D5DAD8')}
              />
            </div>

            <div>
              <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-[13.5px] rounded-lg outline-none bg-white text-ink placeholder:text-gray-400"
                  style={{ border: '1px solid #D5DAD8' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-bridge)')}
                  onBlur={(e) => (e.target.style.borderColor = '#D5DAD8')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-white text-[14px] font-600 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: 'var(--color-bridge)' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-[13px] text-center mt-6" style={{ color: 'var(--color-ink-soft)' }}>
            Don't have an account?{' '}
            <button onClick={onGoRegister} className="font-600" style={{ color: 'var(--color-bridge)' }}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}