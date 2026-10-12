import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useDemo();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-xl border text-sm transition-all transform translate-y-0 ${
            t.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-100 border-emerald-700'
              : t.type === 'error'
              ? 'bg-rose-900/95 text-rose-100 border-rose-700'
              : t.type === 'warning'
              ? 'bg-amber-900/95 text-amber-100 border-amber-700'
              : 'bg-blue-900/95 text-blue-100 border-blue-700'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

          <div className="flex-1 font-medium leading-snug">{t.message}</div>

          <button
            onClick={() => removeToast(t.id)}
            className="text-white/60 hover:text-white p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
