import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    // Exact User Application Status Specifications
    'New': 'bg-blue-50 text-[#2563EB] border-blue-200 font-bold',
    'Under Review': 'bg-amber-50 text-[#F59E0B] border-amber-200 font-bold',
    'Shortlisted': 'bg-purple-50 text-[#7C3AED] border-purple-200 font-bold',
    'Selected': 'bg-emerald-50 text-[#16A34A] border-emerald-200 font-bold',
    'Waitlisted': 'bg-slate-100 text-[#64748B] border-slate-300 font-bold',
    'Rejected': 'bg-rose-50 text-[#DC2626] border-rose-200 font-bold',

    // Batch & Course statuses
    'Upcoming': 'bg-blue-50 text-[#2563EB] border-blue-200 font-bold',
    'Active': 'bg-emerald-50 text-[#16A34A] border-emerald-200 font-bold',
    'Completed': 'bg-slate-100 text-[#1E293B] border-slate-300 font-bold',
    'Cancelled': 'bg-rose-50 text-[#DC2626] border-rose-200 font-bold',

    // Certificate & Placement statuses
    'Issued': 'bg-purple-50 text-[#7C3AED] border-purple-200 font-bold',
    'Generated': 'bg-blue-50 text-[#2563EB] border-blue-200 font-bold',
    'Pending': 'bg-amber-50 text-[#F59E0B] border-amber-200 font-bold',
    'Employed': 'bg-emerald-50 text-[#16A34A] border-emerald-200 font-bold',
    'Self-Employed': 'bg-teal-50 text-teal-800 border-teal-200 font-bold',
    'Seeking Employment': 'bg-amber-50 text-[#F59E0B] border-amber-200 font-bold',

    // CMS & Documents
    'Published': 'bg-emerald-50 text-[#16A34A] border-emerald-200 font-bold',
    'Draft': 'bg-slate-100 text-[#64748B] border-slate-300 font-bold',
    'Success': 'bg-emerald-50 text-[#16A34A] border-emerald-200 font-bold',

    // Donation verification statuses
    'Pending Verification': 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
    'Verified': 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
    'Successful': 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
  };

  const defaultStyle = 'bg-slate-100 text-[#64748B] border-[#E2E8F0]';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide whitespace-nowrap ${styles[status] || defaultStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </span>
  );
}
