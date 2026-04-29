'use client';

import { useEffect, useState } from 'react';
import { subscribeToToasts, type ToastPayload } from '@/lib/toast';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

type Toast = ToastPayload & { id: number };

const ICONS = {
  success: CheckCircle2,
  info:    Info,
  warning: AlertTriangle,
  error:   XCircle,
};

const COLORS = {
  success: 'bg-white border-green-200 text-green-700',
  info:    'bg-white border-violet-200 text-violet-700',
  warning: 'bg-white border-amber-200 text-amber-700',
  error:   'bg-white border-red-200 text-red-700',
};

const ICON_COLORS = {
  success: 'text-green-500',
  info:    'text-violet-500',
  warning: 'text-amber-500',
  error:   'text-red-500',
};

const DURATION = 4000;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, DURATION);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const type  = toast.type ?? 'success';
        const Icon  = ICONS[type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl max-w-xs
              animate-in slide-in-from-right-4 fade-in duration-300 ${COLORS[type]}`}
          >
            <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_COLORS[type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-snug">{toast.message}</p>
              {toast.sub && <p className="text-xs text-gray-500 mt-0.5 truncate">{toast.sub}</p>}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
