import React, { useState } from 'react';
import { 
  IdCard, Clock, CheckCircle2, XCircle, Search, Filter, 
  Printer, Send, Mail, Phone, Calendar, User, Eye, Check, X 
} from 'lucide-react';
import { db, doc, updateDoc, collection, addDoc, serverTimestamp } from '../../../firebase';
import { sendStaffIdCardEmailApi, printOrSaveStaffIdCardPdf } from '../../../utils/staffIdPdfHelper';

export default function StaffIdCardModule({ 
  staffList = [], 
  setStaffList, 
  staffIdCards = [], 
  setStaffIdCards, 
  showToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Pending Approval');
  const [selectedCardStaff, setSelectedCardStaff] = useState(null);

  // Combine staff records with ID card requests from Firestore
  const allRequests = staffList.map(s => {
    const cardReq = staffIdCards.find(c => c.staffId === s.id || c.staffId === s.employeeId);
    return {
      ...s,
      requestId: cardReq?.id || cardReq?.requestId || `REQ-${s.id}`,
      cardStatus: cardReq?.status || s.approvalStatus || (s.status === 'Active' ? 'Approved' : 'Pending Approval'),
      requestDate: cardReq?.requestDate || s.registeredAt || s.joinDate || '2026-01-01'
    };
  });

  // Filter staff requests
  const filteredRequests = allRequests.filter(s => {
    const term = searchQuery.toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(term);
    const idMatch = (s.id || s.employeeId || '').toLowerCase().includes(term);
    const emailMatch = (s.email || '').toLowerCase().includes(term);
    const deptMatch = (s.department || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || idMatch || emailMatch || deptMatch;

    if (selectedStatus === 'All') return matchesSearch;
    if (selectedStatus === 'Pending Approval') {
      return matchesSearch && (s.cardStatus === 'Pending Approval' || s.approvalStatus === 'Pending');
    }
    if (selectedStatus === 'Approved' || selectedStatus === 'Generated') {
      return matchesSearch && (s.cardStatus === 'Approved' || s.cardStatus === 'Generated' || s.approvalStatus === 'Approved');
    }
    if (selectedStatus === 'Rejected') {
      return matchesSearch && (s.cardStatus === 'Rejected' || s.approvalStatus === 'Rejected');
    }
    return matchesSearch;
  });

  // Handle Approve (✓) -> Generate PDF -> Store Reference -> Send Email -> Update Status to Generated
  const handleApproveIdCard = async (staffMember) => {
    const updatedStaff = {
      ...staffMember,
      status: 'Active',
      approvalStatus: 'Approved',
      cardStatus: 'Generated',
      approvedDate: new Date().toISOString()
    };

    // 1. Update Staff list state
    if (setStaffList) {
      setStaffList(prev => prev.map(s => (s.id === updatedStaff.id || (s.firestoreId && s.firestoreId === updatedStaff.firestoreId)) ? updatedStaff : s));
    }

    // 2. Update Firestore `staff` collection
    if (staffMember.firestoreId) {
      try {
        await updateDoc(doc(db, "staff", staffMember.firestoreId), {
          status: 'Active',
          approvalStatus: 'Approved',
          cardStatus: 'Generated',
          approvedDate: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore update staff notice:", err);
      }
    }

    // 3. Save reference in Firestore `staffIdCards` collection
    try {
      await addDoc(collection(db, "staffIdCards"), {
        staffId: staffMember.id || staffMember.employeeId,
        staffName: staffMember.name,
        email: staffMember.email,
        status: 'Generated',
        requestDate: staffMember.requestDate || new Date().toISOString(),
        approvedDate: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore staffIdCards notice:", err);
    }

    // 4. Generate PDF & Send Email to Staff member's registered email
    try {
      await sendStaffIdCardEmailApi(updatedStaff);
    } catch (err) {
      console.warn("Email API notice:", err);
    }

    if (showToast) showToast(`✓ ID Card Approved & Generated for ${updatedStaff.name}! PDF sent to ${updatedStaff.email}.`, 'success');
  };

  // Handle Reject (✕)
  const handleRejectIdCard = async (staffMember) => {
    if (!window.confirm(`Are you sure you want to reject ID card request for ${staffMember.name}?`)) return;

    const updatedStaff = {
      ...staffMember,
      status: 'Rejected',
      approvalStatus: 'Rejected',
      cardStatus: 'Rejected',
      rejectedDate: new Date().toISOString()
    };

    if (setStaffList) {
      setStaffList(prev => prev.map(s => (s.id === updatedStaff.id || (s.firestoreId && s.firestoreId === updatedStaff.firestoreId)) ? updatedStaff : s));
    }

    if (staffMember.firestoreId) {
      try {
        await updateDoc(doc(db, "staff", staffMember.firestoreId), {
          status: 'Rejected',
          approvalStatus: 'Rejected',
          cardStatus: 'Rejected',
          rejectedDate: new Date().toISOString()
        });
      } catch (err) {
        console.warn("Firestore reject notice:", err);
      }
    }

    if (showToast) showToast(`✕ ID Card request for ${updatedStaff.name} rejected.`, 'info');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <IdCard className="w-4 h-4 text-emerald-600" />
            <span>Staff Identity Card Workflow</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-serif">ID Card Requests & Approval Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Workflow: Submit Request → Pending Approval → Admin Approval (✓) → PDF Generated → Emailed to Staff.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {['Pending Approval', 'Generated', 'Rejected', 'All'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedStatus === st
                  ? 'bg-[#123B5D] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
            <IdCard className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 font-serif">No ID Card Requests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No ID card requests matching the filter criteria. New requests will appear here for Admin approval.
            </p>
          </div>
        ) : (
          filteredRequests.map(s => {
            const isPending = s.cardStatus === 'Pending Approval' || s.approvalStatus === 'Pending';
            const isGenerated = s.cardStatus === 'Generated' || s.cardStatus === 'Approved' || s.approvalStatus === 'Approved';
            const isRejected = s.cardStatus === 'Rejected' || s.approvalStatus === 'Rejected';

            return (
              <div
                key={s.id || s.employeeId}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                    : isGenerated
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-rose-200 bg-rose-50/10'
                }`}
              >
                {/* Left status accent */}
                <div className={`w-1.5 absolute top-0 bottom-0 left-0 ${
                  isPending ? 'bg-amber-500' : isGenerated ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />

                {/* Staff Details */}
                <div className="flex items-start space-x-4 min-w-0 flex-1 pl-2">
                  <img
                    src={s.avatar || s.photoDoc || '/image/logo.png'}
                    alt={s.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0 bg-white shadow-sm"
                  />
                  
                  <div className="space-y-1.5 min-w-0 flex-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 truncate">{s.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-mono font-black text-2xs">
                        ID: {s.id || s.employeeId}
                      </span>

                      {/* Status Pills */}
                      {isPending && (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-black text-2xs flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {isGenerated && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-[#047857] border border-emerald-300 rounded-full font-black text-2xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#047857]" />
                          <span>Generated & PDF Emailed</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-black text-2xs flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Request Rejected</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-semibold text-slate-600">
                      <span className="text-emerald-700 font-bold">{s.role || s.designation}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-2xs font-bold border border-emerald-200">
                        {s.department}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-2xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{s.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{s.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Joined: {s.joinDate || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions (✓ Approve & ✕ Reject) */}
                <div className="flex items-center space-x-3 shrink-0 self-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 w-full md:w-auto justify-end">
                  
                  {/* Approve Button */}
                  <button
                    type="button"
                    onClick={() => handleApproveIdCard(s)}
                    className={`p-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      isGenerated
                        ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600 hover:scale-105 active:scale-95'
                    }`}
                    title="Approve ID Card, Generate PDF & Email to Staff"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-extrabold uppercase tracking-wide">
                      {isGenerated ? '✓ Re-Generate PDF' : '✓ Approve'}
                    </span>
                  </button>

                  {/* Reject Button */}
                  <button
                    type="button"
                    onClick={() => handleRejectIdCard(s)}
                    className={`p-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isRejected
                        ? 'bg-rose-100 text-rose-800 border-2 border-rose-300'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 hover:scale-105 active:scale-95'
                    }`}
                    title="Reject ID Card Request"
                  >
                    <div className="w-5 h-5 rounded-full bg-rose-200/60 flex items-center justify-center shrink-0 text-rose-700">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-extrabold uppercase tracking-wide">
                      {isRejected ? '✕ Rejected' : '✕ Reject'}
                    </span>
                  </button>

                  {/* View / Print Preview Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedCardStaff(s)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer border border-slate-200 flex items-center justify-center"
                    title="Preview Official ID Card"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Side-by-Side Front & Back ID Card Preview Modal */}
      {selectedCardStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Official Staff Identity Card</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedCardStaff.name} ({selectedCardStaff.id})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCardStaff(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Front & Back Templates */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-black text-[#047857] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  🪪 Front Side
                </span>
                <div className="relative w-[340px] h-[510px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500 bg-slate-900 shrink-0">
                  <img src="/Team Member/id_card_front.jpg" alt="Front ID Template" className="w-full h-full object-cover" />
                  <img src={selectedCardStaff.avatar || selectedCardStaff.photoDoc || '/image/logo.png'} alt={selectedCardStaff.name} className="absolute top-[154px] left-1/2 -translate-x-1/2 w-[114px] h-[114px] rounded-[18px] object-cover border-2 border-emerald-500 shadow-md bg-white z-10" />
                  <div className="absolute top-[275px] w-full text-center px-3 z-10">
                    <h4 className="text-[14px] font-black text-[#021a10] truncate">{selectedCardStaff.name}</h4>
                  </div>
                  <div className="absolute top-[293px] w-full text-center px-3 z-10">
                    <p className="text-[10px] font-extrabold text-[#047857] uppercase tracking-wide truncate">{selectedCardStaff.role || selectedCardStaff.designation}</p>
                  </div>

                  <div className="absolute top-[316px] left-[68px] right-[20px] z-10 flex flex-col gap-[3px] font-sans">
                    <div className="flex items-center text-[9.5px] leading-none">
                      <div className="w-[16px] h-[16px] rounded-full bg-[#047857] flex items-center justify-center shrink-0 mr-1.5">
                        <User className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="font-bold text-[#1e293b] w-[68px] shrink-0">Employee ID</span>
                      <span className="font-bold text-[#1e293b] mr-1.5">:</span>
                      <span className="font-extrabold text-[#0f172a] truncate max-w-[145px]">{selectedCardStaff.id}</span>
                    </div>

                    <div className="flex items-center text-[9.5px] leading-none">
                      <div className="w-[16px] h-[16px] rounded-full bg-[#047857] flex items-center justify-center shrink-0 mr-1.5">
                        <Mail className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="font-bold text-[#1e293b] w-[68px] shrink-0">Department</span>
                      <span className="font-bold text-[#1e293b] mr-1.5">:</span>
                      <span className="font-extrabold text-[#0f172a] truncate max-w-[145px]">{selectedCardStaff.department}</span>
                    </div>

                    <div className="flex items-center text-[9.5px] leading-none">
                      <div className="w-[16px] h-[16px] rounded-full bg-[#0e4b55] flex items-center justify-center shrink-0 mr-1.5">
                        <Phone className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="font-bold text-[#1e293b] w-[68px] shrink-0">Contact No.</span>
                      <span className="font-bold text-[#1e293b] mr-1.5">:</span>
                      <span className="font-extrabold text-[#0f172a] truncate max-w-[145px]">{selectedCardStaff.phone || '+91 9416362914'}</span>
                    </div>

                    <div className="flex items-center text-[9.5px] leading-none">
                      <div className="w-[16px] h-[16px] rounded-full bg-[#047857] flex items-center justify-center shrink-0 mr-1.5">
                        <Calendar className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="font-bold text-[#1e293b] w-[68px] shrink-0">Joining Date</span>
                      <span className="font-bold text-[#1e293b] mr-1.5">:</span>
                      <span className="font-extrabold text-[#0f172a] truncate max-w-[145px]">{selectedCardStaff.joinDate || '2026-01-01'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-black text-[#047857] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  📋 Back Side
                </span>
                <div className="relative w-[340px] h-[510px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500 bg-slate-900 shrink-0">
                  <img src="/Team Member/id_card_back.jpg" alt="Back ID Template" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedCardStaff(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => printOrSaveStaffIdCardPdf(selectedCardStaff)}
                className="px-5 py-2 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF ID Card</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
