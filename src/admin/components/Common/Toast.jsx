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
    success: 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-emerald-950/60',
    error: 'bg-red-950 border-red-500 text-red-100 shadow-red-950/60',
    danger: 'bg-red-950 border-red-500 text-red-100 shadow-red-950/60',
    warning: 'bg-amber-950 border-amber-500 text-amber-200 shadow-amber-950/60',
    info: 'bg-slate-900 border-sky-500 text-slate-100 shadow-slate-950/60'
  };

  const activeStyle = styles[type] || styles.success;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md animate-slide-up ${activeStyle}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-xs font-bold text-slate-100">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
