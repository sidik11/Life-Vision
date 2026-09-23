import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function ActionPopover({ items = [], actions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const menuItems = items && items.length > 0 ? items : actions;

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!menuItems || menuItems.length === 0) return null;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleOpen}
        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer border border-slate-200 shadow-2xs bg-slate-50"
        aria-label="Actions menu"
      >
        <MoreVertical className="w-4 h-4 text-slate-700" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1.5 z-50 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 text-xs animate-in fade-in-0 zoom-in-95 duration-100 font-sans"
        >
          {menuItems.map((item, idx) => {
            if (item.divider) {
              return <div key={idx} className="my-1 border-t border-slate-100" />;
            }
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                disabled={item.disabled}
                className={`w-full text-left px-3.5 py-2 font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
                  item.danger 
                    ? 'text-rose-600 hover:bg-rose-50 font-bold' 
                    : item.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 shrink-0 ${item.danger ? 'text-rose-600' : 'text-slate-500'}`} />}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
