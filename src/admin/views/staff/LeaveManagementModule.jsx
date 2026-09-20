import React, { useState } from 'react';
import { 
  Clock, CheckCircle2, XCircle, Plus, FileText, Calendar, 
  Search, Filter, Check, X, Building, Mail, Phone, Upload 
} from 'lucide-react';
import { db, collection, addDoc, updateDoc, doc, serverTimestamp } from '../../../firebase';

export default function LeaveManagementModule({ 
  staffList = [], 
  leaves = [], 
  setLeaves, 
  showToast 
}) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    staffId: staffList[0]?.id || staffList[0]?.employeeId || '',
    leaveType: 'Casual Leave',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    reason: '',
    supportingDoc: ''
  });

  // Calculate days difference
  const calcDays = (from, to) => {
    if (!from || !to) return 1;
    const diff = new Date(to) - new Date(from);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  };

  // Handle file change
  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, supportingDoc: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Leave Application
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    const staffMember = staffList.find(s => (s.id || s.employeeId) === formData.staffId) || staffList[0];
    
    if (!staffMember || !formData.reason.trim()) {
      if (showToast) showToast('Please select staff member and enter reason for leave.', 'error');
      return;
    }

    setLoading(true);
    const numDays = calcDays(formData.fromDate, formData.toDate);

    const newLeave = {
      staffId: staffMember.id || staffMember.employeeId,
      staffName: staffMember.name,
      department: staffMember.department,
      designation: staffMember.role || staffMember.designation || 'Staff',
      leaveType: formData.leaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      days: numDays,
      reason: formData.reason.trim(),
      supportingDoc: formData.supportingDoc,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    try {
      const ref = await addDoc(collection(db, "leaves"), {
        ...newLeave,
        createdAt: serverTimestamp()
      });
      newLeave.firestoreId = ref.id;

      if (setLeaves) {
        setLeaves(prev => [newLeave, ...prev]);
      }

      setLoading(false);
      setShowApplyModal(false);
      setFormData({
        staffId: staffList[0]?.id || '',
        leaveType: 'Casual Leave',
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        reason: '',
        supportingDoc: ''
      });

      if (showToast) showToast(`Leave application submitted for ${staffMember.name} (${numDays} days)!`, 'success');

    } catch (err) {
      console.warn("Firestore add leave notice:", err);
      setLoading(false);
    }
  };

  // Approve Leave
  const handleApproveLeave = async (leaveItem) => {
    const updated = { ...leaveItem, status: 'Approved', approvedDate: new Date().toISOString() };

    if (setLeaves) {
      setLeaves(prev => prev.map(l => (l.id === leaveItem.id || (l.firestoreId && l.firestoreId === leaveItem.firestoreId)) ? updated : l));
    }

    if (leaveItem.firestoreId) {
      try {
        await updateDoc(doc(db, "leaves", leaveItem.firestoreId), {
          status: 'Approved',
          approvedDate: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore update leave notice:", err);
      }
    }

    if (showToast) showToast(`✓ Leave approved for ${leaveItem.staffName}! Attendance records updated.`, 'success');
  };

  // Reject Leave
  const handleRejectLeave = async (leaveItem) => {
    const updated = { ...leaveItem, status: 'Rejected', rejectedDate: new Date().toISOString() };

    if (setLeaves) {
      setLeaves(prev => prev.map(l => (l.id === leaveItem.id || (l.firestoreId && l.firestoreId === leaveItem.firestoreId)) ? updated : l));
    }

    if (leaveItem.firestoreId) {
      try {
        await updateDoc(doc(db, "leaves", leaveItem.firestoreId), {
          status: 'Rejected',
          rejectedDate: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore update leave notice:", err);
      }
    }

    if (showToast) showToast(`✕ Leave rejected for ${leaveItem.staffName}.`, 'info');
  };

  // Filter leaves
  const filteredLeaves = leaves.filter(l => {
    const term = searchQuery.toLowerCase();
    const nameMatch = (l.staffName || '').toLowerCase().includes(term);
    const idMatch = (l.staffId || '').toLowerCase().includes(term);
    const typeMatch = (l.leaveType || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || idMatch || typeMatch;

    if (selectedStatusFilter === 'All') return matchesSearch;
    return matchesSearch && l.status === selectedStatusFilter;
  });

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Staff Leave Management</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-serif">Leave Applications & Approval Portal</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review casual, sick, earned, and emergency leave requests. Approved leaves automatically sync with attendance calculations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Apply New Leave</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search staff name, ID, leave type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
          />
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          {[
            { id: 'Pending', label: '⏳ Pending', count: pendingCount },
            { id: 'Approved', label: '✓ Approved', count: approvedCount },
            { id: 'Rejected', label: '✕ Rejected', count: rejectedCount },
            { id: 'All', label: 'All Applications', count: leaves.length }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedStatusFilter === f.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{f.label}</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-black bg-slate-200 text-slate-700">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Leave Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">From Date</th>
                <th className="p-3.5">To Date</th>
                <th className="p-3.5">Days</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Applied Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-400">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 font-serif">No Leave Applications Found</p>
                    <p className="text-2xs text-slate-500 mt-1">No leave requests match the selected status filter.</p>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(leave => (
                  <tr key={leave.id || leave.firestoreId} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Staff Name & ID */}
                    <td className="p-3.5">
                      <div>
                        <span className="font-bold text-slate-900 block">{leave.staffName}</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700">ID: {leave.staffId}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-2xs font-bold text-slate-700">
                        {leave.department}
                      </span>
                    </td>

                    {/* Leave Type */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-2xs font-bold">
                        {leave.leaveType}
                      </span>
                    </td>

                    {/* From Date */}
                    <td className="p-3.5 font-mono text-slate-800">
                      {leave.fromDate}
                    </td>

                    {/* To Date */}
                    <td className="p-3.5 font-mono text-slate-800">
                      {leave.toDate}
                    </td>

                    {/* Number of Days */}
                    <td className="p-3.5 font-bold text-slate-900">
                      {leave.days} day(s)
                    </td>

                    {/* Reason */}
                    <td className="p-3.5 max-w-xs truncate text-slate-600" title={leave.reason}>
                      {leave.reason}
                    </td>

                    {/* Applied Date */}
                    <td className="p-3.5 text-slate-500 text-2xs">
                      {leave.appliedDate || 'N/A'}
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      {leave.status === 'Approved' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                          ✓ Approved
                        </span>
                      ) : leave.status === 'Pending' ? (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px]">
                          ⏳ Pending
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px]">
                          ✕ Rejected
                        </span>
                      )}
                    </td>

                    {/* Approve (✓) & Reject (✕) Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleApproveLeave(leave)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                          title="Approve Leave"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectLeave(leave)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            leave.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                          title="Reject Leave"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Apply for Staff Leave</h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-3 text-xs">
              
              {/* Select Staff */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Select Staff Member *</label>
                <select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                >
                  {staffList.map(s => (
                    <option key={s.id || s.employeeId} value={s.id || s.employeeId}>
                      {s.name} ({s.id || s.employeeId}) - {s.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Leave Type *</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* From Date & To Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">From Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">To Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Days Calc Display */}
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 font-bold text-emerald-800 text-center">
                Total Duration: {calcDays(formData.fromDate, formData.toDate)} Day(s)
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Reason for Leave *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter detailed reason for leave..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
              </div>

              {/* Supporting Document Upload */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Supporting Document (Optional)</label>
                <input
                  type="file"
                  onChange={handleDocChange}
                  className="w-full p-1 bg-slate-50 border border-slate-200 rounded-xl text-2xs cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Submit Leave Application</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
