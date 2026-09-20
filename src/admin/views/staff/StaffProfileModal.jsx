import React from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, Building, IdCard, 
  CheckCircle2, Clock, XCircle, FileText, Shield, X, Heart, Printer 
} from 'lucide-react';
import { printOrSaveStaffIdCardPdf } from '../../../utils/staffIdPdfHelper';

export default function StaffProfileModal({ 
  staff, 
  onClose, 
  attendance = [], 
  leaves = [], 
  staffDocuments = [] 
}) {
  if (!staff) return null;

  // Filter records for this staff member
  const staffId = staff.id || staff.employeeId;
  const staffAttendance = attendance.filter(a => a.staffId === staffId || a.staffName === staff.name);
  const staffLeaves = leaves.filter(l => l.staffId === staffId || l.staffName === staff.name);
  const docs = staffDocuments.filter(d => d.staffId === staffId || d.staffName === staff.name);

  // Attendance stats calculation
  const totalDays = staffAttendance.length;
  const presentDays = staffAttendance.filter(a => a.status === 'Present').length;
  const absentDays = staffAttendance.filter(a => a.status === 'Absent').length;
  const leaveDays = staffAttendance.filter(a => a.status === 'Leave').length;
  const halfDays = staffAttendance.filter(a => a.status === 'Half Day').length;
  const attendancePct = totalDays > 0 
    ? Math.round(((presentDays + halfDays * 0.5) / totalDays) * 100) 
    : 100;

  // Leave stats
  const totalAppliedLeaves = staffLeaves.length;
  const approvedLeaves = staffLeaves.filter(l => l.status === 'Approved').length;
  const pendingLeaves = staffLeaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-6 relative my-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-4">
            <img
              src={staff.avatar || staff.photoDoc || '/image/logo.png'}
              alt={staff.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 p-0.5 bg-white shrink-0 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 font-serif">{staff.name}</h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-[#047857] font-mono font-black rounded-md text-xs">
                  {staff.id || staff.employeeId}
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-700 mt-0.5">{staff.role || staff.designation}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-2xs font-bold border border-slate-200">
                  🏢 {staff.department}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-2xs font-bold border ${
                  staff.status === 'Active' || staff.approvalStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : staff.status === 'Pending Approval' || staff.approvalStatus === 'Pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  ● {staff.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabbed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          
          {/* 1. Personal & Contact Information */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 text-emerald-800">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Personal & Contact Information</span>
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Full Name:</span>
                <span className="font-bold text-slate-900">{staff.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Father/Mother Name:</span>
                <span className="font-medium text-slate-800">{staff.parentName || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Date of Birth:</span>
                <span className="font-medium text-slate-800">{staff.dob || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Gender:</span>
                <span className="font-medium text-slate-800">{staff.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Blood Group:</span>
                <span className="font-bold text-rose-700">🩸 {staff.bloodGroup || 'O+'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Email:</span>
                <span className="font-bold text-emerald-700">{staff.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Mobile Number:</span>
                <span className="font-bold text-slate-900">{staff.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Emergency Contact:</span>
                <span className="font-medium text-slate-800">{staff.emergencyContact || '+91 9416362914'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Address / Location:</span>
                <span className="font-medium text-slate-800 text-right max-w-xs">{staff.location || staff.address || 'Odisha'}</span>
              </div>
            </div>
          </div>

          {/* 2. Employment Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 text-emerald-800">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Employment & ID Card Status</span>
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Employee ID:</span>
                <span className="font-mono font-bold text-slate-900">{staff.id || staff.employeeId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Designation:</span>
                <span className="font-bold text-slate-900">{staff.role || staff.designation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Department:</span>
                <span className="font-bold text-[#047857]">{staff.department}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Joining Date:</span>
                <span className="font-medium text-slate-800">{staff.joinDate || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Employment Type:</span>
                <span className="font-medium text-slate-800">{staff.employmentType || 'Full Time'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-semibold">Work Location:</span>
                <span className="font-medium text-slate-800">{staff.location || 'Odisha Center'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">ID Card Status:</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-2xs">
                  {staff.approvalStatus || 'Approved & Generated'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => printOrSaveStaffIdCardPdf(staff)}
              className="w-full mt-3 py-2 px-3 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download Official ID Card</span>
            </button>
          </div>

          {/* 3. Attendance Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 text-emerald-800">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Attendance Summary</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-lg font-black text-emerald-700 block">{presentDays}</span>
                <span className="text-[10px] font-bold text-slate-500">Present</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-lg font-black text-rose-700 block">{absentDays}</span>
                <span className="text-[10px] font-bold text-slate-500">Absent</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-lg font-black text-amber-700 block">{leaveDays}</span>
                <span className="text-[10px] font-bold text-slate-500">Leave</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
              <span>Overall Attendance Score:</span>
              <span className="text-sm font-black">{attendancePct}%</span>
            </div>
          </div>

          {/* 4. Leave & Documents Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 text-emerald-800">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Leaves & Uploaded Documents</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-base font-black text-slate-800 block">{totalAppliedLeaves}</span>
                <span className="text-[10px] font-semibold text-slate-500">Applied</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-base font-black text-emerald-700 block">{approvedLeaves}</span>
                <span className="text-[10px] font-semibold text-slate-500">Approved</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-base font-black text-amber-700 block">{pendingLeaves}</span>
                <span className="text-[10px] font-semibold text-slate-500">Pending</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="font-bold text-slate-700 block mb-1">Uploaded Attachments ({docs.length + (staff.aadharDoc ? 1 : 0)}):</span>
              <div className="flex flex-wrap gap-1.5">
                {staff.aadharDoc && (
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-600" /> Aadhaar Card
                  </span>
                )}
                {docs.map((d, idx) => (
                  <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-emerald-600" /> {d.documentName || d.documentType || 'Doc'}
                  </span>
                ))}
                {(!staff.aadharDoc && docs.length === 0) && (
                  <span className="text-2xs text-slate-400 font-medium italic">No documents uploaded yet.</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
