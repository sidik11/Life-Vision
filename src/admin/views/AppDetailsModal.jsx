import React, { useState } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import { 
  X, User, Mail, Phone, MapPin, GraduationCap, Calendar, 
  FileCheck, CheckCircle2, Award, Clock, ArrowRight, Check, Ban, Printer, Building, FileText
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

  const handlePrintApp = () => {
    window.print();
  };

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
      fileUrl = application.photo || '/image/logo.png';
    }

    setPreviewFile({
      key,
      val,
      url: fileUrl
    });
  };

  const candidateName = application.name || application.studentName || application.fullName || 'Student Applicant';
  const guardianName = application.guardianName || application.fatherName || application.fatherGuardianName || application.parentName || 'N/A';
  const phoneNum = application.mobile || application.phone || 'N/A';
  const emailAddr = application.email || 'N/A';
  const displayCenter = (application.preferredCenter && application.preferredCenter !== 'LVS Skill Training Center') ? application.preferredCenter : (application.center || 'N/A');
  const displayBatch = (application.preferredBatch && application.preferredBatch !== 'Standard Batch') ? application.preferredBatch : (application.batch || 'N/A');

  const timelineSteps = [
    { step: 1, label: 'Application Submitted', date: application.applicationDate || 'Submitted', done: application.timelineStep >= 1 },
    { step: 2, label: 'Under Review', date: 'Document Verification', done: application.timelineStep >= 2 },
    { step: 3, label: 'Shortlisted', date: 'Interview Scheduled', done: application.timelineStep >= 3 },
    { step: 4, label: 'Selected', date: 'Enrolled in LVS', done: application.timelineStep >= 4 },
    { step: 5, label: 'Batch Assigned', date: displayBatch, done: application.timelineStep >= 5 }
  ];

  return (
    <>
      {/* SCREEN VIEW MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:hidden font-sans">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto space-y-0 text-slate-900">
          
          {/* Header Bar */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-[#123B5D] to-[#6B1D52] text-white flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={application.photo || '/image/logo.png'} 
                alt={candidateName} 
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30 bg-white p-0.5" 
              />
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold font-serif text-white">{candidateName}</h2>
                  <StatusBadge status={application.status} />
                </div>
                <p className="text-xs text-pink-200 font-mono mt-0.5">
                  Application ID: {application.id || 'APP-LVS-000'} • Applied on {application.applicationDate || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Print Button */}
              <button
                onClick={handlePrintApp}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Quick Contact & Action Bar */}
          <div className="p-4 bg-gradient-to-r from-pink-50/70 via-white to-pink-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              {phoneNum !== 'N/A' && (
                <a
                  href={`tel:${phoneNum}`}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ({phoneNum})</span>
                </a>
              )}
              {emailAddr !== 'N/A' && (
                <a
                  href={`mailto:${emailAddr}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email ({emailAddr})</span>
                </a>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Course:</span>
              <span className="px-3 py-1 bg-pink-100 text-[#6B1D52] font-black rounded-lg text-xs border border-pink-200">
                {application.course || 'Training Course'}
              </span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto text-left">
            
            {/* Application Timeline Progress */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider font-serif">Application Timeline Progress</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                {timelineSteps.map((s) => (
                  <div key={s.step} className="flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 space-y-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      s.done 
                        ? 'bg-[#6B1D52] text-white ring-4 ring-pink-100' 
                        : 'bg-slate-200 text-slate-600 border border-slate-300'
                    }`}>
                      {s.done ? <Check className="w-4 h-4 text-pink-300" /> : s.step}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${s.done ? 'text-slate-900' : 'text-slate-500'}`}>{s.label}</div>
                      <div className="text-[10px] text-slate-500">{s.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid: Personal Info & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Personal Information */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="text-xs font-black text-[#6B1D52] uppercase tracking-wider font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-[#C52B75]" /> Personal Information
                </h4>

                <div className="space-y-2 text-xs text-slate-700 font-medium">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Gender & Age:</span>
                    <span className="font-bold text-slate-900">{application.gender || 'Female'}, {application.age || 22} Yrs</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Father / Guardian:</span>
                    <span className="font-bold text-slate-900">{guardianName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Mobile Number:</span>
                    <span className="font-mono font-bold text-slate-900">{phoneNum}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-bold text-slate-900">{emailAddr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">District & State:</span>
                    <span className="font-bold text-slate-900">{application.district || 'Bhubaneswar'}, {application.state || 'Odisha'}</span>
                  </div>
                </div>
              </div>

              {/* Education & Preferences */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                <h4 className="text-xs font-black text-[#6B1D52] uppercase tracking-wider font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
                  <GraduationCap className="w-4 h-4 text-[#C52B75]" /> Education & Preferences
                </h4>

                <div className="space-y-2 text-xs text-slate-700 font-medium">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Qualification:</span>
                    <span className="font-bold text-slate-900">{application.qualification || 'Higher Secondary'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">School / College:</span>
                    <span className="font-bold text-slate-900">{application.institution || application.boardUniversity || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Applied Course:</span>
                    <span className="font-extrabold text-[#6B1D52]">{application.course || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Preferred Center:</span>
                    <span className="font-bold text-slate-900">{displayCenter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Batch:</span>
                    <span className="font-extrabold text-emerald-700">{displayBatch}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Submitted Verification Documents */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-black text-[#6B1D52] uppercase tracking-wider font-serif flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#C52B75]" /> Submitted Candidate Verification Documents
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Student Photo */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Candidate Photo</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Submitted</span>
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate mt-1">
                      {application.uploadedPhotoName || 'Applicant Photo'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePreviewDoc('photo', application.uploadedPhotoName || 'Candidate Photo')}
                    className="w-full text-xs text-[#C52B75] font-bold hover:bg-pink-50 py-1.5 px-3 rounded-xl border border-pink-200 transition-all cursor-pointer flex items-center justify-center space-x-1 mt-2"
                  >
                    <span>View Photo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C52B75]" />
                  </button>
                </div>

                {/* 2. Aadhaar Card */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">2. Aadhaar Card / ID</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate mt-1">
                      {application.uploadedAadhaarName || 'Aadhaar Card Copy'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePreviewDoc('idProof', application.uploadedAadhaarName || 'Aadhaar Card')}
                    className="w-full text-xs text-[#C52B75] font-bold hover:bg-pink-50 py-1.5 px-3 rounded-xl border border-pink-200 transition-all cursor-pointer flex items-center justify-center space-x-1 mt-2"
                  >
                    <span>View Aadhaar</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C52B75]" />
                  </button>
                </div>

                {/* 3. Qualification Marksheet */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">3. Qualification Marksheet</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate mt-1">
                      {application.uploadedMarksheetName || '10th / 12th Marksheet'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePreviewDoc('educationCertificate', application.uploadedMarksheetName || 'Educational Certificate')}
                    className="w-full text-xs text-[#C52B75] font-bold hover:bg-pink-50 py-1.5 px-3 rounded-xl border border-pink-200 transition-all cursor-pointer flex items-center justify-center space-x-1 mt-2"
                  >
                    <span>View Marksheet</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C52B75]" />
                  </button>
                </div>

              </div>
            </div>

          </div>

          {/* Action Footer Buttons */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (onUpdateStatus) onUpdateStatus(application.id, 'Shortlisted', 3);
                }}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Shortlist Candidate
              </button>
              <button
                onClick={() => {
                  if (onUpdateStatus) onUpdateStatus(application.id, 'Selected', 4);
                }}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Select Candidate
              </button>
              <button
                onClick={() => {
                  if (onUpdateStatus) onUpdateStatus(application.id, 'Rejected', 1);
                }}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Reject Candidate
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrintApp}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print Application</span>
              </button>

              <button
                onClick={() => setShowBatchAssignModal(true)}
                className="px-4 py-2 bg-[#6B1D52] hover:bg-[#8C246B] text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-pink-300" />
                <span>Assign Batch</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* DOCUMENT PREVIEW SUB-MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans print:hidden">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative border border-pink-100 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#C52B75] uppercase tracking-wider bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100 font-serif">
                  Document Preview & Verification
                </span>
                <h3 className="text-base font-bold text-slate-900 font-serif mt-1">{candidateName} • {previewFile.key}</h3>
                <p className="text-xs text-slate-500 font-medium">{previewFile.val}</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 rounded-2xl flex items-center justify-center min-h-[300px]">
              <img src={previewFile.url} alt="Document" className="max-h-[60vh] object-contain rounded-xl shadow-md" />
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY APPLICATION SUMMARY FORM */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 text-black font-sans z-[99999]">
        <div className="max-w-3xl mx-auto border-2 border-black p-8 rounded-none space-y-6 bg-white text-black">
          
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <div className="flex items-center space-x-3">
              <img src="/image/logo.png" alt="Life Vision Society Logo" className="h-16 w-auto" />
              <div>
                <h1 className="text-xl font-black font-serif uppercase">LIFE VISION SOCIETY</h1>
                <p className="text-xs font-bold">Government Recognized NGO | Training & Skill Development</p>
                <p className="text-[10px] text-slate-600 font-mono">Official Training Candidate Application Record</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold border border-black px-2 py-1">
                ID: {application.id || 'APP-LVS-000'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-medium border-b border-slate-300 pb-4">
            <div><strong>Candidate Name:</strong> {candidateName}</div>
            <div><strong>Father / Guardian:</strong> {guardianName}</div>
            <div><strong>Applied Course:</strong> {application.course || 'N/A'}</div>
            <div><strong>Mobile Number:</strong> {phoneNum}</div>
            <div><strong>Email Address:</strong> {emailAddr}</div>
            <div><strong>Gender & Age:</strong> {application.gender || 'Female'}, {application.age || 22} Yrs</div>
            <div><strong>Application Date:</strong> {application.applicationDate || 'N/A'}</div>
            <div><strong>State:</strong> {application.state || 'Odisha'}</div>
            <div><strong>District:</strong> {application.district || 'Bhubaneswar'}</div>
          </div>

          <div className="space-y-2 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-black border-b border-black pb-1">Academic & Center Details</h3>
            <p><strong>Highest Qualification:</strong> {application.qualification || 'Higher Secondary'}</p>
            <p><strong>College / Board:</strong> {application.institution || application.boardUniversity || 'N/A'}</p>
            <p><strong>Preferred Center:</strong> {displayCenter}</p>
            <p><strong>Assigned Batch:</strong> {displayBatch}</p>
          </div>

          <div className="pt-8 grid grid-cols-2 text-center text-xs font-bold border-t-2 border-black">
            <div>
              <p className="border-t border-black w-40 mx-auto pt-1">Student Signature</p>
            </div>
            <div>
              <p className="border-t border-black w-40 mx-auto pt-1">NGO Verifier Stamp</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
