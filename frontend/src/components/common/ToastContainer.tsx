import React from 'react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-md shadow-lg border text-xs transition-all transform translate-y-0 ${
            t.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/60'
              : t.type === 'error'
              ? 'bg-slate-900 text-white border-rose-500/60'
              : t.type === 'warning'
              ? 'bg-slate-900 text-white border-amber-500/60'
              : 'bg-slate-900 text-white border-blue-500/60'
          }`}
        >
          {t.type === 'success' && <i className="fa-solid fa-circle-check text-emerald-400 text-sm shrink-0 mt-0.5" />}
          {t.type === 'error' && <i className="fa-solid fa-circle-xmark text-rose-400 text-sm shrink-0 mt-0.5" />}
          {t.type === 'warning' && <i className="fa-solid fa-triangle-exclamation text-amber-400 text-sm shrink-0 mt-0.5" />}
          {t.type === 'info' && <i className="fa-solid fa-circle-info text-blue-400 text-sm shrink-0 mt-0.5" />}

          <div className="flex-1 font-medium leading-snug">{t.message}</div>

          <button
            onClick={() => removeToast(t.id)}
            className="text-white/60 hover:text-white p-1 rounded-sm cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
};

