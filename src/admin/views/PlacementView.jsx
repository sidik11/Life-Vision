import React, { useState } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import { Briefcase, Building2, MapPin, Edit, CheckCircle2, Filter } from 'lucide-react';

export default function PlacementView({ placements = [], setPlacements, showToast, onShowToast, activeSubTab = 'placement-overview' }) {
  const notify = showToast || onShowToast || (() => {});
  const [subTab, setSubTab] = useState(activeSubTab);

  const [editingItem, setEditingItem] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newEmployer, setNewEmployer] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleOpenEdit = (plc) => {
    setEditingItem(plc);
    setNewStatus(plc.placementStatus || 'Employed');
    setNewEmployer(plc.employer || '');
    setNewRole(plc.jobRole || '');
  };

  const handleSavePlacement = () => {
    if (editingItem) {
      const updated = {
        ...editingItem,
        placementStatus: newStatus,
        employer: newEmployer,
        jobRole: newRole
      };
      if (setPlacements) {
        setPlacements(prev => prev.map(p => p.id === editingItem.id ? updated : p));
      } else {
        editingItem.placementStatus = newStatus;
        editingItem.employer = newEmployer;
        editingItem.jobRole = newRole;
      }
      notify(`Updated placement status for ${editingItem.student || 'Trainee'}!`, 'success');
      setEditingItem(null);
    }
  };

  const filteredPlacements = placements.filter(p => {
    if (subTab === 'students-seeking-jobs') return p.placementStatus?.toLowerCase().includes('seeking') || p.placementStatus?.toLowerCase().includes('pending');
    if (subTab === 'job-opportunities') return true;
    if (subTab === 'interviews') return p.placementStatus?.toLowerCase().includes('interview');
    if (subTab === 'selected-students') return p.placementStatus?.toLowerCase().includes('selected');
    if (subTab === 'employed-students') return p.placementStatus?.toLowerCase().includes('employed') && !p.placementStatus?.toLowerCase().includes('self');
    if (subTab === 'self-employed') return p.placementStatus?.toLowerCase().includes('self');
    return true; // placement-overview
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Placement & Livelihood Pipeline</h1>
          <p className="text-xs text-slate-500">Track student job placements, corporate interviews, micro-boutique self-employment & employer linkages</p>
        </div>
      </div>

      {/* Sub Nav Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'placement-overview', label: '📊 Overview', count: placements.length },
          { id: 'students-seeking-jobs', label: '🔍 Seeking Jobs' },
          { id: 'job-opportunities', label: '🏢 Job Openings' },
          { id: 'interviews', label: '🗣️ Interviews' },
          { id: 'selected-students', label: '✅ Selected' },
          { id: 'employed-students', label: '👔 Employed' },
          { id: 'self-employed', label: '🚀 Self-Employed' }
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
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Training Status</th>
                <th className="p-4">Placement Status</th>
                <th className="p-4">Employer / Business</th>
                <th className="p-4">Job Role</th>
                <th className="p-4">Location</th>
                <th className="p-4">Joining Date / Income</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPlacements.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No Student Records Found</p>
                      <p className="text-xs text-slate-500">Submissions from the public website form will appear here live in real-time.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPlacements.map((plc) => (
                  <tr key={plc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{plc.student}</td>
                    <td className="p-4 text-slate-800">{plc.course}</td>
                    <td className="p-4 text-slate-600 font-medium">{plc.trainingCompleted || 'Certified'}</td>
                    <td className="p-4">
                      <StatusBadge status={plc.placementStatus} />
                    </td>
                    <td className="p-4 font-bold text-slate-900">{plc.employer || 'Pending Placement'}</td>
                    <td className="p-4 text-slate-800">{plc.jobRole || 'Trainee'}</td>
                    <td className="p-4 text-slate-600">{plc.location || 'Odisha'}</td>
                    <td className="p-4 text-emerald-800 font-extrabold">{plc.joiningDate || '2026'} ({plc.salary || '₹12,000/mo'})</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(plc)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Placement Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-900 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 font-serif">Update Placement for {editingItem.student}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Placement Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="Seeking Employment">Seeking Employment</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Selected">Selected</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Not Placed">Not Placed</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Employer / Boutique Name</label>
                <input
                  type="text"
                  value={newEmployer}
                  onChange={(e) => setNewEmployer(e.target.value)}
                  placeholder="e.g. Cuttack Salon / Self Boutique"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Job Designation</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Senior Beautician"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleSavePlacement} className="px-4 py-2 bg-[#123B5D] text-white rounded-xl text-xs font-bold shadow-md">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
