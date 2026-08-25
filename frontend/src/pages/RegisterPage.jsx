import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { LANGUAGE_NAMES } from '../data/mockData';
import Postmark from '../components/Postmark';
import { register, login } from '../api/client';

const LANGUAGES = ['en', 'ne', 'fr', 'es'];

export default function RegisterPage({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '', language: 'en',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError('');

    const [firstName, ...rest] = form.fullName.trim().split(' ');
    const lastName = rest.join(' ');

    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        firstName,
        lastName,
        preferredLanguage: form.language,
      });
      const user = await login(form.username, form.password);
      onRegister(user);
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setLoading(false);
    }
  };

  const inputStyle = {
    border: '1px solid #D5DAD8',
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left panel */}
      <div
        className="hidden flex-1 flex-col items-center justify-center px-16 lg:flex"
        style={{ background: 'var(--color-ink)' }}
      >
        <div className="mb-14 flex items-center gap-3 self-start">
          <Postmark />
          <span className="font-['display'] text-2xl tracking-tight text-white">LinguaBridge</span>
        </div>

        <div className="mb-14 w-full max-w-xs space-y-3">
          {LANGUAGES.map((l) => (
            <div
              key={l}
              className="flex items-center gap-3 rounded-lg px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.25)' }}
            >
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold"
                style={{ background: 'var(--color-bridge)', color: 'white' }}
              >
                {l.toUpperCase()}
              </span>
              <span className="text-[13px] text-white">{LANGUAGE_NAMES[l]}</span>
            </div>
          ))}
        </div>

        <h2 className="mb-2 text-center font-['display'] text-[24px] text-white">Pick your language once.</h2>
        <p className="max-w-xs text-center text-[14px] leading-relaxed" style={{ color: '#AEB9CC' }}>
          Every message you receive arrives already translated into it.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-8 py-10" style={{ background: 'var(--color-fog)' }}>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Postmark size={32} />
            <span className="font-['display'] text-lg text-(--color-ink)">LinguaBridge</span>
          </div>

          <h1 className="mb-1 font-['display'] text-[28px] text-(--color-ink)">Create account</h1>
          <p className="mb-8 text-[14px]" style={{ color: 'var(--color-ink-soft)' }}>Start chatting across languages</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>Full name</label>
              <input
                type="text" required value={form.fullName} onChange={set('fullName')}
                placeholder="Alex Chen"
                className="w-full rounded-lg bg-white px-3.5 py-2.5 text-[13.5px] text-(--color-ink) outline-none placeholder:text-gray-400"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>Username</label>
              <input
                type="text" required value={form.username} onChange={set('username')}
                placeholder="alexchen"
                className="w-full rounded-lg bg-white px-3.5 py-2.5 text-[13.5px] text-(--color-ink) outline-none placeholder:text-gray-400"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>Email address</label>
              <input
                type="email" required value={form.email} onChange={set('email')}
                placeholder="you@example.com"
                className="w-full rounded-lg bg-white px-3.5 py-2.5 text-[13.5px] text-(--color-ink) outline-none placeholder:text-gray-400"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password} onChange={set('password')}
                  placeholder="Min 8 characters"
                  className="w-full rounded-lg bg-white px-3.5 py-2.5 pr-10 text-[13.5px] text-(--color-ink) outline-none placeholder:text-gray-400"
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>Confirm password</label>
              <div className="relative">
                <input
                  type="password" required
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Repeat your password"
                  className="w-full rounded-lg bg-white px-3.5 py-2.5 pr-10 text-[13.5px] text-(--color-ink) outline-none placeholder:text-gray-400"
                  style={inputStyle}
                />
                {form.confirmPassword && form.confirmPassword === form.password && (
                  <span className="absolute top-1/2 right-3 -translate-y-1/2" style={{ color: 'var(--color-bridge)' }}>
                    <Check size={16} />
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: 'var(--color-ink-soft)' }}>Preferred language</label>
              <select
                value={form.language} onChange={set('language')}
                className="w-full rounded-lg bg-white px-3.5 py-2.5 text-[13.5px] text-(--color-ink) outline-none"
                style={inputStyle}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{LANGUAGE_NAMES[l]}</option>
                ))}
              </select>
              <p className="mt-1.5 text-[11.5px]" style={{ color: 'var(--color-ink-soft)' }}>
                Incoming messages will be translated into this language. You can change it anytime.
              </p>
            </div>

            <button
              type="submit" disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold text-white transition-all disabled:opacity-70"
              style={{ background: 'var(--color-bridge)' }}
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>
            Already have an account?{' '}
            <button onClick={onGoLogin} className="font-semibold" style={{ color: 'var(--color-bridge)' }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}