import React, { useState } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import { Users, CheckCircle2, UserPlus, FileText } from 'lucide-react';

export default function VolunteersView({ volunteers = [], setVolunteers, showToast, onShowToast, activeSubTab = 'all-volunteers' }) {
  const notify = showToast || onShowToast || (() => {});
  const [subTab, setSubTab] = useState(activeSubTab);

  const handleApprove = (id) => {
    if (setVolunteers) {
      setVolunteers(prev => prev.map(v => v.id === id ? { ...v, status: 'Active' } : v));
    }
    notify(`Volunteer application ${id} approved & assigned successfully!`, 'success');
  };

  const filteredVolunteers = volunteers.filter(v => {
    if (subTab === 'volunteer-new-apps') return v.status?.toLowerCase().includes('pending') || v.status?.toLowerCase().includes('new');
    if (subTab === 'active-volunteers') return v.status?.toLowerCase().includes('active') || v.status?.toLowerCase().includes('approved');
    if (subTab === 'volunteer-projects') return true;
    return true; // all-volunteers
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Volunteer Roster & Applications</h1>
          <p className="text-xs text-slate-500">Manage volunteer registrations, community health mentors & skill development projects</p>
        </div>
      </div>

      {/* Sub Nav Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all-volunteers', label: '🙋 All Volunteers', count: volunteers.length },
          { id: 'volunteer-new-apps', label: '📥 New Applications' },
          { id: 'active-volunteers', label: '✨ Active Volunteers' },
          { id: 'volunteer-projects', label: '🎯 Projects' },
          { id: 'volunteer-reports', label: '📊 Volunteer Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              subTab === tab.id 
                ? 'bg-[#123B5D] text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase tracking-wider font-bold">
                <th className="p-4">Volunteer Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Skills</th>
                <th className="p-4">Area of Interest</th>
                <th className="p-4">App Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredVolunteers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No Volunteers Found</p>
                      <p className="text-xs text-slate-500">Public site volunteer submissions will appear here in real-time.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVolunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{vol.name}</div>
                      <div className="text-[10px] text-[#123B5D] font-mono">{vol.id}</div>
                    </td>
                    <td className="p-4 text-slate-700">{vol.location}</td>
                    <td className="p-4 text-slate-900 font-bold">{vol.skills}</td>
                    <td className="p-4 text-emerald-700 font-bold">{vol.interest}</td>
                    <td className="p-4 text-slate-500">{vol.applicationDate}</td>
                    <td className="p-4">
                      <StatusBadge status={vol.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleApprove(vol.id)}
                        className="px-3 py-1.5 bg-[#123B5D] hover:bg-[#0E2F4A] text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                      >
                        Approve & Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
