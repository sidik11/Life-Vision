import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function ActionPopover({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  const toggleOpen = (e) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const popoverHeight = Math.min(items.length * 36 + 16, 320);
      const openUpward = rect.bottom + popoverHeight > viewportHeight;

      setCoords({
        top: openUpward ? Math.max(10, rect.top - popoverHeight) : rect.bottom + 4,
        left: Math.max(10, rect.right - 192)
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', () => setIsOpen(false), true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', () => setIsOpen(false), true);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
        aria-label="Actions menu"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 text-xs animate-in fade-in-0 zoom-in-95 duration-150 max-h-80 overflow-y-auto"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`
          }}
        >
          {items.map((item, idx) => {
            if (item.divider) {
              return <div key={idx} className="my-1 border-t border-slate-100" />;
            }
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                disabled={item.disabled}
                className={`w-full text-left px-3.5 py-2 font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
                  item.danger 
                    ? 'text-rose-600 hover:bg-rose-50 font-bold' 
                    : item.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${item.danger ? 'text-rose-600' : 'text-slate-400'}`} />}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
