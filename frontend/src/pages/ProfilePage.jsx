import { useState } from 'react';
import { ArrowLeft, LogOut, Check, Loader2, AlertCircle } from 'lucide-react';
import { LANGUAGE_NAMES } from '../data/mockData';
import Avatar from '../components/Avatar';
import { updateMe } from '../api/client';

const LANGUAGES = ['en', 'ne', 'fr', 'es'];

export default function ProfilePage({ currentUser, onBack, onLogout, onUserUpdate }) {
  const [language, setLanguage] = useState(currentUser?.preferred_language || 'en');
  const [prevPropLanguage, setPrevPropLanguage] = useState(currentUser?.preferred_language);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Sync state during render when currentUser resolves (avoids effect cascading renders)
  if (currentUser?.preferred_language !== prevPropLanguage) {
    setPrevPropLanguage(currentUser?.preferred_language);
    setLanguage(currentUser?.preferred_language || 'en');
  }

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updatedUser = await updateMe(language);
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col" style={{ background: 'var(--color-fog)' }}>
      {/* Top Header */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ background: 'white', borderBottom: '1px solid var(--color-fog-dim)' }}
      >
        <button
          onClick={onBack}
          aria-label="Go back"
          className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[16px] font-semibold" style={{ color: 'var(--color-ink)' }}>
          Profile
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[13px] font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: saved ? 'var(--color-bridge)' : 'var(--color-ink)' }}
        >
          {saving ? (
            <><Loader2 size={13} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check size={13} /> Saved</>
          ) : (
            'Save changes'
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-xl flex-1 overflow-y-auto px-5 py-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-600">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* User Card */}
        <div
          className="mb-4 flex flex-col items-center rounded-xl p-6 text-center"
          style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}
        >
          <Avatar name={currentUser?.username || 'User'} size={72} />
          <h2 className="mt-4 text-[17px] font-semibold" style={{ color: 'var(--color-ink)' }}>
            {currentUser?.username || 'User'}
          </h2>
        </div>

        {/* Language Selection */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}>
          <h3 className="mb-3 text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--color-ink-soft)' }}>
            Language preference
          </h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-[13.5px] transition-colors outline-none"
            style={{
              background: 'var(--color-fog)',
              border: '1px solid var(--color-fog-dim)',
              color: 'var(--color-ink)',
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {LANGUAGE_NAMES[l] || l}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[11.5px]" style={{ color: 'var(--color-ink-soft)' }}>
            All incoming messages will be translated to {LANGUAGE_NAMES[language] || language}.
          </p>
        </div>

        {/* Sign Out Action */}
        <button
          onClick={onLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-colors hover:bg-red-50"
          style={{ border: '1px solid #F0D5D2', color: 'var(--color-confidence-low)' }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}