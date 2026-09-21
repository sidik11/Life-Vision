import React, { useState } from 'react';
import { 
  Briefcase, Search, Filter, Eye, Edit, Trash2, X, Phone, Mail, 
  MapPin, Calendar, FileText, CheckCircle2, MessageSquare, Clock, User, Award, ExternalLink
} from 'lucide-react';
import { db, doc, setDoc, updateDoc, deleteDoc } from '../../firebase';

export default function PlacementView({ placements = [], setPlacements, showToast, onShowToast }) {
  const notify = showToast || onShowToast || (() => {});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [remarksText, setRemarksText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit Form Fields State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    course: '',
    location: '',
    placementStatus: 'Applied',
    remarks: '',
    higherEducation: '',
    passingYear: '',
    collegeName: ''
  });

  // Valid placement statuses strictly as requested
  const STATUS_OPTIONS = [
    'Applied',
    'Contacted',
    'Counseling/Discussion',
    'Placement in Process',
    'Placed',
    'Not Interested',
    'Closed'
  ];

  // Filter ONLY students who submitted a Placement Support request
  const placementApplications = placements.filter(p => {
    // Only records with a valid application ID or applicant name
    const isPlacementApp = p.id || p.student || p.name || p.phone;
    if (!isPlacementApp) return false;

    const term = searchQuery.toLowerCase();
    const nameMatch = (p.student || p.name || '').toLowerCase().includes(term);
    const idMatch = (p.id || p.applicationId || p.firestoreId || '').toLowerCase().includes(term);
    const courseMatch = (p.course || p.training || '').toLowerCase().includes(term);
    const phoneMatch = (p.phone || p.mobile || '').toLowerCase().includes(term);
    const emailMatch = (p.email || '').toLowerCase().includes(term);
    const locMatch = (p.location || p.district || p.address || '').toLowerCase().includes(term);

    const matchesSearch = nameMatch || idMatch || courseMatch || phoneMatch || emailMatch || locMatch;
    const matchesStatus = statusFilter === 'All' || (p.placementStatus || p.status) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Quick Status Change directly from Table Dropdown
  const handleStatusChange = async (plc, newStatus) => {
    const updated = {
      ...plc,
      placementStatus: newStatus,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    if (setPlacements) {
      setPlacements(prev => prev.map(p => (p.id === plc.id || (p.firestoreId && p.firestoreId === plc.firestoreId)) ? updated : p));
    }

    const docId = plc.firestoreId || plc.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "placements", docId), {
          placementStatus: newStatus,
          status: newStatus,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore update placement status notice:", err);
      }
    }

    notify(`✓ Updated placement status for ${plc.student || plc.name} to "${newStatus}"!`, 'success');
  };

  // Open Viewing Modal
  const handleOpenView = (plc) => {
    setViewingItem(plc);
    setRemarksText(plc.remarks || plc.notes || '');
  };

  // Save Remarks & Notes in Viewing Modal
  const handleSaveRemarks = async (plc) => {
    setUpdatingStatus(true);
    const updated = {
      ...plc,
      remarks: remarksText,
      notes: remarksText,
      updatedAt: new Date().toISOString()
    };

    if (setPlacements) {
      setPlacements(prev => prev.map(p => (p.id === plc.id || (p.firestoreId && p.firestoreId === plc.firestoreId)) ? updated : p));
    }

    const docId = plc.firestoreId || plc.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "placements", docId), {
          remarks: remarksText,
          notes: remarksText,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore save remarks notice:", err);
      }
    }

    setViewingItem(updated);
    setUpdatingStatus(false);
    notify(`✓ Remarks saved for ${plc.student || plc.name}!`, 'success');
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (plc) => {
    setEditingItem(plc);
    setEditForm({
      name: plc.student || plc.name || '',
      phone: plc.phone || plc.mobile || '',
      email: plc.email || '',
      course: plc.course || plc.training || '',
      location: plc.location || plc.district || plc.address || '',
      placementStatus: plc.placementStatus || plc.status || 'Applied',
      remarks: plc.remarks || plc.notes || '',
      higherEducation: plc.higherEducation || plc.qualification || '',
      passingYear: plc.passingYear || '',
      collegeName: plc.collegeName || ''
    });
  };

  // Save Edit Application Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      notify('Please enter student name', 'error');
      return;
    }

    const updated = {
      ...editingItem,
      student: editForm.name,
      name: editForm.name,
      phone: editForm.phone,
      mobile: editForm.phone,
      email: editForm.email,
      course: editForm.course,
      training: editForm.course,
      location: editForm.location,
      placementStatus: editForm.placementStatus,
      status: editForm.placementStatus,
      remarks: editForm.remarks,
      notes: editForm.remarks,
      higherEducation: editForm.higherEducation,
      passingYear: editForm.passingYear,
      collegeName: editForm.collegeName,
      updatedAt: new Date().toISOString()
    };

    if (setPlacements) {
      setPlacements(prev => prev.map(p => (p.id === editingItem.id || (p.firestoreId && p.firestoreId === editingItem.firestoreId)) ? updated : p));
    }

    const docId = editingItem.firestoreId || editingItem.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "placements", docId), updated);
      } catch (err) {
        console.warn("Firestore update placement edit notice:", err);
      }
    }

    notify(`✓ Application for ${editForm.name} updated!`, 'success');
    setEditingItem(null);
  };

  // Delete Placement Support Application
  const handleDeletePlacement = async (plc) => {
    if (window.confirm(`Are you sure you want to delete placement support application for "${plc.student || plc.name}" (${plc.id || plc.applicationId})?`)) {
      const docId = plc.firestoreId || plc.id;
      if (docId) {
        try {
          await deleteDoc(doc(db, 'placements', docId));
        } catch (err) {
          console.warn("Firestore delete placement notice:", err);
        }
      }

      if (setPlacements) {
        setPlacements(prev => prev.filter(p => p.id !== plc.id && (!plc.firestoreId || p.firestoreId !== plc.firestoreId)));
      }

      notify(`Deleted placement application for ${plc.student || plc.name}.`, 'info');
    }
  };

  // Get status color styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Counseling/Discussion': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Placement in Process': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Placed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Not Interested': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Closed': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Placement Support System</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-serif">Placement Support Application Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and manage job placement support requests submitted by students from the public NGO portal.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 bg-[#123B5D] text-white text-xs font-bold rounded-xl shadow-xs">
              {placementApplications.length} Applications Total
            </span>
          </div>
        </div>

        {/* Filter & Search Control Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          
          {/* Search Box */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name, application ID, course, mobile, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="md:col-span-4 flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B5D] cursor-pointer"
            >
              <option value="All">All Statuses ({placements.length})</option>
              {STATUS_OPTIONS.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Application ID</th>
                <th className="p-3.5">Course / Training</th>
                <th className="p-3.5">Mobile Number</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Application Date</th>
                <th className="p-3.5 min-w-[160px]">Placement Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {placementApplications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400">
                    <div className="space-y-2">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-xs">No placement support applications found.</p>
                      <p className="text-[11px] text-slate-400">Only students who submit a Placement Support request from the NGO website will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                placementApplications.map(plc => {
                  const studentName = plc.student || plc.name || 'Candidate';
                  const appNo = plc.id || plc.applicationId || plc.firestoreId || 'APP-PLC-001';
                  const currentStatus = plc.placementStatus || plc.status || 'Applied';

                  return (
                    <tr key={plc.id || plc.firestoreId} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Student Name */}
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                            {studentName.charAt(0)}
                          </div>
                          <span>{studentName}</span>
                        </div>
                      </td>

                      {/* Application ID */}
                      <td className="p-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {appNo}
                      </td>

                      {/* Course / Training */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-2xs font-bold whitespace-nowrap">
                          {plc.course || plc.training || 'Skill Training'}
                        </span>
                      </td>

                      {/* Mobile Number */}
                      <td className="p-3.5 font-mono text-slate-700 whitespace-nowrap">
                        {plc.phone || plc.mobile || 'N/A'}
                      </td>

                      {/* Email */}
                      <td className="p-3.5 text-slate-600 truncate max-w-[140px]">
                        {plc.email || 'N/A'}
                      </td>

                      {/* Location */}
                      <td className="p-3.5 text-slate-700 whitespace-nowrap">
                        {plc.location || plc.district || plc.address || 'Odisha'}
                      </td>

                      {/* Application Date */}
                      <td className="p-3.5 text-slate-600 font-mono text-2xs whitespace-nowrap">
                        {plc.applicationDate || plc.registeredAt || plc.date || plc.createdAt || '2026-09-01'}
                      </td>

                      {/* Placement Status Dropdown */}
                      <td className="p-3.5">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(plc, e.target.value)}
                          className={`w-full px-2.5 py-1 rounded-lg text-2xs font-bold border focus:outline-none cursor-pointer ${getStatusBadgeStyle(currentStatus)}`}
                        >
                          {STATUS_OPTIONS.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenView(plc)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View Student & Application Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(plc)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Application"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePlacement(plc)}
                          className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW STUDENT DETAILS MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative my-auto space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {(viewingItem.student || viewingItem.name || 'S').charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    {viewingItem.student || viewingItem.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-2xs mt-0.5">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      ID: {viewingItem.id || viewingItem.applicationId || viewingItem.firestoreId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-bold border ${getStatusBadgeStyle(viewingItem.placementStatus || viewingItem.status || 'Applied')}`}>
                      ● {viewingItem.placementStatus || viewingItem.status || 'Applied'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Action Toolbar */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-700">Contact Student Directly:</span>
              <div className="flex items-center space-x-2">
                {viewingItem.phone && (
                  <a
                    href={`tel:${viewingItem.phone}`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: {viewingItem.phone}</span>
                  </a>
                )}
                {viewingItem.email && (
                  <a
                    href={`mailto:${viewingItem.email}`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Student</span>
                  </a>
                )}
                {viewingItem.phone && (
                  <a
                    href={`https://wa.me/91${viewingItem.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Personal & Academic Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-2xs text-emerald-800">
                  Student Information
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between"><span className="text-slate-500">Full Name:</span><span className="font-bold text-slate-900">{viewingItem.student || viewingItem.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Course / Training:</span><span className="font-bold text-emerald-900">{viewingItem.course || viewingItem.training || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Mobile Number:</span><span className="font-bold text-slate-900">{viewingItem.phone || viewingItem.mobile || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Email Address:</span><span className="font-bold text-slate-900">{viewingItem.email || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Location / District:</span><span className="font-bold text-slate-900">{viewingItem.location || viewingItem.district || viewingItem.address || 'Odisha'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Higher Education:</span><span className="font-bold text-slate-900">{viewingItem.higherEducation || viewingItem.qualification || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">College / Institution:</span><span className="font-bold text-slate-900">{viewingItem.collegeName || 'N/A'}</span></div>
                </div>
              </div>

              {/* Application Status & Remarks Editor */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 uppercase tracking-wider text-2xs text-emerald-800">
                  Placement Status & Admin Remarks
                </h4>

                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Update Placement Status:</label>
                    <select
                      value={viewingItem.placementStatus || viewingItem.status || 'Applied'}
                      onChange={(e) => handleStatusChange(viewingItem, e.target.value)}
                      className={`w-full p-2 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${getStatusBadgeStyle(viewingItem.placementStatus || viewingItem.status || 'Applied')}`}
                    >
                      {STATUS_OPTIONS.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Admin Discussion Remarks / Notes:</label>
                    <textarea
                      rows={3}
                      value={remarksText}
                      onChange={(e) => setRemarksText(e.target.value)}
                      placeholder="Add notes about candidate interview counseling, salary preferences, call discussions..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveRemarks(viewingItem)}
                    disabled={updatingStatus}
                    className="w-full py-2 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Remarks & Update</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* EDIT APPLICATION MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative my-auto space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-serif">Edit Placement Support Application</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Student Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Mobile Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Course / Training</label>
                  <input
                    type="text"
                    value={editForm.course}
                    onChange={(e) => setEditForm(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Location / District</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Placement Status</label>
                <select
                  value={editForm.placementStatus}
                  onChange={(e) => setEditForm(prev => ({ ...prev, placementStatus: e.target.value }))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  {STATUS_OPTIONS.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Admin Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={editForm.remarks}
                  onChange={(e) => setEditForm(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
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
