import React from 'react';
import { useToast } from '../../context/ToastContext';

const typeStyles = {
  success: {
    bg: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300',
    icon: '✅',
  },
  error: {
    bg: 'bg-red-950/90 border-red-500/40 text-red-300',
    icon: '❌',
  },
  warning: {
    bg: 'bg-amber-950/90 border-amber-500/40 text-amber-300',
    icon: '⚠️',
  },
  info: {
    bg: 'bg-indigo-950/90 border-indigo-500/40 text-indigo-300',
    icon: 'ℹ️',
  },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = typeStyles[toast.type] || typeStyles.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 animate-slide-in ${style.bg}`}
          >
            <span className="text-base">{style.icon}</span>
            <div className="flex-1 text-xs font-semibold leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
