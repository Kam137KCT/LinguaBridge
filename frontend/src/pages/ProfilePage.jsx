import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Check, Loader2, AlertCircle } from 'lucide-react';
import { LANGUAGE_NAMES } from '../data/mockData';
import Avatar from '../components/Avatar';
import { updateMe } from '../api/client'; // Adjust import path to match your API helper location

const LANGUAGES = ['en', 'ne', 'fr', 'es'];

export default function ProfilePage({ currentUser, onBack, onLogout, onUserUpdate }) {
  const [language, setLanguage] = useState(currentUser?.preferred_language || 'en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Keep internal state aligned if currentUser resolves after initial render
  useEffect(() => {
    if (currentUser?.preferred_language) {
      setLanguage(currentUser.preferred_language);
    }
  }, [currentUser?.preferred_language]);

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
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: 'var(--color-fog)' }}>
      {/* Top Header */}
      <div
        className="px-5 py-3 flex items-center gap-3"
        style={{ background: 'white', borderBottom: '1px solid var(--color-fog-dim)' }}
      >
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-[16px] font-semibold" style={{ color: 'var(--color-ink)' }}>
          Profile
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto px-4 py-1.5 text-[13px] font-semibold rounded-lg text-white flex items-center gap-1.5 transition-all disabled:opacity-60"
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
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-xl mx-auto w-full">
        {error && (
          <div className="mb-4 p-3 rounded-lg text-[13px] bg-red-50 text-red-600 border border-red-200 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* User Card */}
        <div
          className="rounded-xl p-6 mb-4 flex flex-col items-center text-center"
          style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}
        >
          <Avatar name={currentUser?.username || 'User'} size={72} />
          <h2 className="font-display text-[17px] font-semibold mt-4" style={{ color: 'var(--color-ink)' }}>
            {currentUser?.username || 'User'}
          </h2>
        </div>

        {/* Language Selection */}
        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-ink-soft)' }}>
            Language preference
          </h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2.5 text-[13.5px] rounded-lg outline-none transition-colors"
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
          <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-ink-soft)' }}>
            All incoming messages will be translated to {LANGUAGE_NAMES[language] || language}.
          </p>
        </div>

        {/* Sign Out Action */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold mt-4 transition-colors hover:bg-red-50"
          style={{ border: '1px solid #F0D5D2', color: 'var(--color-confidence-low)' }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}