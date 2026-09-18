import React, { useState } from 'react';
import { Phone, PhoneCall, MessageCircle, Heart, X, Sparkles } from 'lucide-react';

export default function FloatingCallButton({ onOpenDonate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 font-sans">
      
      {/* Expanded Quick Contact Card */}
      {isOpen && (
        <div className="bg-white text-slate-800 rounded-3xl p-4 shadow-2xl border border-pink-100 w-64 space-y-3 animate-scale-up">
          <div className="flex items-center justify-between border-b border-pink-100 pb-2">
            <span className="text-xs font-serif font-black text-[#6B1D52] tracking-wide">
              Quick Connect & Support
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close contact popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenDonate) onOpenDonate();
              }}
              className="w-full text-left flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-pink-50 to-pink-100/60 hover:from-pink-100 hover:to-pink-200 text-[#6B1D52] transition-all duration-200 border border-pink-200 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#C52B75] to-[#6B1D52] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-[#C52B75]">Support Causes</p>
                <p className="text-xs font-bold text-slate-900">Donate Now (80G Benefit)</p>
              </div>
            </button>

            <a
              href="tel:+919416362914"
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#6B1D52] transition-all duration-200 border border-purple-100 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#6B1D52] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-[#6B1D52]">Direct Helpline</p>
                <p className="text-xs font-bold text-slate-900">+91 9416362914</p>
              </div>
            </a>

            <a
              href="https://wa.me/919416362914"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#006B3C] transition-all duration-200 border border-emerald-100 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#006B3C] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-[#006B3C]">WhatsApp Chat</p>
                <p className="text-xs font-bold text-slate-900">Instant Response</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Floating Actions Column: Vertical Alignment */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        
        {/* Floating Donate Logo Button (Top) */}
        <button
          onClick={() => {
            if (onOpenDonate) onOpenDonate();
          }}
          className="relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-r from-[#D53F8C] via-[#C52B75] to-[#6B1D52] text-white shadow-xl hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer border-2 border-white shrink-0"
          title="Donate - Support Life Vision Society"
          aria-label="Donate"
        >
          <span className="absolute inset-0 rounded-full bg-[#C52B75] opacity-75 animate-ping pointer-events-none" />
          <Heart className="w-6 h-6 fill-white relative z-10 animate-pulse" />
        </button>

        {/* Floating Call Button (Bottom) */}
        <div className="relative group shrink-0">
          <a
            href="tel:+919416362914"
            className="flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer border-2 border-white"
            title="Call Helpline"
            aria-label="Call Helpline"
          >
            <Phone className="w-5 h-5 text-amber-300" />
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[#6B1D52] border border-pink-200 flex items-center justify-center text-[10px] font-black shadow-xs cursor-pointer hover:bg-pink-50"
            title="More Options"
          >
            {isOpen ? '✕' : '💬'}
          </button>
        </div>

      </div>
    </div>
  );
}
