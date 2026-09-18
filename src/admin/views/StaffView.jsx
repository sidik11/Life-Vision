import React, { useState } from 'react';
import { 
  Users, UserPlus, IdCard, Calendar, FileText, 
  Building, CheckCircle2, Clock, XCircle, Search, 
  Filter, Download, Mail, Phone, MapPin, Shield
} from 'lucide-react';

export default function StaffView({ activeSubTab = 'all-staff', showToast }) {
  const [subTab, setSubTab] = useState(activeSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Initial Staff Dataset
  const [staffList, setStaffList] = useState([
    {
      id: "STF-2026-001",
      name: "Dr. Sunita Sharma",
      role: "Executive Director",
      department: "Management",
      email: "sunita.sharma@lifevisionsociety.org",
      phone: "+91 98610 11223",
      location: "Bhubaneswar HQ",
      joinDate: "2021-04-10",
      status: "Active",
      avatar: "/image/logo.png"
    },
    {
      id: "STF-2026-002",
      name: "Priya Ranjita Das",
      role: "Senior Master Trainer",
      department: "Training",
      email: "priya.das@lifevisionsociety.org",
      phone: "+91 97780 22334",
      location: "Cuttack Skill Hub",
      joinDate: "2022-06-15",
      status: "Active",
      avatar: "/beautician_training.jpg"
    },
    {
      id: "STF-2026-003",
      name: "Rajesh Kumar Mohanty",
      role: "Placement Officer",
      department: "Placement & Livelihood",
      email: "rajesh.placement@lifevisionsociety.org",
      phone: "+91 94370 33445",
      location: "Bhubaneswar HQ",
      joinDate: "2023-01-20",
      status: "Active",
      avatar: "/success_story.jpg"
    },
    {
      id: "STF-2026-004",
      name: "Anita Behera",
      role: "Center Coordinator",
      department: "Operations",
      email: "anita.behera@lifevisionsociety.org",
      phone: "+91 91240 44556",
      location: "Puri Center",
      joinDate: "2023-09-01",
      status: "Active",
      avatar: "/computer_lab.jpg"
    },
    {
      id: "STF-2026-005",
      name: "Sanjay Kumar Swain",
      role: "Finance & Accounts Lead",
      department: "Finance",
      email: "accounts@lifevisionsociety.org",
      phone: "+91 98530 55667",
      location: "Bhubaneswar HQ",
      joinDate: "2022-11-12",
      status: "Active",
      avatar: "/image/logo.png"
    }
  ]);

  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    department: 'Training',
    email: '',
    phone: '',
    location: 'Bhubaneswar HQ'
  });

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) {
      if (showToast) showToast("Please fill in Staff Name and Email.", "error");
      return;
    }

    const created = {
      id: `STF-2026-00${staffList.length + 1}`,
      ...newStaff,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      avatar: '/image/logo.png'
    };

    setStaffList([created, ...staffList]);
    setShowAddModal(false);
    setNewStaff({ name: '', role: '', department: 'Training', email: '', phone: '', location: 'Bhubaneswar HQ' });
    if (showToast) showToast(`Staff member ${created.name} added successfully!`, "success");
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
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
          { id: 'all-staff', label: '👥 All Staff', count: staffList.length },
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

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 absolute top-0 left-0 right-0" />
                
                <div className="flex items-start space-x-3 pt-2">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30 p-0.5 bg-white shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{staff.name}</h3>
                    <p className="text-xs font-semibold text-emerald-600 truncate">{staff.role}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                      {staff.department}
                    </span>
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
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">
                    {staff.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'staff-id-cards' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 font-serif">Staff Official Identity Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((s) => (
              <div key={s.id} className="w-full max-w-sm mx-auto bg-gradient-to-b from-[#123B5D] to-[#0E2F4A] rounded-2xl p-5 text-white shadow-xl border border-emerald-500/30 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <img src="/image/logo.png" alt="Logo" className="w-7 h-7 object-contain bg-white rounded-lg p-0.5" />
                    <div>
                      <div className="text-xs font-bold">Life Vision Society</div>
                      <div className="text-[9px] text-emerald-300">Staff ID Card</div>
                    </div>
                  </div>
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <img src={s.avatar} alt={s.name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/50 bg-white p-1" />
                  <h3 className="text-base font-bold text-white mt-1">{s.name}</h3>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-extrabold border border-emerald-500/40">
                    {s.role}
                  </div>
                  <div className="text-xs text-slate-300">{s.department} • {s.location}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>ID: {s.id}</span>
                  <span>Joined: {s.joinDate}</span>
                </div>
              </div>
            ))}
          </div>
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
                {staffList.map((s, idx) => (
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

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 font-serif">Add New Staff Member</h3>
            <form onSubmit={handleAddStaffSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name</label>
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
                  <label className="text-xs font-bold text-slate-700">Role / Designation</label>
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
                  <label className="text-xs font-bold text-slate-700">Department</label>
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
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
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
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="+91 98610 xxxxx"
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Center / Location</label>
                <input
                  type="text"
                  value={newStaff.location}
                  onChange={(e) => setNewStaff({ ...newStaff, location: e.target.value })}
                  placeholder="e.g. Bhubaneswar HQ / Cuttack Skill Hub"
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123B5D] hover:bg-[#0E2F4A] text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
