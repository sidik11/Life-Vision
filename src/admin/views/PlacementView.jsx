import React, { useState } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { 
  Briefcase, Building2, MapPin, Edit, CheckCircle2, Filter, 
  Eye, Trash2, X, User, Phone, Mail, GraduationCap, Award, 
  Calendar, FileText, Upload, Plus, Download, Shield, Sparkles
} from 'lucide-react';
import { db, doc, deleteDoc } from '../../firebase';
import { saveToFirestore } from '../../utils/firebaseSave';

export default function PlacementView({ placements = [], setPlacements, showToast, onShowToast, activeSubTab = 'placement-overview' }) {
  const notify = showToast || onShowToast || (() => {});
  const [subTab, setSubTab] = useState(activeSubTab);

  // Modals state
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Edit Form Fields State (matching main placement form)
  const [editFormData, setEditFormData] = useState({
    id: '',
    student: '',
    phone: '',
    email: '',
    gender: 'Female',
    dob: '',
    guardianName: '',
    course: '',
    collegeName: '',
    passingYear: '',
    boardUniversity: '',
    trainingCompleted: 'Certified',
    placementStatus: 'Seeking Employment',
    employer: '',
    jobRole: '',
    location: '',
    salary: '',
    joiningDate: '',
    district: '',
    state: 'Odisha'
  });

  // Document Uploads State for Edit Modal
  const [photoDoc, setPhotoDoc] = useState('');
  const [aadharDoc, setAadharDoc] = useState('');
  const [extraDocs, setExtraDocs] = useState([]);
  const [docError, setDocError] = useState('');

  // Handle opening edit modal
  const handleOpenEdit = (plc) => {
    setEditingItem(plc);
    setEditFormData({
      id: plc.id || '',
      student: plc.student || '',
      phone: plc.phone || '',
      email: plc.email || '',
      gender: plc.gender || 'Female',
      dob: plc.dob || '',
      guardianName: plc.guardianName || '',
      course: plc.course || 'Higher Education / Skill Training',
      collegeName: plc.collegeName || plc.employer || '',
      passingYear: plc.passingYear || '',
      boardUniversity: plc.boardUniversity || '',
      trainingCompleted: plc.trainingCompleted || 'Certified',
      placementStatus: plc.placementStatus || 'Employed',
      employer: plc.employer || '',
      jobRole: plc.jobRole || '',
      location: plc.location || 'Odisha',
      salary: plc.salary || '₹15,000/mo',
      joiningDate: plc.joiningDate || new Date().toISOString().split('T')[0],
      district: plc.district || '',
      state: plc.state || 'Odisha'
    });
    setPhotoDoc(plc.photoDoc || '');
    setAadharDoc(plc.aadharDoc || '');
    setExtraDocs(plc.extraDocs || []);
    setDocError('');
  };

  // Document Upload Handlers (5MB limit)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setDocError('File size exceeds the allowed 5MB limit.');
        return;
      }
      setDocError('');
      const reader = new FileReader();
      reader.onloadend = () => setPhotoDoc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAadharUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setDocError('File size exceeds the allowed 5MB limit.');
        return;
      }
      setDocError('');
      const reader = new FileReader();
      reader.onloadend = () => setAadharDoc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddExtraDoc = () => {
    setExtraDocs(prev => [...prev, { title: '', file: '', fileName: '' }]);
  };

  const handleExtraDocTitleChange = (index, title) => {
    setExtraDocs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], title };
      return updated;
    });
  };

  const handleExtraDocFileChange = (index, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setDocError('File size exceeds the allowed 5MB limit.');
      return;
    }
    setDocError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setExtraDocs(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], file: reader.result, fileName: file.name };
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveExtraDoc = (index) => {
    setExtraDocs(prev => prev.filter((_, i) => i !== index));
  };

  // Save Placement Updates
  const handleSavePlacement = async (e) => {
    if (e) e.preventDefault();
    if (!editFormData.student.trim()) {
      notify('Please enter student name', 'error');
      return;
    }

    const updatedPlacement = {
      ...editingItem,
      ...editFormData,
      photoDoc: photoDoc || '',
      aadharDoc: aadharDoc || '',
      extraDocs: extraDocs || []
    };

    try {
      await saveToFirestore('placements', updatedPlacement, 'lvs_update_placement');
    } catch (err) {
      console.warn("Firestore update placement notice:", err);
    }

    if (setPlacements) {
      setPlacements(prev => prev.map(p => p.id === editingItem.id ? updatedPlacement : p));
    }

    notify(`Updated placement record for ${updatedPlacement.student}!`, 'success');
    setEditingItem(null);
  };

  // Delete Placement Record
  const handleDeletePlacement = async (plc) => {
    if (window.confirm(`Are you sure you want to delete placement record for ${plc.student || 'this student'}?`)) {
      const docIdToDelete = plc.firestoreId || plc.id;
      try {
        if (docIdToDelete) {
          await deleteDoc(doc(db, 'placements', docIdToDelete));
        }
      } catch (err) {
        console.warn("Firestore delete placement notice:", err);
      }

      if (setPlacements) {
        setPlacements(prev => prev.filter(p => p.id !== plc.id && (!plc.firestoreId || p.firestoreId !== plc.firestoreId)));
      }

      notify(`Deleted placement record for ${plc.student || 'student'}.`, 'info');
    }
  };

  // Get Three-Dot Action Popover Items
  const getPlacementActionItems = (plc) => [
    {
      label: 'View Student Details',
      icon: Eye,
      onClick: () => setViewingItem(plc)
    },
    {
      label: 'Edit Placement Form',
      icon: Edit,
      onClick: () => handleOpenEdit(plc)
    },
    {
      label: 'Delete Record',
      icon: Trash2,
      danger: true,
      onClick: () => handleDeletePlacement(plc)
    }
  ];

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

      {/* Placement Table */}
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
                <th className="p-4">Joining / Package</th>
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
                    <td className="p-4 font-bold text-slate-900 flex items-center space-x-2">
                      {plc.photoDoc ? (
                        <img src={plc.photoDoc} alt={plc.student} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {plc.student ? plc.student.charAt(0) : 'S'}
                        </div>
                      )}
                      <span>{plc.student}</span>
                    </td>
                    <td className="p-4 text-slate-800">{plc.course}</td>
                    <td className="p-4 text-slate-600 font-medium">{plc.trainingCompleted || 'Certified'}</td>
                    <td className="p-4">
                      <StatusBadge status={plc.placementStatus} />
                    </td>
                    <td className="p-4 font-bold text-slate-900">{plc.employer || 'Pending Placement'}</td>
                    <td className="p-4 text-slate-800">{plc.jobRole || 'Trainee'}</td>
                    <td className="p-4 text-slate-600">{plc.location || 'Odisha'}</td>
                    <td className="p-4 text-emerald-800 font-extrabold">{plc.joiningDate || '2026'} ({plc.salary || '₹15,000/mo'})</td>
                    <td className="p-4 text-right">
                      {/* THREE-DOT MENU FOR VIEW, EDIT, DELETE */}
                      <ActionPopover items={getPlacementActionItems(plc)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW STUDENT PLACEMENT DETAILS MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto space-y-0 relative">
            
            {/* Header with Visible Close X Button */}
            <div className="p-5 bg-gradient-to-r from-[#123B5D] to-[#1E527B] text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif">{viewingItem.student}</h3>
                  <p className="text-xs text-slate-200">{viewingItem.course} • ID: {viewingItem.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all cursor-pointer border border-white/20"
                title="Close"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs font-sans">
              
              {/* Section 1: Placement & Status */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#123B5D]" />
                  <span>Placement & Employment Status</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Status</span>
                    <StatusBadge status={viewingItem.placementStatus} />
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Employer / Business</span>
                    <span className="font-bold text-slate-900">{viewingItem.employer || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Job Role / Designation</span>
                    <span className="font-bold text-slate-800">{viewingItem.jobRole || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Location</span>
                    <span className="font-bold text-slate-800">{viewingItem.location || 'Odisha'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Salary / Package</span>
                    <span className="font-extrabold text-emerald-700">{viewingItem.salary || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Joining Date</span>
                    <span className="font-bold text-slate-800">{viewingItem.joiningDate || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Personal & Contact Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#123B5D]" />
                  <span>Student Personal & Contact Details</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Full Name</span>
                    <span className="font-bold text-slate-900">{viewingItem.student}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Gender</span>
                    <span className="font-semibold text-slate-800">{viewingItem.gender || 'Female'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Contact Phone</span>
                    <span className="font-mono font-bold text-emerald-700">{viewingItem.phone || '+91 9416362914'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Email Address</span>
                    <span className="font-semibold text-slate-800 truncate block">{viewingItem.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Guardian Name</span>
                    <span className="font-semibold text-slate-800">{viewingItem.guardianName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Date of Birth</span>
                    <span className="font-semibold text-slate-800">{viewingItem.dob || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Education & Qualification */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#123B5D]" />
                  <span>Education & Training Qualification</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Course / Qualification</span>
                    <span className="font-bold text-slate-900">{viewingItem.course}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Training Completion</span>
                    <span className="font-semibold text-slate-800">{viewingItem.trainingCompleted || 'Certified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">College / Institute</span>
                    <span className="font-semibold text-slate-800">{viewingItem.collegeName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Board / University</span>
                    <span className="font-semibold text-slate-800">{viewingItem.boardUniversity || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Document Verification */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#123B5D]" />
                  <span>Uploaded Documents</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Photo Document */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-700">Passport Photo</span>
                    </div>
                    {viewingItem.photoDoc ? (
                      <a href={viewingItem.photoDoc} download={`${viewingItem.student}_Photo.png`} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg hover:bg-emerald-200 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Not Uploaded</span>
                    )}
                  </div>

                  {/* Aadhar Document */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-700">Aadhar Card</span>
                    </div>
                    {viewingItem.aadharDoc ? (
                      <a href={viewingItem.aadharDoc} download={`${viewingItem.student}_Aadhar.png`} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg hover:bg-emerald-200 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Not Uploaded</span>
                    )}
                  </div>
                </div>

                {/* Extra Documents */}
                {viewingItem.extraDocs && viewingItem.extraDocs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Additional Documents</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {viewingItem.extraDocs.map((docItem, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 truncate max-w-[150px]">{docItem.title || `Document #${idx + 1}`}</span>
                          {docItem.file && (
                            <a href={docItem.file} download={docItem.fileName || `${docItem.title || 'Doc'}.png`} className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              <span>View</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT PLACEMENT FORM MODAL (DESIGNED LIKE MAIN PAGE PLACEMENT FORM WITH CLOSE X) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto relative space-y-0 font-sans">
            
            {/* Modal Header with Close X */}
            <div className="p-6 bg-gradient-to-r from-[#123B5D] via-[#1E527B] to-[#047857] text-white flex items-center justify-between relative">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-200 text-[10px] font-black px-3 py-1 rounded-full border border-white/20">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Placement Form Editor</span>
                </div>
                <h3 className="text-xl font-black font-serif tracking-wide">
                  Edit Placement Record: {editingItem.student}
                </h3>
                <p className="text-xs text-slate-200">
                  Update candidate personal details, qualification, employment status, employer offer, and documents.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500 text-white transition-all cursor-pointer border border-white/20 shrink-0"
                title="Close Form"
                aria-label="Close Form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form Body */}
            <form onSubmit={handleSavePlacement} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs">
              
              {/* Section 1: Placement & Employment Status */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-[#123B5D] uppercase tracking-wider text-xs flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#047857]" />
                  <span>1. Placement & Employment Status</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Placement Status</label>
                    <select
                      value={editFormData.placementStatus}
                      onChange={(e) => setEditFormData({ ...editFormData, placementStatus: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-[#123B5D] outline-none"
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
                    <label className="font-bold text-slate-700 block mb-1">Training Completion</label>
                    <select
                      value={editFormData.trainingCompleted}
                      onChange={(e) => setEditFormData({ ...editFormData, trainingCompleted: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-[#123B5D] outline-none"
                    >
                      <option value="Certified">Certified</option>
                      <option value="Completed Training">Completed Training</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Scholarship Requested">Scholarship Requested</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Student Personal Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#123B5D] uppercase tracking-wider text-xs flex items-center gap-2">
                  <User className="w-4 h-4 text-[#047857]" />
                  <span>2. Student Personal Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Student Name *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.student}
                      onChange={(e) => setEditFormData({ ...editFormData, student: e.target.value })}
                      placeholder="Enter Full Name"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      placeholder="+91 9416362914"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      placeholder="student@gmail.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={editFormData.guardianName}
                      onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
                      placeholder="Father / Husband Name"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editFormData.dob}
                      onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Course & Qualification */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#123B5D] uppercase tracking-wider text-xs flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#047857]" />
                  <span>3. Course & Educational Qualification</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Course / Trade / Sector</label>
                    <input
                      type="text"
                      value={editFormData.course}
                      onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })}
                      placeholder="e.g. B.Tech / Assistant Beauty Therapist"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">College / Institute Name</label>
                    <input
                      type="text"
                      value={editFormData.collegeName}
                      onChange={(e) => setEditFormData({ ...editFormData, collegeName: e.target.value })}
                      placeholder="e.g. Life Vision Society Training Center"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Board / University</label>
                    <input
                      type="text"
                      value={editFormData.boardUniversity}
                      onChange={(e) => setEditFormData({ ...editFormData, boardUniversity: e.target.value })}
                      placeholder="e.g. BPUT / NCVET / CHSE"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Passing Year</label>
                    <input
                      type="text"
                      value={editFormData.passingYear}
                      onChange={(e) => setEditFormData({ ...editFormData, passingYear: e.target.value })}
                      placeholder="2025 / 2026"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Placement Offer Details */}
              <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-[#047857] uppercase tracking-wider text-xs flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#047857]" />
                  <span>4. Employer Offer & Job Placement Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Employer / Boutique Name</label>
                    <input
                      type="text"
                      value={editFormData.employer}
                      onChange={(e) => setEditFormData({ ...editFormData, employer: e.target.value })}
                      placeholder="e.g. Cuttack Beauty Hub / Self Boutique"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Job Designation / Role</label>
                    <input
                      type="text"
                      value={editFormData.jobRole}
                      onChange={(e) => setEditFormData({ ...editFormData, jobRole: e.target.value })}
                      placeholder="e.g. Senior Beautician / Junior Developer"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Location</label>
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                      placeholder="e.g. Bhubaneswar, Odisha"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Salary / Monthly Income Package</label>
                    <input
                      type="text"
                      value={editFormData.salary}
                      onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                      placeholder="e.g. ₹15,000/mo"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={editFormData.joiningDate}
                      onChange={(e) => setEditFormData({ ...editFormData, joiningDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Document Uploads */}
              <div className="space-y-4">
                <h4 className="font-bold text-[#123B5D] uppercase tracking-wider text-xs flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#047857]" />
                  <span>5. Document Uploads (Max file size: 5MB)</span>
                </h4>

                {docError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold text-xs">
                    ⚠️ {docError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Upload */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-800 block text-xs">Upload Student Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#123B5D] file:text-white hover:file:bg-[#1E527B] cursor-pointer"
                    />
                    {photoDoc && (
                      <div className="flex items-center space-x-2 pt-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Photo Attached</span>
                      </div>
                    )}
                  </div>

                  {/* Aadhar Upload */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-800 block text-xs">Upload Aadhar Card</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleAadharUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#123B5D] file:text-white hover:file:bg-[#1E527B] cursor-pointer"
                    />
                    {aadharDoc && (
                      <div className="flex items-center space-x-2 pt-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aadhar Attached</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Extra Documents */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Add More Documents</span>
                    <button
                      type="button"
                      onClick={handleAddExtraDoc}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-[#047857] font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Document</span>
                    </button>
                  </div>

                  {extraDocs.map((docItem, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        placeholder="Document Name (e.g. Marksheet, Certificate)"
                        value={docItem.title}
                        onChange={(e) => handleExtraDocTitleChange(index, e.target.value)}
                        className="w-full sm:w-1/2 p-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleExtraDocFileChange(index, e.target.files[0])}
                        className="w-full sm:w-1/2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#123B5D] file:text-white hover:file:bg-[#1E527B] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraDoc(index)}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg shrink-0 transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#123B5D] hover:bg-[#1E527B] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Save Placement Updates</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
