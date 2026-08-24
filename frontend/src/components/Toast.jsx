import { useEffect, useState, useRef } from 'react';
import { X, Check } from 'lucide-react';

function Toast({ message, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onDismissRef.current(), 250);
  };

  useEffect(() => {
    const animFrame = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismissRef.current(), 250);
    }, 3000);

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 shadow-lg transition-all duration-200 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      style={{ background: 'var(--color-ink)', minWidth: 220 }}
    >
      <span style={{ color: 'var(--color-bridge)' }}>
        <Check size={14} />
      </span>
      <p className="flex-1 text-[12.5px] font-medium text-white">{message}</p>
      <button
        onClick={handleClose}
        className="ml-1 text-gray-400 hover:text-white"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}