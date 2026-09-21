import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    danger: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icons[type] || (type === 'error' || type === 'danger' ? AlertCircle : CheckCircle2);

  const styles = {
    success: 'bg-emerald-800 text-white border-emerald-500 shadow-emerald-950/50',
    error: 'bg-rose-800 text-white border-rose-500 shadow-rose-950/50',
    danger: 'bg-rose-800 text-white border-rose-500 shadow-rose-950/50',
    warning: 'bg-amber-700 text-white border-amber-400 shadow-amber-950/50',
    info: 'bg-slate-900 text-white border-sky-500 shadow-slate-950/50'
  };

  const activeStyle = styles[type] || styles.success;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md animate-slide-up ${activeStyle}`}>
      <Icon className="w-5 h-5 shrink-0 text-white" />
      <span className="text-xs font-bold text-white max-w-md leading-snug">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
