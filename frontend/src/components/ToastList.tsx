import { useToast } from '../context/ToastContext';

const styles = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-700 text-white',
};

export default function ToastList() {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg ${styles[t.type]} flex items-center justify-between gap-3`}
        >
          <span className="text-sm">{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="text-white/80 hover:text-white text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
