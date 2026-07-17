import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { LANGUAGE_NAMES } from '../data/mockData';
import Postmark from '../components/Postmark';

const LANGUAGES = ['en', 'ne', 'fr', 'es'];

export default function RegisterPage({ onRegister, onGoLogin }) {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', language: 'en',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(onRegister, 1000);
  };

  const inputStyle = {
    border: '1px solid #D5DAD8',
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-1 flex-col items-center justify-center px-16"
        style={{ background: 'var(--color-ink)' }}
      >
        <div className="flex items-center gap-3 mb-14 self-start">
          <Postmark />
          <span className="font-display text-2xl text-white tracking-tight">LinguaBridge</span>
        </div>

        <div className="w-full max-w-xs space-y-3 mb-14">
          {LANGUAGES.map((l) => (
            <div
              key={l}
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.25)' }}
            >
              <span
                className="font-mono text-[11px] font-600 px-1.5 py-0.5 rounded"
                style={{ background: 'var(--color-bridge)', color: 'white' }}
              >
                {l.toUpperCase()}
              </span>
              <span className="text-[13px] text-white">{LANGUAGE_NAMES[l]}</span>
            </div>
          ))}
        </div>

        <h2 className="font-display text-[24px] text-white text-center mb-2">Pick your language once.</h2>
        <p className="text-[14px] text-center max-w-xs leading-relaxed" style={{ color: '#AEB9CC' }}>
          Every message you receive arrives already translated into it.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 overflow-y-auto py-10" style={{ background: 'var(--color-fog)' }}>
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Postmark size={32} />
            <span className="font-display text-lg text-[color:var(--color-ink)]">LinguaBridge</span>
          </div>

          <h1 className="font-display text-[28px] text-[color:var(--color-ink)] mb-1">Create account</h1>
          <p className="text-[14px] mb-8" style={{ color: 'var(--color-ink-soft)' }}>Start chatting across languages</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>Full name</label>
              <input
                type="text" required value={form.fullName} onChange={set('fullName')}
                placeholder="Alex Chen"
                className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg outline-none bg-white text-[color:var(--color-ink)] placeholder:text-gray-400"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>Email address</label>
              <input
                type="email" required value={form.email} onChange={set('email')}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg outline-none bg-white text-[color:var(--color-ink)] placeholder:text-gray-400"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password} onChange={set('password')}
                  placeholder="Min 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 text-[13.5px] rounded-lg outline-none bg-white text-[color:var(--color-ink)] placeholder:text-gray-400"
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>Confirm password</label>
              <div className="relative">
                <input
                  type="password" required
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="Repeat your password"
                  className="w-full px-3.5 py-2.5 pr-10 text-[13.5px] rounded-lg outline-none bg-white text-[color:var(--color-ink)] placeholder:text-gray-400"
                  style={inputStyle}
                />
                {form.confirmPassword && form.confirmPassword === form.password && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-bridge)' }}>
                    <Check size={16} />
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-600 block mb-1.5" style={{ color: 'var(--color-ink-soft)' }}>Preferred language</label>
              <select
                value={form.language} onChange={set('language')}
                className="w-full px-3.5 py-2.5 text-[13.5px] rounded-lg outline-none bg-white text-[color:var(--color-ink)]"
                style={inputStyle}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{LANGUAGE_NAMES[l]}</option>
                ))}
              </select>
              <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--color-ink-soft)' }}>
                Incoming messages will be translated into this language. You can change it anytime.
              </p>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 px-4 text-white text-[14px] font-600 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              style={{ background: 'var(--color-bridge)' }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-[13px] text-center mt-6" style={{ color: 'var(--color-ink-soft)' }}>
            Already have an account?{' '}
            <button onClick={onGoLogin} className="font-600" style={{ color: 'var(--color-bridge)' }}>Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}