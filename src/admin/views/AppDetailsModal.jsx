import React, { useState } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import { 
  X, User, Mail, Phone, MapPin, GraduationCap, Calendar, 
  FileCheck, CheckCircle2, Award, Clock, ArrowRight, Check, Ban
} from 'lucide-react';

export default function AppDetailsModal({ application, onClose, onUpdateStatus, onAssignBatch }) {
  if (!application) return null;

  const [selectedBatch, setSelectedBatch] = useState(application.preferredBatch || 'BATCH-2026-T1 (Morning)');
  const [showBatchAssignModal, setShowBatchAssignModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [verifiedDocs, setVerifiedDocs] = useState(() => {
    const initial = {};
    if (application && application.documents) {
      Object.entries(application.documents).forEach(([k, v]) => {
        if (String(v).toLowerCase().includes('verified')) {
          initial[k] = true;
        }
      });
    }
    return initial;
  });

  const isDocUploaded = (key, val) => {
    if (!val) return false;
    const strVal = String(val).trim().toLowerCase();

    if (
      strVal.includes('not provided') || 
      strVal.includes('not uploaded') || 
      strVal === 'none' || 
      strVal === 'n/a'
    ) {
      return false;
    }

    if (key === 'idProof' || key.toLowerCase().includes('id') || key.toLowerCase().includes('aadhaar')) {
      if (application.uploadedAadhaar === null) return false;
      if (strVal.includes('optional') && !strVal.includes('uploaded') && !application.uploadedAadhaar) return false;
    }

    if (key === 'educationCertificate' || key.toLowerCase().includes('education') || key.toLowerCase().includes('marksheet')) {
      if (application.uploadedMarksheet === null) return false;
      if (strVal.includes('optional') && !strVal.includes('uploaded') && !application.uploadedMarksheet) return false;
    }

    if (key === 'photo') {
      if (application.uploadedPhoto === null) return false;
      if (strVal.includes('optional') && !strVal.includes('uploaded') && !application.uploadedPhoto && !application.photo) return false;
    }

    if (strVal.includes('optional') && !strVal.includes('uploaded')) {
      return false;
    }

    return true;
  };

  const uploadedDocEntries = Object.entries(application.documents || {}).filter(([key, val]) => isDocUploaded(key, val));

  const handleApproveDoc = (docKey) => {
    setVerifiedDocs(prev => ({ ...prev, [docKey]: true }));
    if (onUpdateStatus) {
      onUpdateStatus(application.id, 'Under Review', Math.max(application.timelineStep || 1, 2));
    }
  };

  const handleRejectDoc = (docKey) => {
    setVerifiedDocs(prev => ({ ...prev, [docKey]: false }));
    if (onUpdateStatus) {
      onUpdateStatus(application.id, 'Rejected', 1);
    }
  };

  const handlePreviewDoc = (key, val) => {
    let fileUrl = null;

    if (key === 'photo') {
      fileUrl = application.uploadedPhoto || application.photo;
    } else if (key === 'idProof' || key.toLowerCase().includes('id') || key.toLowerCase().includes('aadhaar')) {
      fileUrl = application.uploadedAadhaar;
    } else if (key === 'educationCertificate' || key.toLowerCase().includes('education') || key.toLowerCase().includes('marksheet')) {
      fileUrl = application.uploadedMarksheet;
    }

    if (!fileUrl) {
      fileUrl = application.photo || '/hero_training.png';
    }

    setPreviewFile({
      key,
      val,
      url: fileUrl
    });
  };

  const timelineSteps = [
    { step: 1, label: 'Application Submitted', date: application.applicationDate, done: application.timelineStep >= 1 },
    { step: 2, label: 'Under Review', date: 'Document Verification', done: application.timelineStep >= 2 },
    { step: 3, label: 'Shortlisted', date: 'Interview Scheduled', done: application.timelineStep >= 3 },
    { step: 4, label: 'Selected', date: 'Enrolled in LVS', done: application.timelineStep >= 4 },
    { step: 5, label: 'Batch Assigned', date: application.preferredBatch || 'Assigned', done: application.timelineStep >= 5 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#2C221E]/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#FFFDF9] border border-[#E5DDD0] rounded-3xl shadow-2xl overflow-hidden my-auto space-y-0 text-[#2C221E]">
        
        {/* Header */}
        <div className="p-6 bg-[#FAF6EE] border-b border-[#E5DDD0] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={application.photo} 
              alt={application.name} 
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#E5DDD0]" 
            />
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-[#2C221E]">{application.name}</h2>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-xs text-[#8C756B] font-mono mt-0.5">
                ID: {application.id} • Applied on {application.applicationDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8C756B] hover:text-[#2C221E] rounded-xl hover:bg-[#F5EFE6] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          
          {/* Application Timeline Progress */}
          <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-[#E5DDD0] space-y-4">
            <h3 className="text-xs font-bold text-[#8C756B] uppercase tracking-wider">Application Timeline Progress</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
              {timelineSteps.map((s) => (
                <div key={s.step} className="flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 space-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    s.done 
                      ? 'bg-[#3D0A2E] text-white ring-4 ring-[#FAF0E6]' 
                      : 'bg-[#EFE6D8] text-[#8C756B] border border-[#DCD0C0]'
                  }`}>
                    {s.done ? <Check className="w-4 h-4 text-[#F472B6]" /> : s.step}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${s.done ? 'text-[#2C221E]' : 'text-[#8C756B]'}`}>{s.label}</div>
                    <div className="text-[10px] text-[#8C756B]">{s.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid: Personal Info & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-[#E5DDD0] space-y-4">
              <h4 className="text-xs font-bold text-[#C52B75] uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> Personal Information
              </h4>

              <div className="space-y-2.5 text-xs text-[#5C4A42]">
                <div className="flex justify-between border-b border-[#E5DDD0] pb-1.5">
                  <span className="text-[#8C756B]">Gender & Age:</span>
                  <span className="font-semibold text-[#2C221E]">{application.gender}, {application.age} Yrs (DOB: {application.dob})</span>
                </div>
                <div className="flex justify-between border-b border-[#E5DDD0] pb-1.5">
                  <span className="text-[#8C756B]">Mobile Number:</span>
                  <span className="font-semibold text-[#2C221E]">{application.mobile}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5DDD0] pb-1.5">
                  <span className="text-[#8C756B]">Email Address:</span>
                  <span className="font-semibold text-[#2C221E]">{application.email}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5DDD0] pb-1.5">
                  <span className="text-[#8C756B]">Full Address:</span>
                  <span className="font-semibold text-[#2C221E] text-right">{application.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C756B]">District & State:</span>
                  <span className="font-semibold text-[#2C221E]">{application.district}, {application.state} - {application.pincode}</span>
                </div>
              </div>
            </div>

            {/* Education & Preferences */}
            <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-[#E5DDD0] space-y-4">
              <h4 className="text-xs font-bold text-[#C52B75] uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Education & Course Preferences
              </h4>

              <div className="space-y-2.5 text-xs text-[#5C4A42]">
                <div className="flex justify-between border-b border-[#E5DDD0] pb-1.5">
                  <span className="text-[#8C756B]">Qualification:</span>
                  <span className="font-semibold text-[#2C221E]">{application.qualification}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5DDD0] pb-1.5">
                  <span className="text-[#8C756B]">School / College:</span>
                  <span className="font-semibold text-[#2C221E]">{application.institution} ({application.passingYear})</span>
                </div>
                <div className="flex justify-between border-b border-[#E5DDD0] pb-1.5">
                  <span className="text-[#8C756B]">Applied Course:</span>
                  <span className="font-bold text-[#2C221E]">{application.course}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5DDD0] pb-1.5">
                  <span className="text-[#8C756B]">Preferred Center:</span>
                  <span className="font-semibold text-[#2C221E]">{application.preferredCenter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C756B]">Preferred Batch:</span>
                  <span className="font-semibold text-[#047857]">{application.preferredBatch}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Uploaded Documents */}
          <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-[#E5DDD0] space-y-3">
            <h4 className="text-xs font-bold text-[#C52B75] uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4" /> Uploaded Verification Documents
            </h4>

            {uploadedDocEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {uploadedDocEntries.map(([key, val]) => {
                  const isVerified = verifiedDocs[key] || String(val).toLowerCase().includes('verified');
                  return (
                    <div key={key} className="p-3 bg-[#FFFDF9] border border-[#E5DDD0] rounded-xl space-y-1 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold text-[#8C756B]">{key}</span>
                          {isVerified ? (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md">
                              Review Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-[#2C221E] truncate mt-1">{val}</p>
                      </div>
                      
                      <button 
                        onClick={() => handlePreviewDoc(key, val)}
                        className="text-[10px] text-[#C52B75] font-bold hover:underline cursor-pointer flex items-center space-x-1 pt-1 mt-1 border-t border-[#F3EBE0]"
                      >
                        <span>Preview & Verify</span>
                        <ArrowRight className="w-3 h-3 text-[#C52B75]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-[#FFFDF9] border border-dashed border-[#E5DDD0] rounded-xl text-center">
                <p className="text-xs text-[#8C756B] font-semibold">
                  No additional verification documents uploaded by candidate (Document uploads were optional during registration).
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Action Footer Buttons */}
        <div className="p-6 bg-[#FAF6EE] border-t border-[#E5DDD0] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateStatus(application.id, 'Shortlisted', 3)}
              className="px-4 py-2.5 bg-[#F3E8FF] hover:bg-[#E9D5FF] text-[#6B21A8] border border-[#DDD6FE] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              [ Shortlist ]
            </button>
            <button
              onClick={() => onUpdateStatus(application.id, 'Selected', 4)}
              className="px-4 py-2.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              [ Select Candidate ]
            </button>
            <button
              onClick={() => onUpdateStatus(application.id, 'Rejected', 1)}
              className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              [ Reject ]
            </button>
          </div>

          <button
            onClick={() => setShowBatchAssignModal(true)}
            className="px-5 py-2.5 bg-[#3D0A2E] hover:bg-[#5A1644] text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Award className="w-4 h-4 text-[#F472B6]" />
            <span>[ Assign Batch ]</span>
          </button>
        </div>

      </div>

      {/* DOCUMENT PREVIEW SUB-MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative border border-pink-100 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#C52B75] uppercase tracking-wider bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100 font-serif">
                  Document Preview & Verification
                </span>
                <h3 className="text-base font-bold text-slate-900 font-serif mt-1">{application.name} • {previewFile.key}</h3>
                <p className="text-xs text-slate-500 font-medium">{previewFile.val}</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Document Verification Controls */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-[#C52B75]" />
                <div>
                  <span className="text-xs font-bold text-slate-800">Verification Status: </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                    verifiedDocs[previewFile.key] 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {verifiedDocs[previewFile.key] ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Approved & Verified</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Under Review</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleApproveDoc(previewFile.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs ${
                    verifiedDocs[previewFile.key]
                      ? 'bg-emerald-700 text-white shadow-inner'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Approve & Verify Document</span>
                </button>
                <button
                  onClick={() => handleRejectDoc(previewFile.key)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                >
                  <Ban className="w-4 h-4" />
                  <span>✕ Reject Document</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl min-h-[260px] border border-slate-200">
              {previewFile.url && (previewFile.url.startsWith('data:image') || previewFile.url.endsWith('.png') || previewFile.url.endsWith('.jpg') || previewFile.url.endsWith('.jpeg')) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.key}
                  className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-md border border-slate-200"
                />
              ) : previewFile.url && previewFile.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewFile.url}
                  title={previewFile.key}
                  className="w-full h-[55vh] rounded-xl border border-slate-200"
                />
              ) : (
                <div className="text-center space-y-3 py-6">
                  <FileCheck className="w-12 h-12 text-[#C52B75] mx-auto opacity-75" />
                  <p className="text-xs text-slate-700 font-bold">Document Available for Viewing</p>
                  <p className="text-xs text-slate-500 font-medium">{previewFile.val}</p>
                  {previewFile.url && (
                    <a
                      href={previewFile.url}
                      target="_blank"
                      rel="noreferrer"
                      download={`${application.name}_${previewFile.key}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C52B75] to-[#A82260] text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition-all"
                    >
                      <span>Open / Download File</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {previewFile.url ? (
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noreferrer"
                  download={`${application.name}_${previewFile.key}`}
                  className="text-xs font-bold text-[#2563EB] hover:underline"
                >
                  Download File
                </a>
              ) : <div />}
              <button
                onClick={() => setPreviewFile(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Batch Sub-modal */}
      {showBatchAssignModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#2C221E]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFDF9] border border-[#E5DDD0] rounded-2xl p-6 space-y-5 text-[#2C221E]">
            <h3 className="text-lg font-bold text-[#2C221E]">Assign Training Batch</h3>
            <p className="text-xs text-[#8C756B]">Select an active or upcoming batch for {application.name}.</p>
            
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full p-3 bg-[#FAF6EE] border border-[#E5DDD0] rounded-xl text-xs font-semibold text-[#2C221E] focus:outline-none"
            >
              <option value="BATCH-2026-T1 (Morning)">BATCH-2026-T1 (Morning) - Bhubaneswar Hub</option>
              <option value="BATCH-2026-B1 (Afternoon)">BATCH-2026-B1 (Afternoon) - Cuttack Hub</option>
              <option value="BATCH-2026-A1 (Full Day)">BATCH-2026-A1 (Full Day) - Puri Hub</option>
              <option value="BATCH-2026-H1 (Morning)">BATCH-2026-H1 (Morning) - Ganjam Hub</option>
            </select>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowBatchAssignModal(false)}
                className="px-4 py-2 bg-[#F5EFE6] hover:bg-[#EFE6D8] text-[#5C4A42] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onAssignBatch(application.id, selectedBatch);
                  setShowBatchAssignModal(false);
                }}
                className="px-4 py-2 bg-[#3D0A2E] hover:bg-[#5A1644] text-white rounded-xl text-xs font-bold shadow-md"
              >
                Confirm Batch Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
