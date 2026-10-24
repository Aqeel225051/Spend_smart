import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const alertStyles = {
  error: {
    container: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
  },
  success: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
  },
  warning: {
    container: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
  },
  info: {
    container: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: <Info className="w-5 h-5 text-sky-500 shrink-0" />
  }
};

export const Alert = ({ type = 'info', message, title, onClose, className = '' }) => {
  if (!message) return null;

  const style = alertStyles[type] || alertStyles.info;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border ${style.container} text-sm transition-all duration-200 shadow-xs ${className}`}
    >
      {style.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold text-sm mb-0.5">{title}</h4>}
        <div className="leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
