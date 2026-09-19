import React, { useState } from 'react';
import { 
  Users, UserPlus, IdCard, Calendar, FileText, 
  Building, CheckCircle2, Clock, XCircle, Search, 
  Filter, Download, Mail, Phone, MapPin, Shield, Printer, Upload,
  Edit, X
} from 'lucide-react';
import { db, doc, updateDoc } from '../../firebase';
import { saveToFirestore } from '../../utils/firebaseSave';

export default function StaffView({ staffList: propStaffList = [], setStaffList: propSetStaffList, activeSubTab = 'all-staff', showToast }) {
  const [subTab, setSubTab] = useState(activeSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Staff members strictly from database / registration (no default static mock staff)
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

  const handlePrintStaffCard = (staffMember) => {
    const printWindow = window.open('', '_blank', 'width=650,height=750');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Staff ID Card - ${staffMember.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
            .id-card { width: 340px; background: linear-gradient(135deg, #021a10 0%, #053221 60%, #047857 100%); color: white; border-radius: 20px; padding: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); border: 2px solid #10b981; text-align: center; box-sizing: border-box; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-bottom: 14px; text-align: left; }
            .logo { height: 34px; background: white; padding: 3px 6px; border-radius: 8px; }
            .org-name { font-size: 13px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; }
            .sub-header { font-size: 10px; color: #6ee7b7; font-weight: 700; text-transform: uppercase; }
            .photo { width: 90px; height: 90px; border-radius: 18px; object-fit: cover; border: 3px solid #10b981; margin: 0 auto 10px auto; display: block; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
            .name { font-size: 17px; font-weight: 900; color: #ffffff; margin: 2px 0; }
            .role { display: inline-block; padding: 3px 12px; background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid #10b981; margin-bottom: 12px; }
            .info-table { width: 100%; text-align: left; font-size: 11px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 8px; }
            .info-row { display: flex; justify-content: space-between; padding: 3px 0; }
            .info-label { color: #a7f3d0; font-weight: 600; }
            .info-val { color: #ffffff; font-weight: 700; text-align: right; }
            .footer { margin-top: 12px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 9px; color: #a7f3d0; text-align: center; }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <div>
                <div class="org-name">LIFE VISION SOCIETY</div>
                <div class="sub-header">Official Staff Identity Card</div>
              </div>
              <img src="/image/logo.png" class="logo" alt="Logo" />
            </div>
            <img src="${staffMember.avatar || '/image/logo.png'}" class="photo" alt="Staff Photo" />
            <div class="name">${staffMember.name}</div>
            <div class="role">${staffMember.role}</div>
            <div class="info-table">
              <div class="info-row"><span class="info-label">Staff ID:</span><span class="info-val">${staffMember.id}</span></div>
              <div class="info-row"><span class="info-label">Department:</span><span class="info-val">${staffMember.department}</span></div>
              <div class="info-row"><span class="info-label">Blood Group:</span><span class="info-val">${staffMember.bloodGroup || 'O+'}</span></div>
              <div class="info-row"><span class="info-label">Joining Date:</span><span class="info-val">${staffMember.joinDate || '2026-01-01'}</span></div>
              <div class="info-row"><span class="info-label">Location:</span><span class="info-val">${staffMember.location || 'Bhubaneswar HQ'}</span></div>
              <div class="info-row"><span class="info-label">Phone:</span><span class="info-val">${staffMember.phone || '+91 9416362914'}</span></div>
              <div class="info-row"><span class="info-label">Emergency Contact:</span><span class="info-val">${staffMember.emergencyContact || staffMember.phone || '+91 9416362914'}</span></div>
            </div>
            <div class="footer">
              Property of Life Vision Society • Authorised Staff • Emergency Helpline: +91 9416362914
            </div>
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
                
                <div className="flex items-start space-x-3 pt-2">
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
                  <div className="flex items-center space-x-2">
                    {/* EDIT STAFF BUTTON */}
                    <button
                      onClick={() => handleOpenEditModal(staff)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg flex items-center gap-1 border border-amber-200 transition-all cursor-pointer"
                      title="Edit Staff Details"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    {/* PRINT ID CARD BUTTON */}
                    <button
                      onClick={() => handlePrintStaffCard(staff)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#047857] font-bold rounded-lg flex items-center gap-1 border border-emerald-200 transition-all cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>ID Card</span>
                    </button>
                  </div>
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
              <p className="text-xs text-slate-500">Print or download official Staff ID cards with photo and employee details.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-[#047857] text-xs font-black rounded-full">
              {allStaff.length} Cards Generated
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
                <div key={s.id} className="w-full max-w-sm mx-auto bg-gradient-to-b from-[#123B5D] via-[#0E2F4A] to-[#047857] rounded-2xl p-5 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <div className="flex items-center space-x-2">
                      <img src="/image/logo.png" alt="Logo" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
                      <div>
                        <div className="text-xs font-bold">Life Vision Society</div>
                        <div className="text-[9px] text-emerald-300">Official Staff ID Card</div>
                      </div>
                    </div>
                    <Shield className="w-5 h-5 text-amber-400" />
                  </div>

                  <div className="flex flex-col items-center text-center space-y-2">
                    <img src={s.avatar || '/image/logo.png'} alt={s.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-400 bg-white p-1 shadow-md" />
                    <h3 className="text-base font-bold text-white mt-1">{s.name}</h3>
                    <div className="px-3 py-1 bg-emerald-500/25 text-emerald-200 rounded-full text-xs font-extrabold border border-emerald-400/50">
                      {s.role}
                    </div>
                    <div className="text-xs text-slate-300">{s.department} • {s.location}</div>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-[11px] space-y-1 text-slate-200">
                    <div className="flex justify-between font-mono">
                      <span className="text-emerald-300">Staff ID:</span>
                      <span className="font-bold">{s.id}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-emerald-300">Blood Group:</span>
                      <span className="font-bold">{s.bloodGroup || 'O+'}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-emerald-300">Joined:</span>
                      <span>{s.joinDate || '2026-01-01'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(s)}
                      className="w-1/3 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintStaffCard(s)}
                      className="w-2/3 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print ID Card</span>
                    </button>
                  </div>
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

      {/* ADD STAFF MODAL WITH CLEAR CLOSE (X) BUTTON */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 relative">
            
            {/* Modal Header with Close (X) Button */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800 font-serif">Add New Staff Member</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                title="Close"
                aria-label="Close"
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
                  placeholder="e.g. Ramesh Chandra Das"
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
                    placeholder="e.g. Master Trainer"
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
                    placeholder="name@lifevisionsociety.org"
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
                    placeholder="+91 98610 xxxxx"
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
                    placeholder="e.g. Bhubaneswar HQ"
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
                  className="w-full mt-1 p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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
            
            {/* Modal Header with Close (X) Button */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-800 font-serif">Edit Staff Member Details</h3>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                title="Close"
                aria-label="Close"
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
