import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, isPositive, icon: Icon, color = 'blue', onClick }) {
  const colorMap = {
    green: 'bg-emerald-50 border-emerald-200 text-[#16A34A]',
    emerald: 'bg-emerald-50 border-emerald-200 text-[#16A34A]',
    blue: 'bg-blue-50 border-blue-200 text-[#2563EB]',
    amber: 'bg-amber-50 border-amber-200 text-[#F59E0B]',
    red: 'bg-rose-50 border-rose-200 text-[#DC2626]',
    rose: 'bg-rose-50 border-rose-200 text-[#DC2626]',
    pink: 'bg-pink-50 border-pink-200 text-[#C52B75]',
    purple: 'bg-purple-50 border-purple-200 text-[#7C3AED]',
    navy: 'bg-[#123B5D]/10 border-[#123B5D]/20 text-[#123B5D]'
  };

  return (
    <div 
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-slate-300 transition-all duration-300 shadow-xs hover:shadow-md group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.blue} group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-bold flex items-center gap-0.5 px-2.5 py-0.5 rounded-full border ${
            isPositive ? 'text-[#16A34A] bg-emerald-50 border-emerald-200' : 'text-[#F59E0B] bg-amber-50 border-amber-200'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
