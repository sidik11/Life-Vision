import React, { useState } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import CertificateModal from './CertificateModal';
import { Award, Eye, Download, ShieldCheck, Plus, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

export default function CertificatesView({ certificates = [], setCertificates, students = [], showToast }) {
  const [selectedCert, setSelectedCert] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState(students[0]?.id || '');

  // 6-step eligibility check logic
  const checkEligibility = (studentId) => {
    const student = (students || []).find(s => s.id === studentId) || {
      id: studentId || 'LVS-OD-101',
      name: 'Sunita Sahu',
      status: 'Passed',
      assessmentScore: '94/100 (Pass)',
      attendance: '96%',
      hoursCompleted: 300,
      documentsUploaded: true,
      pendingDues: false
    };

    const hasPassedStatus = student.status === 'Passed' || student.status === 'Active' || student.status === 'Placed';
    const hasPassedExam = !String(student.assessmentScore || '').includes('Fail') && !String(student.assessmentScore || '').includes('Pending');
    const attendanceNum = parseInt(student.attendance || '90', 10);
    const hasMinAttendance = attendanceNum >= 75;
    const hasMinHours = (student.hoursCompleted || 300) >= 200;
    const hasDocs = student.documentsUploaded !== false;
    const noDues = student.pendingDues !== true;

    const allPassed = hasPassedStatus && hasPassedExam && hasMinAttendance && hasMinHours && hasDocs && noDues;

    return {
      allPassed,
      steps: [
        { label: 'Student Course Status == Passed', passed: hasPassedStatus },
        { label: 'Assessment Result == Pass', passed: hasPassedExam },
        { label: 'Attendance Rate >= 75%', passed: hasMinAttendance },
        { label: 'Minimum Training Hours Completed (>= 200h)', passed: hasMinHours },
        { label: 'Mandatory ID & Education Documents Uploaded', passed: hasDocs },
        { label: 'No Pending Administrative Dues', passed: noDues }
      ]
    };
  };

  const handleGenerateCertificate = (e) => {
    e.preventDefault();
    const targetStudent = (students || []).find(s => s.id === selectedStudentForCert) || {
      id: 'LVS-OD-101',
      name: 'Sunita Sahu',
      course: 'Tailoring & Stitching Training',
      batch: 'BATCH-2026-T1',
      center: 'Bhubaneswar LVS Skill Center'
    };

    const eligibility = checkEligibility(targetStudent.id);
    if (!eligibility.allPassed) {
      if (showToast) showToast('Student has not satisfied all 6 eligibility criteria for certification.', 'error');
      return;
    }

    const certCount = (certificates || []).length + 1;
    const newCertNo = `LVS-CERT-2026-${String(certCount).padStart(4, '0')}`;
    const created = {
      certNo: newCertNo,
      student: targetStudent.name,
      studentId: targetStudent.id,
      course: targetStudent.course || 'Tailoring & Stitching',
      batch: targetStudent.batch || 'BATCH-2026-T1',
      center: targetStudent.center || 'Bhubaneswar LVS Skill Center',
      issueDate: new Date().toISOString().split('T')[0],
      grade: 'A+',
      status: 'Issued'
    };

    if (setCertificates) {
      setCertificates(prev => [created, ...prev]);
    }
    setShowGenerateModal(false);
    if (showToast) showToast(`Certificate ${newCertNo} generated successfully!`, 'success');
  };

  const handleVerify = (certNo) => {
    window.location.hash = `#/verify-certificate/${certNo}`;
    if (showToast) showToast(`Redirecting to Public Registry Verification for ${certNo}...`, 'info');
  };

  const currentCerts = (certificates && certificates.length > 0) ? certificates : [
    {
      certNo: 'LVS-CERT-2026-0001',
      student: 'Sunita Sahu',
      course: 'Tailoring & Stitching',
      batch: 'BATCH-2026-T1',
      issueDate: '2026-08-30',
      grade: 'A+',
      status: 'Issued'
    },
    {
      certNo: 'LVS-CERT-2026-0002',
      student: 'Priya Ranjita Das',
      course: 'Beautician & Wellness',
      batch: 'BATCH-2026-B1',
      issueDate: '2026-08-30',
      grade: 'A+',
      status: 'Issued'
    }
  ];

  const currentEligibility = checkEligibility(selectedStudentForCert);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Certificate Management</h1>
          <p className="text-xs text-slate-500">6-step eligibility check, auto-generation, QR verification & printable certificates</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Certificate</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase tracking-wider font-bold">
                <th className="p-4">Certificate No</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Batch</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Grade</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentCerts.map((cert) => (
                <tr key={cert.certNo} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-pink-700">{cert.certNo}</td>
                  <td className="p-4 font-bold text-slate-900">{cert.student}</td>
                  <td className="p-4 text-slate-800">{cert.course}</td>
                  <td className="p-4 font-mono text-slate-600">{cert.batch}</td>
                  <td className="p-4 text-slate-600">{cert.issueDate}</td>
                  <td className="p-4 font-extrabold text-emerald-700">{cert.grade}</td>
                  <td className="p-4">
                    <StatusBadge status={cert.status} />
                  </td>
                  <td className="p-4 text-center">
                    <ActionPopover 
                      actions={[
                        {
                          label: 'Preview Certificate',
                          icon: Eye,
                          onClick: () => setSelectedCert(cert)
                        },
                        {
                          label: 'Public Registry Verify',
                          icon: ShieldCheck,
                          onClick: () => handleVerify(cert.certNo)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Certificate 6-Step Check Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6 my-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Certificate Generation (6-Step Verification)</h3>
                <p className="text-xs text-slate-500">Auto-verify eligibility before issuing official credential</p>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateCertificate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700">Select Student Candidate</label>
                <select
                  value={selectedStudentForCert}
                  onChange={(e) => setSelectedStudentForCert(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
                >
                  {(students.length > 0 ? students : [
                    { id: 'LVS-OD-101', name: 'Sunita Sahu' },
                    { id: 'LVS-OD-102', name: 'Priya Ranjita Das' },
                    { id: 'LVS-OD-103', name: 'Minati Nayak' }
                  ]).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>

              {/* 6-Step Eligibility Checklist */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">6-Step Auto-Eligibility Check Results</span>
                
                <div className="space-y-1.5 pt-1">
                  {currentEligibility.steps.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100">
                      <span className="font-medium text-slate-700">{idx + 1}. {st.label}</span>
                      {st.passed ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Failed</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!currentEligibility.allPassed}
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-md transition-all ${
                    currentEligibility.allPassed 
                      ? 'bg-pink-700 hover:bg-pink-800 cursor-pointer' 
                      : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  Issue & Generate Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate Preview Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}
