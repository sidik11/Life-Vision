import React, { useState } from 'react';
import { 
  Users, UserPlus, IdCard, Calendar, FileText, 
  Building, CheckCircle2, Clock, XCircle, Search, 
  Filter, Download, Mail, Phone, MapPin, Shield, Printer, Upload,
  Edit, X, Trash2, Eye, MoreVertical
} from 'lucide-react';
import ActionPopover from '../components/Common/ActionPopover';
import { db, doc, updateDoc, deleteDoc } from '../../firebase';
import { saveToFirestore } from '../../utils/firebaseSave';

export default function StaffView({ staffList: propStaffList = [], setStaffList: propSetStaffList, activeSubTab = 'all-staff', showToast }) {
  const [subTab, setSubTab] = useState(activeSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedCardStaff, setSelectedCardStaff] = useState(null);

  // Staff members strictly from database / public registration (no static fallback mock staff)
  const allStaff = propStaffList;

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Master Trainer',
    department: 'Training',
    email: '',
    phone: '',
    bloodGroup: 'O+',
    location: 'Bhubaneswar HQ',
    emergencyContact: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && editingStaff) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingStaff({ ...editingStaff, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email || !newStaff.role) {
      if (showToast) showToast("Please fill in Staff Name, Designation and Email.", "error");
      return;
    }

    const created = {
      id: `STF-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...newStaff,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      avatar: photoPreview || '/image/logo.png'
    };

    if (propSetStaffList) {
      propSetStaffList(prev => [created, ...prev]);
    }

    try {
      await saveToFirestore('staff', created, 'lvs_new_staff');
    } catch (err) {
      console.warn("Firestore add staff notice:", err);
    }

    setShowAddModal(false);
    setNewStaff({
      name: '',
      role: 'Master Trainer',
      department: 'Training',
      email: '',
      phone: '',
      bloodGroup: 'O+',
      location: 'Bhubaneswar HQ',
      emergencyContact: ''
    });
    setPhotoPreview(null);
    if (showToast) showToast(`Staff member ${created.name} added & saved to database!`, "success");
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    if (!editingStaff || !editingStaff.name || !editingStaff.email) {
      if (showToast) showToast("Please fill in Staff Name and Email.", "error");
      return;
    }

    const updatedItem = { ...editingStaff };

    if (propSetStaffList) {
      propSetStaffList(prev => prev.map(s => (s.id === updatedItem.id || (s.firestoreId && s.firestoreId === updatedItem.firestoreId)) ? updatedItem : s));
    }

    if (updatedItem.firestoreId) {
      try {
        const cleanItem = JSON.parse(JSON.stringify(updatedItem));
        delete cleanItem.firestoreId;
        await updateDoc(doc(db, "staff", updatedItem.firestoreId), cleanItem);
      } catch (err) {
        console.warn("Firestore update staff notice:", err);
      }
    }

    setEditingStaff(null);
    if (showToast) showToast(`Staff member ${updatedItem.name} details updated!`, "success");
  };

  const handleDeleteStaff = async (staffMember) => {
    if (window.confirm(`Are you sure you want to delete staff member "${staffMember.name}" (${staffMember.id})?`)) {
      if (propSetStaffList) {
        propSetStaffList(prev => prev.filter(s => s.id !== staffMember.id && s.firestoreId !== staffMember.firestoreId));
      }
      if (staffMember.firestoreId) {
        try {
          await deleteDoc(doc(db, "staff", staffMember.firestoreId));
        } catch (err) {
          console.warn("Firestore delete staff notice:", err);
        }
      }
      if (showToast) showToast(`Staff member ${staffMember.name} deleted.`, 'info');
    }
  };

  // Printable ID Card Pop-up with official image template overlay
  const handlePrintStaffCard = (staffMember) => {
    const printWindow = window.open('', '_blank', 'width=800,height=950');
    if (!printWindow) return;

    const frontImgSrc = '/Team Member/id_card_front.jpg';
    const backImgSrc = '/Team Member/id_card_back.jpg';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Staff ID Card - ${staffMember.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; padding: 30px; margin: 0; }
            
            .card-container { width: 340px; height: 510px; position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); background: #fff; }
            .card-bg { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; z-index: 1; }

            /* Overlay Elements for Front Card */
            .photo-box { position: absolute; top: 154px; left: 50%; transform: translateX(-50%); width: 114px; height: 114px; border-radius: 18px; object-fit: cover; z-index: 10; background: #fff; border: 2px solid #10b981; }
            .staff-name { position: absolute; top: 275px; width: 100%; text-align: center; font-size: 14px; font-weight: 900; color: #021a10; z-index: 10; font-family: sans-serif; }
            .staff-role { position: absolute; top: 293px; width: 100%; text-align: center; font-size: 10px; font-weight: 800; color: #047857; z-index: 10; text-transform: uppercase; }

            .info-val-id { position: absolute; top: 323px; left: 154px; font-size: 11px; font-weight: 800; color: #0f172a; z-index: 10; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1; }
            .info-val-dept { position: absolute; top: 350px; left: 154px; font-size: 11px; font-weight: 800; color: #0f172a; z-index: 10; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .info-val-phone { position: absolute; top: 377px; left: 154px; font-size: 11px; font-weight: 800; color: #0f172a; z-index: 10; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1; }
            .info-val-date { position: absolute; top: 404px; left: 154px; font-size: 11px; font-weight: 800; color: #0f172a; z-index: 10; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1; }

            @media print {
              body { background: transparent; padding: 0; gap: 20px; }
              .card-container { page-break-after: always; box-shadow: none; border: 1px solid #ddd; }
            }
          </style>
        </head>
        <body>
          <!-- FRONT SIDE -->
          <div class="card-container">
            <img src="${frontImgSrc}" class="card-bg" alt="Front ID Template" />
            <img src="${staffMember.avatar || '/image/logo.png'}" class="photo-box" alt="Staff Photo" />
            <div class="staff-name">${staffMember.name}</div>
            <div class="staff-role">${staffMember.role}</div>
            <div class="info-val-id">${staffMember.id}</div>
            <div class="info-val-dept">${staffMember.department}</div>
            <div class="info-val-phone">${staffMember.phone || '+91 9416362914'}</div>
            <div class="info-val-date">${staffMember.joinDate || '2026-01-01'}</div>
          </div>

          <!-- BACK SIDE -->
          <div class="card-container">
            <img src="${backImgSrc}" class="card-bg" alt="Back ID Template" />
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredStaff = allStaff.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Action Menu items for Three Dots
  const getStaffActionItems = (staffMember) => [
    {
      label: 'View / Print Staff ID Card',
      icon: IdCard,
      onClick: () => setSelectedCardStaff(staffMember)
    },
    {
      label: 'Edit Staff Details',
      icon: Edit,
      onClick: () => setEditingStaff({ ...staffMember })
    },
    {
      divider: true
    },
    {
      label: 'Delete Staff Member',
      icon: Trash2,
      danger: true,
      onClick: () => handleDeleteStaff(staffMember)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123B5D] to-[#1E527B] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Human Resources & Staff Management</span>
          </div>
          <h1 className="text-2xl font-bold font-serif">Staff Members Directory</h1>
          <p className="text-slate-200 text-xs mt-1">
            Manage trainers, placement officers, center coordinators & executive staff across Odisha centers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Internal Sub-Nav Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all-staff', label: '👥 All Staff', count: allStaff.length },
          { id: 'staff-id-cards', label: '🪪 Staff ID Cards' },
          { id: 'staff-attendance', label: '📅 Attendance' },
          { id: 'leave-management', label: '🏖️ Leave Management' },
          { id: 'staff-documents', label: '📁 Documents' },
          { id: 'staff-departments', label: '🏢 Departments' },
          { id: 'staff-reports', label: '📊 Staff Reports' }
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

      {/* Main Tab Views */}
      {subTab === 'all-staff' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search staff by name, role or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-2 text-slate-700 focus:outline-none"
                >
                  <option value="All">All Departments</option>
                  <option value="Management">Management</option>
                  <option value="Training">Training</option>
                  <option value="Placement & Livelihood">Placement</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {filteredStaff.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 font-serif">No Staff Members Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No staff members registered yet. Add a new staff member using the button above or register via the portal login page.
              </p>
            </div>
          )}

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 absolute top-0 left-0 right-0" />
                
                <div className="flex items-start justify-between pt-2">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <img
                      src={staff.avatar || '/image/logo.png'}
                      alt={staff.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30 p-0.5 bg-white shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{staff.name}</h3>
                      <p className="text-xs font-semibold text-emerald-600 truncate">{staff.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                          {staff.department}
                        </span>
                        {staff.bloodGroup && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-extrabold">
                            🩸 {staff.bloodGroup}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* THREE-DOT ACTION MENU REPLACING INLINE BUTTONS */}
                  <ActionPopover items={getStaffActionItems(staff)} />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{staff.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{staff.location}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>ID: <strong>{staff.id}</strong></span>
                  <button
                    onClick={() => setSelectedCardStaff(staff)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#047857] font-bold rounded-lg flex items-center gap-1 border border-emerald-200 transition-all cursor-pointer"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>View ID Card</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAFF ID CARDS TAB */}
      {subTab === 'staff-id-cards' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-serif">Staff Official Identity Cards</h2>
              <p className="text-xs text-slate-500">Print or download official Staff ID cards overlaid on official Life Vision Society template.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-[#047857] text-xs font-black rounded-full">
              {allStaff.length} Cards Available
            </span>
          </div>

          {allStaff.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 text-center space-y-2">
              <IdCard className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No staff ID cards available. Add staff to view ID cards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allStaff.map((s) => (
                <div key={s.id} className="w-full max-w-[340px] mx-auto bg-white rounded-2xl p-4 shadow-xl border border-slate-200 relative overflow-hidden flex flex-col justify-between space-y-3">
                  
                  {/* Card Header with Three-Dot Menu */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <img src="/image/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{s.name}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">{s.role}</div>
                      </div>
                    </div>
                    {/* THREE-DOT MENU */}
                    <ActionPopover items={getStaffActionItems(s)} />
                  </div>

                  {/* ID CARD FRONT TEMPLATE PREVIEW OVERLAY */}
                  <div className="relative w-full h-[510px] rounded-xl overflow-hidden shadow-inner border border-emerald-300 bg-slate-900 shrink-0">
                    <img
                      src="/Team Member/id_card_front.jpg"
                      alt="ID Card Front Template"
                      className="w-full h-full object-cover"
                    />

                    {/* OVERLAID STAFF PHOTO */}
                    <img
                      src={s.avatar || '/image/logo.png'}
                      alt={s.name}
                      className="absolute top-[154px] left-1/2 -translate-x-1/2 w-[114px] h-[114px] rounded-[18px] object-cover border-2 border-emerald-500 shadow-md bg-white z-10"
                    />

                    {/* OVERLAID NAME & ROLE */}
                    <div className="absolute top-[275px] w-full text-center px-3 z-10">
                      <h4 className="text-[14px] font-black text-[#021a10] truncate">{s.name}</h4>
                    </div>
                    <div className="absolute top-[293px] w-full text-center px-3 z-10">
                      <p className="text-[10px] font-extrabold text-[#047857] uppercase tracking-wide truncate">{s.role}</p>
                    </div>

                    {/* OVERLAID FIELDS ALIGNED TO EXACT HORIZONTAL COLON LINE */}
                    <div className="absolute top-[323px] left-[154px] text-[11px] font-extrabold text-[#0f172a] leading-none z-10">{s.id}</div>
                    <div className="absolute top-[350px] left-[154px] text-[11px] font-extrabold text-[#0f172a] leading-none z-10 max-w-[150px] truncate">{s.department}</div>
                    <div className="absolute top-[377px] left-[154px] text-[11px] font-extrabold text-[#0f172a] leading-none z-10">{s.phone || '+91 9416362914'}</div>
                    <div className="absolute top-[404px] left-[154px] text-[11px] font-extrabold text-[#0f172a] leading-none z-10">{s.joinDate || '2026-01-01'}</div>
                  </div>

                  {/* ACTION BUTTON */}
                  <button
                    type="button"
                    onClick={() => setSelectedCardStaff(s)}
                    className="w-full py-2 px-3 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <IdCard className="w-4 h-4" />
                    <span>View Both Sides & Print</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'staff-attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 font-serif">Staff Daily Attendance Logs</h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Today: {new Date().toISOString().split('T')[0]}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Check In</th>
                  <th className="p-3">Check Out</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {allStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{s.name}</td>
                    <td className="p-3">{s.role}</td>
                    <td className="p-3 font-mono text-emerald-700">09:30 AM</td>
                    <td className="p-3 font-mono text-slate-500">05:30 PM</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                        Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(subTab === 'leave-management' || subTab === 'staff-documents' || subTab === 'staff-departments' || subTab === 'staff-reports') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <FileText className="w-12 h-12 text-[#123B5D] mx-auto opacity-80" />
          <h3 className="text-base font-bold text-slate-800 font-serif capitalize">
            {subTab.replace('-', ' ')} Overview
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Comprehensive HR analytics, leave tracking records, and compliance files are automatically linked with Life Vision Society admin portal.
          </p>
        </div>
      )}

      {/* VIEW ID CARD MODAL (SIDE-BY-SIDE FRONT & BACK TEMPLATES WITH VISIBLE CLOSE X) */}
      {selectedCardStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto">
            
            {/* Header with Visible Close (X) Button */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Official Staff Identity Card</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedCardStaff.name} ({selectedCardStaff.id})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCardStaff(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer border border-slate-200"
                title="Close Modal"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SIDE-BY-SIDE FRONT & BACK ID CARDS */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
              
              {/* FRONT SIDE CARD */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-black text-[#047857] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  🪪 Front Side ID Card
                </span>
                <div className="relative w-[340px] h-[510px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500 bg-slate-900 shrink-0">
                  <img src="/Team Member/id_card_front.jpg" alt="Front ID Template" className="w-full h-full object-cover" />
                  <img src={selectedCardStaff.avatar || '/image/logo.png'} alt={selectedCardStaff.name} className="absolute top-[154px] left-1/2 -translate-x-1/2 w-[114px] h-[114px] rounded-[18px] object-cover border-2 border-emerald-500 shadow-md bg-white z-10" />
                  <div className="absolute top-[275px] w-full text-center px-3 z-10">
                    <h4 className="text-[14px] font-black text-[#021a10] truncate">{selectedCardStaff.name}</h4>
                  </div>
                  <div className="absolute top-[293px] w-full text-center px-3 z-10">
                    <p className="text-[10px] font-extrabold text-[#047857] uppercase tracking-wide truncate">{selectedCardStaff.role}</p>
                  </div>

                  {/* OVERLAID FIELDS ALIGNED TO EXACT HORIZONTAL COLON LINE */}
                  <div className="absolute top-[323px] left-[154px] text-[11px] font-extrabold text-[#0f172a] leading-none z-10">{selectedCardStaff.id}</div>
                  <div className="absolute top-[350px] left-[154px] text-[11px] font-extrabold text-[#0f172a] leading-none z-10 max-w-[150px] truncate">{selectedCardStaff.department}</div>
                  <div className="absolute top-[377px] left-[154px] text-[11px] font-extrabold text-[#0f172a] leading-none z-10">{selectedCardStaff.phone || '+91 9416362914'}</div>
                  <div className="absolute top-[404px] left-[154px] text-[11px] font-extrabold text-[#0f172a] leading-none z-10">{selectedCardStaff.joinDate || '2026-01-01'}</div>
                </div>
              </div>

              {/* BACK SIDE CARD */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs font-black text-[#047857] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  📋 Back Side ID Card
                </span>
                <div className="relative w-[340px] h-[510px] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500 bg-slate-900 shrink-0">
                  <img src="/Team Member/id_card_back.jpg" alt="Back ID Template" className="w-full h-full object-cover" />
                </div>
              </div>

            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedCardStaff(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => handlePrintStaffCard(selectedCardStaff)}
                className="px-5 py-2.5 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official ID Card</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD STAFF MODAL WITH CLOSE (X) BUTTON */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800 font-serif">Add New Staff Member</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="Enter Staff Full Name"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    placeholder="Enter Role Designation"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Department *</label>
                  <select
                    value={newStaff.department}
                    onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="Training">Training</option>
                    <option value="Placement & Livelihood">Placement</option>
                    <option value="Operations">Operations</option>
                    <option value="Management">Management</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="Enter Email Address"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="Enter Mobile Number"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Blood Group</label>
                  <select
                    value={newStaff.bloodGroup}
                    onChange={(e) => setNewStaff({ ...newStaff, bloodGroup: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Center / Location</label>
                  <input
                    type="text"
                    value={newStaff.location}
                    onChange={(e) => setNewStaff({ ...newStaff, location: e.target.value })}
                    placeholder="Enter Center / Location"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Emergency Contact</label>
                <input
                  type="text"
                  value={newStaff.emergencyContact}
                  onChange={(e) => setNewStaff({ ...newStaff, emergencyContact: e.target.value })}
                  placeholder="+91 9416362914"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Photo Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full mt-1 p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123B5D] hover:bg-[#0E2F4A] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL FOR ADMIN */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800 font-serif">Edit Staff Member Details</h3>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStaffSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.role || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Department *</label>
                  <select
                    value={editingStaff.department || 'Training'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="Training">Training</option>
                    <option value="Placement & Livelihood">Placement</option>
                    <option value="Operations">Operations</option>
                    <option value="Management">Management</option>
                    <option value="Finance">Finance</option>
                    <option value="IT & Support">IT & Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingStaff.email || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.phone || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Blood Group</label>
                  <select
                    value={editingStaff.bloodGroup || 'O+'}
                    onChange={(e) => setEditingStaff({ ...editingStaff, bloodGroup: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Center / Location</label>
                  <input
                    type="text"
                    value={editingStaff.location || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, location: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Emergency Contact</label>
                <input
                  type="text"
                  value={editingStaff.emergencyContact || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, emergencyContact: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Update Staff Photo</label>
                <div className="flex items-center gap-3 mt-1">
                  <img
                    src={editingStaff.avatar || '/image/logo.png'}
                    alt="Current"
                    className="w-10 h-10 rounded-lg object-cover ring-2 ring-emerald-500 shrink-0 bg-white"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoUpload}
                    className="w-full p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Update Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
