import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { Users, CheckCircle2, UserPlus, FileText, Filter, Eye, Edit, Trash2, Clock, X, Phone, Mail, MapPin, Heart, XCircle } from 'lucide-react';
import { db, doc, updateDoc, deleteDoc } from '../../firebase';

export default function VolunteersView({ volunteers = [], setVolunteers, showToast, onShowToast, activeSubTab = 'all-volunteers' }) {
  const notify = showToast || onShowToast || (() => {});
  const [subTab, setSubTab] = useState(activeSubTab);

  useEffect(() => {
    if (activeSubTab && activeSubTab !== 'volunteers') {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  const [viewingVol, setViewingVol] = useState(null);
  const [editingVol, setEditingVol] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Female',
    state: '',
    city: '',
    location: '',
    skills: '',
    interest: '',
    availability: '',
    status: 'Verified'
  });

  const handleApprove = async (vol) => {
    const updated = { ...vol, status: 'Verified' };
    if (setVolunteers) {
      setVolunteers(prev => prev.map(v => (v.id === vol.id || (v.firestoreId && v.firestoreId === vol.firestoreId)) ? updated : v));
    }
    const docId = vol.firestoreId || vol.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "volunteers", docId), { status: 'Verified', updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Firestore volunteer verify notice:", e);
      }
    }
    notify(`✓ Verified & approved volunteer application for ${vol.name || vol.studentName}!`, 'success');
  };

  const handleReject = async (vol) => {
    const updated = { ...vol, status: 'Rejected' };
    if (setVolunteers) {
      setVolunteers(prev => prev.map(v => (v.id === vol.id || (v.firestoreId && v.firestoreId === vol.firestoreId)) ? updated : v));
    }
    const docId = vol.firestoreId || vol.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "volunteers", docId), { status: 'Rejected', updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Firestore volunteer reject notice:", e);
      }
    }
    notify(`Rejected volunteer application for ${vol.name}.`, 'info');
  };

  const handlePending = async (vol) => {
    const updated = { ...vol, status: 'Pending Verification' };
    if (setVolunteers) {
      setVolunteers(prev => prev.map(v => (v.id === vol.id || (v.firestoreId && v.firestoreId === vol.firestoreId)) ? updated : v));
    }
    const docId = vol.firestoreId || vol.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "volunteers", docId), { status: 'Pending Verification', updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Firestore volunteer pending notice:", e);
      }
    }
    notify(`Marked volunteer ${vol.name} as Pending Verification.`, 'info');
  };

  const handleDelete = async (vol) => {
    if (window.confirm(`Are you sure you want to delete volunteer "${vol.name}" (${vol.id})?`)) {
      const docId = vol.firestoreId || vol.id;
      if (docId) {
        try {
          await deleteDoc(doc(db, "volunteers", docId));
        } catch (e) {
          console.warn("Firestore volunteer delete notice:", e);
        }
      }
      if (setVolunteers) {
        setVolunteers(prev => prev.filter(v => v.id !== vol.id && (!vol.firestoreId || v.firestoreId !== vol.firestoreId)));
      }
      notify(`Deleted volunteer ${vol.name}.`, 'info');
    }
  };

  const handleOpenEdit = (vol) => {
    setEditingVol(vol);
    setEditForm({
      name: vol.name || '',
      email: vol.email || '',
      phone: vol.phone || vol.mobile || '',
      gender: vol.gender || 'Female',
      state: vol.state || '',
      city: vol.city || '',
      location: vol.location || '',
      skills: vol.skills || vol.interest || 'Skill Trainer',
      interest: vol.interest || vol.skills || 'Skill Trainer',
      availability: vol.availability || 'Weekends Only',
      status: vol.status || 'Verified'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      notify('Please enter volunteer name', 'error');
      return;
    }
    const locationStr = editForm.city && editForm.state
      ? `${editForm.city}, ${editForm.state}`
      : (editForm.city || editForm.state || editForm.location);

    const updated = {
      ...editingVol,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      mobile: editForm.phone,
      gender: editForm.gender,
      state: editForm.state,
      city: editForm.city,
      location: locationStr,
      skills: editForm.skills,
      interest: editForm.interest,
      availability: editForm.availability,
      status: editForm.status
    };

    if (setVolunteers) {
      setVolunteers(prev => prev.map(v => (v.id === editingVol.id || (v.firestoreId && v.firestoreId === editingVol.firestoreId)) ? updated : p));
    }
    const docId = editingVol.firestoreId || editingVol.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "volunteers", docId), updated);
      } catch (e) {
        console.warn("Firestore volunteer edit notice:", e);
      }
    }
    setEditingVol(null);
    notify(`✓ Updated volunteer profile for ${editForm.name}!`, 'success');
  };

  const filteredVolunteers = volunteers.filter(v => {
    const isPending = v.status?.toLowerCase().includes('pending') || v.status?.toLowerCase().includes('new');
    
    if (subTab === 'volunteer-applications' || subTab === 'volunteer-new-apps' || subTab === 'app-volunteer') {
      return isPending;
    }
    
    if (subTab === 'active-volunteers') {
      return !isPending && !v.status?.toLowerCase().includes('reject');
    }

    if (v.status?.toLowerCase().includes('reject')) return false;

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Volunteer Roster & Applications</h1>
          <p className="text-xs text-slate-500">Manage volunteer registrations, community health mentors & skill development projects</p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Filter Volunteers:</span>
          <select
            value={subTab}
            onChange={(e) => setSubTab(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#123B5D] outline-none cursor-pointer"
          >
            <option value="all-volunteers">🙋 All Volunteers ({volunteers.length})</option>
            <option value="volunteer-applications">📥 Volunteer Applications ({volunteers.filter(v => v.status?.toLowerCase().includes('pending')).length})</option>
            <option value="active-volunteers">✨ Active Volunteers ({volunteers.filter(v => v.status?.toLowerCase().includes('active') || v.status?.toLowerCase().includes('verified')).length})</option>
            <option value="volunteer-projects">🎯 Volunteer Projects</option>
            <option value="volunteer-reports">📊 Volunteer Reports</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredVolunteers.length}</span> records
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 uppercase tracking-wider font-bold">
                <th className="p-4">Volunteer Name</th>
                <th className="p-4">Gender</th>
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
                  <td colSpan="8" className="p-12 text-center text-slate-500">
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
                    <td className="p-4 text-slate-700">{vol.gender || '—'}</td>
                    <td className="p-4 text-slate-700">{vol.location}</td>
                    <td className="p-4 text-slate-900 font-bold">{vol.skills}</td>
                    <td className="p-4 text-emerald-700 font-bold">{vol.interest}</td>
                    <td className="p-4 text-slate-500">{vol.applicationDate}</td>
                    <td className="p-4">
                      <StatusBadge status={vol.status} />
                    </td>
                    
                    {/* Action 3-dot Popover Menu */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <ActionPopover
                        items={[
                          { label: 'View Details', icon: Eye, onClick: () => setViewingVol(vol) },
                          { label: 'Edit Volunteer', icon: Edit, onClick: () => handleOpenEdit(vol) },
                          { divider: true },
                          { label: 'Approve & Verify', icon: CheckCircle2, onClick: () => handleApprove(vol.id) },
                          { label: 'Mark as Pending', icon: Clock, onClick: () => handlePending(vol.id) },
                          { divider: true },
                          { label: 'Delete Volunteer', icon: Trash2, danger: true, onClick: () => handleDelete(vol) }
                        ]}
                      />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW VOLUNTEER DETAILS MODAL */}
      {viewingVol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">{viewingVol.name}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {viewingVol.id} • Applied: {viewingVol.applicationDate}</p>
              </div>
              <button onClick={() => setViewingVol(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Gender:</span>
                <span className="font-bold text-slate-900">{viewingVol.gender || 'Female'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-bold text-slate-900">{viewingVol.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Phone Number:</span>
                <span className="font-bold text-slate-900">{viewingVol.phone || viewingVol.mobile}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-bold text-slate-900">{viewingVol.location}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Area of Interest:</span>
                <span className="font-bold text-emerald-700">{viewingVol.interest || viewingVol.skills}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Availability:</span>
                <span className="font-bold text-purple-700">{viewingVol.availability || 'Weekends Only'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Status:</span>
                <StatusBadge status={viewingVol.status} />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              {viewingVol.status?.toLowerCase().includes('pending') && (
                <button
                  onClick={() => {
                    handleApprove(viewingVol.id);
                    setViewingVol(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Approve & Verify Volunteer
                </button>
              )}
              <button
                onClick={() => setViewingVol(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT VOLUNTEER MODAL */}
      {editingVol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-serif">Edit Volunteer Record</h3>
              <button onClick={() => setEditingVol(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Volunteer Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Verification Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Active">Active / Approved</option>
                    <option value="Pending">Pending Verification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">City / District</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Area of Interest</label>
                  <input
                    type="text"
                    value={editForm.interest}
                    onChange={(e) => setEditForm(prev => ({ ...prev, interest: e.target.value, skills: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Availability</label>
                  <input
                    type="text"
                    value={editForm.availability}
                    onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingVol(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#123B5D] hover:bg-[#0E2F4A] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
