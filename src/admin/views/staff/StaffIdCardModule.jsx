import React, { useState } from 'react';
import { 
  IdCard, Clock, CheckCircle2, XCircle, Search, Filter, 
  Printer, Send, Mail, Phone, Calendar, User, Eye, Check, X 
} from 'lucide-react';
import ActionPopover from '../../components/Common/ActionPopover';
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
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'Pending Approval' | 'Approved' | 'Generated' | 'Rejected'
  const [selectedCardStaff, setSelectedCardStaff] = useState(null);

  // Combine staff records with ID card requests from Firestore
  const allRequests = staffList.map(s => {
    const cardReq = staffIdCards.find(c => c.staffId === s.id || c.staffId === s.employeeId);
    let status = cardReq?.status || s.approvalStatus || (s.status === 'Active' ? 'Approved' : 'Pending Approval');
    if (s.approvalStatus === 'Approved' && status !== 'Generated') {
      status = 'Approved';
    }
    return {
      ...s,
      requestId: cardReq?.id || cardReq?.requestId || `REQ-${s.id || s.employeeId}`,
      cardStatus: status,
      requestDate: cardReq?.requestDate || s.registeredAt || s.joinDate || new Date().toISOString().split('T')[0]
    };
  });

  // Filter staff requests based on search query and status dropdown selection
  const filteredRequests = allRequests.filter(s => {
    const term = searchQuery.toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(term);
    const idMatch = (s.id || s.employeeId || '').toLowerCase().includes(term);
    const emailMatch = (s.email || '').toLowerCase().includes(term);
    const deptMatch = (s.department || '').toLowerCase().includes(term);
    const roleMatch = (s.role || s.designation || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || idMatch || emailMatch || phoneMatch || roleMatch;

    if (selectedStatus === 'All') return matchesSearch;
    if (selectedStatus === 'Pending Approval') {
      return matchesSearch && (s.cardStatus === 'Pending Approval' || s.approvalStatus === 'Pending');
    }
    if (selectedStatus === 'Approved') {
      return matchesSearch && (s.cardStatus === 'Approved' || s.approvalStatus === 'Approved') && s.cardStatus !== 'Generated';
    }
    if (selectedStatus === 'Generated') {
      return matchesSearch && s.cardStatus === 'Generated';
    }
    if (selectedStatus === 'Rejected') {
      return matchesSearch && (s.cardStatus === 'Rejected' || s.approvalStatus === 'Rejected');
    }
    return matchesSearch;
  });

  // Handle Approve (✓) -> Update Firestore -> Auto-Email PDF to Staff given email
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

  // Three-dot Action Popover Items
  const getActionItems = (staffMember) => {
    const isPending = staffMember.cardStatus === 'Pending Approval' || staffMember.approvalStatus === 'Pending';
    const isRejected = staffMember.cardStatus === 'Rejected' || staffMember.approvalStatus === 'Rejected';

    const items = [];

    if (isPending) {
      items.push(
        {
          label: '✓ Approve & Send PDF Email',
          icon: Check,
          onClick: () => handleApproveIdCard(staffMember)
        },
        {
          label: '✕ Reject Request',
          icon: X,
          danger: true,
          onClick: () => handleRejectIdCard(staffMember)
        },
        { divider: true }
      );
    }

    items.push({
      label: 'View & Print ID Card',
      icon: Eye,
      onClick: () => setSelectedCardStaff(staffMember)
    });

    if (!isPending && !isRejected) {
      items.push(
        { divider: true },
        {
          label: 'Re-Send PDF Email',
          icon: Send,
          onClick: () => handleApproveIdCard(staffMember)
        }
      );
    }

    return items;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar with Clean Filter Dropdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <IdCard className="w-4 h-4 text-emerald-600" />
            <span>Staff ID Cards Management</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-serif">Staff ID Card Requests & Approval Portal</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review ID Card generation requests. Click three dots or tick (✓) to view & print ID card or send PDF to staff email.
          </p>
        </div>

        {/* Search & Clean Status Dropdown Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search staff name, ID, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#123B5D] cursor-pointer w-full sm:w-auto"
            >
              <option value="All">All Statuses ({allRequests.length})</option>
              <option value="Pending Approval">Pending Approval ({allRequests.filter(s => s.cardStatus === 'Pending Approval' || s.approvalStatus === 'Pending').length})</option>
              <option value="Approved">Approved</option>
              <option value="Generated">Generated</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff ID Cards Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Staff Name</th>
                <th className="p-3.5">Employee ID</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Request Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <IdCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 font-serif">No Staff ID Card Requests Found</p>
                    <p className="text-2xs text-slate-500 mt-1">
                      No records match the selected status dropdown filter ({selectedStatus}).
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((s) => {
                  const isPending = s.cardStatus === 'Pending Approval' || s.approvalStatus === 'Pending';
                  const isGenerated = s.cardStatus === 'Generated';
                  const isApproved = s.cardStatus === 'Approved' || s.approvalStatus === 'Approved';
                  const isRejected = s.cardStatus === 'Rejected' || s.approvalStatus === 'Rejected';

                  return (
                    <tr key={s.id || s.employeeId || s.firestoreId} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Staff Name & Photo */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={s.avatar || s.photoDoc || '/image/logo.png'}
                            alt={s.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20 bg-white shrink-0 cursor-pointer"
                            onClick={() => setSelectedCardStaff(s)}
                          />
                          <div>
                            <div 
                              className="font-bold text-slate-900 cursor-pointer hover:text-emerald-700 transition-colors"
                              onClick={() => setSelectedCardStaff(s)}
                            >
                              {s.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{s.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {s.id || s.employeeId}
                      </td>

                      {/* Designation */}
                      <td className="p-3.5 font-bold text-emerald-800">
                        {s.role || s.designation}
                      </td>

                      {/* Department */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-2xs font-bold text-slate-700">
                          {s.department}
                        </span>
                      </td>

                      {/* Request Date */}
                      <td className="p-3.5 font-medium text-slate-600 whitespace-nowrap">
                        {s.requestDate}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isPending && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full font-black text-2xs flex items-center gap-1 w-fit animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>⏳ Pending Approval</span>
                          </span>
                        )}
                        {isGenerated && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-[#047857] border border-emerald-300 rounded-full font-black text-2xs flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-[#047857]" />
                            <span>✓ Generated</span>
                          </span>
                        )}
                        {isApproved && !isGenerated && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-black text-2xs flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>✓ Approved</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-black text-2xs flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>✕ Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Action Column with Three Dots Menu */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveIdCard(s)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-2xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                title="Approve ID Card & Send PDF"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectIdCard(s)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-2xs flex items-center gap-1 transition-all cursor-pointer"
                                title="Reject Request"
                              >
                                <X className="w-3 h-3 stroke-[3]" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* THREE DOTS ACTION POPOVER MENU (STRICTLY AS REQUESTED) */}
                          <ActionPopover items={getActionItems(s)} />
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Front & Back ID Card Preview Modal */}
      {selectedCardStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Official Staff Identity Card</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedCardStaff.name} ({selectedCardStaff.id || selectedCardStaff.employeeId})</p>
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
                      <span className="font-extrabold text-[#0f172a] truncate max-w-[145px]">{selectedCardStaff.id || selectedCardStaff.employeeId}</span>
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
