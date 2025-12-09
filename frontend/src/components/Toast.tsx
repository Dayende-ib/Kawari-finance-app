import { useEffect, useState } from 'react';

type ToastMsg = { id: number; message: string; tone?: 'success' | 'error' };

export default function Toast() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  useEffect(() => {
    const handler = (event: CustomEvent<ToastMsg>) => {
      setItems((prev) => [...prev, { ...event.detail, id: Date.now() }]);
    };
    window.addEventListener('toast', handler as EventListener);
    return () => window.removeEventListener('toast', handler as EventListener);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setTimeout(() => setItems((prev) => prev.slice(1)), 2500);
    return () => clearTimeout(timer);
  }, [items]);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {items.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded-lg shadow-card ${
            t.tone === 'error' ? 'bg-danger/90 text-white' : 'bg-panel border border-slate-800'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export const notify = (message: string, tone: 'success' | 'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, tone } }));
};
