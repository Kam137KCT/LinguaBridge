import { useState } from 'react';
import { ArrowLeft, LogOut, Check } from 'lucide-react';
import { CURRENT_USER, LANGUAGE_NAMES } from '../data/mockData';
import Avatar from '../components/Avatar';

const LANGUAGES = ['en', 'ne', 'fr', 'es'];

export default function ProfilePage({ onBack, onLogout }) {
  const [language, setLanguage] = useState(CURRENT_USER.language);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: 'var(--color-fog)' }}>
      <div
        className="px-5 py-3 flex items-center gap-3"
        style={{ background: 'white', borderBottom: '1px solid var(--color-fog-dim)' }}
      >
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'var(--color-ink-soft)' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-[16px] font-600" style={{ color: 'var(--color-ink)' }}>Profile</h1>
        <button
          onClick={handleSave}
          className="ml-auto px-4 py-1.5 text-[13px] font-600 rounded-lg text-white flex items-center gap-1.5"
          style={{ background: saved ? 'var(--color-bridge)' : 'var(--color-ink)' }}
        >
          {saved ? (<><Check size={13} /> Saved</>) : 'Save changes'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-xl mx-auto w-full">
        <div
          className="rounded-xl p-6 mb-4 flex flex-col items-center"
          style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}
        >
          <Avatar name={CURRENT_USER.name} size={72} />
          <h2 className="font-display text-[17px] mt-4" style={{ color: 'var(--color-ink)' }}>{CURRENT_USER.name}</h2>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'white', border: '1px solid var(--color-fog-dim)' }}>
          <h3 className="text-[11px] font-600 uppercase tracking-wider mb-3" style={{ color: 'var(--color-ink-soft)' }}>
            Language preference
          </h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2.5 text-[13.5px] rounded-lg outline-none"
            style={{ background: 'var(--color-fog)', border: '1px solid var(--color-fog-dim)', color: 'var(--color-ink)' }}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{LANGUAGE_NAMES[l]}</option>
            ))}
          </select>
          <p className="text-[11.5px] mt-2" style={{ color: 'var(--color-ink-soft)' }}>
            All incoming messages will be translated to {LANGUAGE_NAMES[language]}.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-600 mt-4"
          style={{ border: '1px solid #F0D5D2', color: 'var(--color-confidence-low)' }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}