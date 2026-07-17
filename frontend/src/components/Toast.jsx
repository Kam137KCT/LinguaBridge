import { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';

function Toast({ message, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 250);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg shadow-lg transition-all duration-250 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      style={{ background: 'var(--color-ink)', minWidth: 220 }}
    >
      <span style={{ color: 'var(--color-bridge)' }}>
        <Check size={14} />
      </span>
      <p className="text-[12.5px] font-500 text-white flex-1">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 250); }}
        className="text-gray-400 hover:text-white ml-1"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}