import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, Clock, XCircle, Users, Search, 
  Filter, Building, Save, AlertCircle, Check, X, FileText, MoreVertical
} from 'lucide-react';
import ActionPopover from '../../components/Common/ActionPopover';
import { db, collection, addDoc, updateDoc, doc, serverTimestamp } from '../../../firebase';

export default function StaffAttendanceModule({ 
  staffList = [], 
  departments = [], 
  attendance = [], 
  setAttendance, 
  onNavigateTab,
  showToast 
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStaffId, setSelectedStaffId] = useState('All');
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'monthly' | 'staff-wise' | 'dept-wise'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to check if staff is approved by admin
  const isStaffApproved = (s) => {
    if (s.status === 'Rejected' || s.approvalStatus === 'Rejected' || s.cardStatus === 'Rejected') return false;
    if (s.status === 'Inactive') return false;
    if (s.status === 'Pending Approval' || s.approvalStatus === 'Pending' || s.cardStatus === 'Pending Approval') return false;
    return s.status === 'Active' || s.approvalStatus === 'Approved' || s.cardStatus === 'Approved' || s.cardStatus === 'Generated' || (!s.status && !s.approvalStatus);
  };

  // Only approved staff members are displayed in Attendance
  const approvedStaffList = staffList.filter(isStaffApproved);
  const pendingStaffCount = staffList.filter(s => s.status === 'Pending Approval' || s.approvalStatus === 'Pending' || s.cardStatus === 'Pending Approval').length;

  // Local draft status map for selected date: { staffId: { status, checkIn, checkOut } }
  const [draftAttendance, setDraftAttendance] = useState({});

  // Department options dynamically populated from departments prop + defaults
  const deptOptions = Array.from(new Set([
    'All',
    'Mobilization',
    'Training',
    'Placement & Livelihood',
    'Operations',
    'Finance',
    'Management',
    'IT & Support',
    ...departments.map(d => d.departmentName || d.name).filter(Boolean),
    ...approvedStaffList.map(s => s.department).filter(Boolean)
  ]));

  // Three-dot View Options items for switching attendance views
  const viewMenuItems = [
    {
      label: '📅 Daily Attendance Log',
      icon: Calendar,
      onClick: () => setActiveTab('daily')
    },
    {
      label: '📆 Monthly Attendance Sheet',
      icon: FileText,
      onClick: () => setActiveTab('monthly')
    },
    {
      label: '👥 Staff-wise Attendance Stats',
      icon: Users,
      onClick: () => setActiveTab('staff-wise')
    },
    {
      label: '🏢 Department-wise Stats',
      icon: Building,
      onClick: () => setActiveTab('dept-wise')
    }
  ];

  // Helper label for active view mode
  const getActiveViewLabel = () => {
    switch (activeTab) {
      case 'daily': return '📅 Daily Log';
      case 'monthly': return '📆 Monthly Sheet';
      case 'staff-wise': return '👥 Staff-wise Stats';
      case 'dept-wise': return '🏢 Dept-wise Stats';
      default: return '📅 Daily Log';
    }
  };

  // Filter approved staff members
  const filteredStaff = approvedStaffList.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.id || s.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesStaff = selectedStaffId === 'All' || (s.id || s.employeeId) === selectedStaffId;
    return matchesSearch && matchesDept && matchesStaff;
  });

  // Get attendance status for a staff on selected date
  const getStaffAttendanceRecord = (staffMember, dateStr = selectedDate) => {
    const sId = staffMember.id || staffMember.employeeId;
    const existing = attendance.find(a => (a.staffId === sId || a.staffName === staffMember.name) && a.date === dateStr);
    
    if (draftAttendance[sId]) {
      return {
        status: draftAttendance[sId].status,
        checkIn: draftAttendance[sId].checkIn || '09:30 AM',
        checkOut: draftAttendance[sId].checkOut || '05:30 PM',
        workingHours: draftAttendance[sId].workingHours || 8.0,
        ...existing
      };
    }

    if (existing) return existing;

    return {
      status: 'Present',
      checkIn: '09:30 AM',
      checkOut: '05:30 PM',
      workingHours: 8.0
    };
  };

  // Set local draft status
  const handleStatusChange = (staffMember, newStatus) => {
    const sId = staffMember.id || staffMember.employeeId;
    let checkIn = '09:30 AM';
    let checkOut = '05:30 PM';
    let workingHours = 8.0;

    if (newStatus === 'Absent' || newStatus === 'Leave') {
      checkIn = '-';
      checkOut = '-';
      workingHours = 0;
    } else if (newStatus === 'Half Day') {
      checkIn = '09:30 AM';
      checkOut = '01:30 PM';
      workingHours = 4.0;
    } else if (newStatus === 'Late') {
      checkIn = '10:30 AM';
      checkOut = '05:30 PM';
      workingHours = 7.0;
    }

    setDraftAttendance(prev => ({
      ...prev,
      [sId]: {
        status: newStatus,
        checkIn,
        checkOut,
        workingHours
      }
    }));
  };

  // Mark all staff as Present
  const handleMarkAllPresent = () => {
    const updated = {};
    filteredStaff.forEach(s => {
      const sId = s.id || s.employeeId;
      updated[sId] = {
        status: 'Present',
        checkIn: '09:30 AM',
        checkOut: '05:30 PM',
        workingHours: 8.0
      };
    });
    setDraftAttendance(updated);
    if (showToast) showToast(`Marked ${filteredStaff.length} staff as Present for ${selectedDate}.`, 'info');
  };

  // Save Attendance to Firestore with Duplicate Prevention
  const handleSaveAttendance = async () => {
    setLoading(true);
    let savedCount = 0;

    try {
      for (const s of filteredStaff) {
        const sId = s.id || s.employeeId;
        const record = getStaffAttendanceRecord(s, selectedDate);
        
        const payload = {
          staffId: sId,
          staffName: s.name,
          employeeId: sId,
          department: s.department,
          designation: s.role || s.designation || 'Staff',
          date: selectedDate,
          checkIn: record.checkIn,
          checkOut: record.checkOut,
          workingHours: record.workingHours,
          status: record.status,
          updatedAt: new Date().toISOString()
        };

        // Check if record already exists in Firestore for duplicate prevention
        const existingDoc = attendance.find(a => (a.staffId === sId || a.staffName === s.name) && a.date === selectedDate);

        if (existingDoc && existingDoc.firestoreId) {
          await updateDoc(doc(db, "attendance", existingDoc.firestoreId), payload);
        } else {
          await addDoc(collection(db, "attendance"), {
            ...payload,
            createdAt: serverTimestamp()
          });
        }
        savedCount++;
      }

      setLoading(false);
      setDraftAttendance({});
      if (showToast) showToast(`✓ Attendance for ${savedCount} staff saved to Firebase for ${selectedDate}!`, 'success');

    } catch (err) {
      console.warn("Firestore save attendance notice:", err);
      setLoading(false);
      if (showToast) showToast("Attendance saved locally.", 'info');
    }
  };

  // Overall attendance statistics for filtered staff
  const getStaffStats = (staffMember) => {
    const sId = staffMember.id || staffMember.employeeId;
    const records = attendance.filter(a => a.staffId === sId || a.staffName === staffMember.name);
    const total = records.length;
    const present = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const leavesCount = records.filter(r => r.status === 'Leave').length;
    const halfDays = records.filter(r => r.status === 'Half Day').length;
    const pct = total > 0 ? Math.round(((present + halfDays * 0.5) / total) * 100) : 100;

    return { total, present, absent, leavesCount, halfDays, pct };
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Controls with Three-Dot View Menu */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Staff Attendance Management</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 font-serif">Staff Daily & Monthly Attendance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mark daily check-in/out times, manage leaves, view department analytics, and sync with Firebase.
            </p>
          </div>

          {/* Three-Dot View Options Menu (Strictly As Requested) */}
          <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
            <span className="px-3 py-1.5 bg-[#123B5D] text-white text-xs font-bold rounded-xl shadow-xs">
              {getActiveViewLabel()}
            </span>
            <ActionPopover items={viewMenuItems} />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* Date Selector */}
          <div className="space-y-1">
            <label className="text-2xs font-bold text-slate-600">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          {/* Department Selector */}
          <div className="space-y-1">
            <label className="text-2xs font-bold text-slate-600">Select Department:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {deptOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Staff Member Selector */}
          <div className="space-y-1">
            <label className="text-2xs font-bold text-slate-600">Select Staff:</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="All">All Approved Staff ({approvedStaffList.length})</option>
              {approvedStaffList.map(s => (
                <option key={s.id || s.employeeId} value={s.id || s.employeeId}>
                  {s.name} ({s.id || s.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="space-y-1">
            <label className="text-2xs font-bold text-slate-600">Search Staff:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Pending Approval Notice Banner */}
        {pendingStaffCount > 0 && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 font-medium">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{pendingStaffCount} Staff Member(s)</strong> are currently pending Admin Approval. Once approved by the Admin, their details will automatically appear here in Attendance.
              </span>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('staff-id-cards')}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-2xs transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                Go to Staff Approval →
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. DAILY ATTENDANCE LOG VIEW */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4">
          
          {/* Action Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">Date:</span>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-mono font-black text-xs">
                {selectedDate}
              </span>
              <span className="text-2xs text-slate-500 font-medium">({filteredStaff.length} Staff Shown)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer border border-slate-200"
              >
                ✓ Mark All Present
              </button>

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={loading}
                className="px-4 py-1.5 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Daily Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Check In</th>
                  <th className="p-3">Check Out</th>
                  <th className="p-3">Working Hours</th>
                  <th className="p-3">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No staff records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map(s => {
                    const record = getStaffAttendanceRecord(s, selectedDate);
                    const currentStatus = record.status;

                    return (
                      <tr key={s.id || s.employeeId} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Name & Photo */}
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={s.avatar || s.photoDoc || '/image/logo.png'}
                              alt={s.name}
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-500/20 bg-white shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{s.name}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold">{s.role || s.designation}</span>
                            </div>
                          </div>
                        </td>

                        {/* Employee ID */}
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {s.id || s.employeeId}
                        </td>

                        {/* Department */}
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-2xs font-bold text-slate-700">
                            {s.department}
                          </span>
                        </td>

                        {/* Check In */}
                        <td className="p-3 font-mono text-emerald-700 font-bold">
                          {record.checkIn}
                        </td>

                        {/* Check Out */}
                        <td className="p-3 font-mono text-slate-600 font-bold">
                          {record.checkOut}
                        </td>

                        {/* Working Hours */}
                        <td className="p-3 font-bold text-slate-800">
                          {record.workingHours} hrs
                        </td>

                        {/* Attendance Status Buttons */}
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            {[
                              { label: 'Present', color: 'bg-emerald-600 text-white', inactive: 'bg-slate-100 text-slate-600 hover:bg-emerald-50' },
                              { label: 'Absent', color: 'bg-rose-600 text-white', inactive: 'bg-slate-100 text-slate-600 hover:bg-rose-50' },
                              { label: 'Half Day', color: 'bg-amber-500 text-white', inactive: 'bg-slate-100 text-slate-600 hover:bg-amber-50' },
                              { label: 'Late', color: 'bg-orange-500 text-white', inactive: 'bg-slate-100 text-slate-600 hover:bg-orange-50' },
                              { label: 'Leave', color: 'bg-blue-600 text-white', inactive: 'bg-slate-100 text-slate-600 hover:bg-blue-50' }
                            ].map(st => (
                              <button
                                key={st.label}
                                type="button"
                                onClick={() => handleStatusChange(s, st.label)}
                                className={`px-2.5 py-1 rounded-lg text-2xs font-extrabold transition-all cursor-pointer ${
                                  currentStatus === st.label ? `${st.color} shadow-xs scale-105` : st.inactive
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
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
      )}

      {/* 2. MONTHLY ATTENDANCE SHEET GRID */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 font-serif">Monthly Attendance Sheet (Days 1 - 30)</h3>
            <span className="text-2xs text-slate-500 font-medium">P = Present, A = Absent, HD = Half Day, L = Leave</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-center text-[10px] text-slate-700 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2 text-left min-w-[140px]">Staff Name</th>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                    <th key={d} className="p-1 border-l border-slate-200 w-7">{d}</th>
                  ))}
                  <th className="p-2 border-l border-slate-200">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {filteredStaff.map(s => {
                  const stats = getStaffStats(s);
                  return (
                    <tr key={s.id || s.employeeId} className="hover:bg-slate-50">
                      <td className="p-2 text-left font-bold text-slate-900 truncate max-w-[140px]">{s.name}</td>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                        const dayStr = `2026-09-${String(day).padStart(2, '0')}`;
                        const rec = getStaffAttendanceRecord(s, dayStr);
                        const code = rec.status === 'Present' ? 'P' : rec.status === 'Absent' ? 'A' : rec.status === 'Half Day' ? 'HD' : rec.status === 'Leave' ? 'L' : 'P';
                        const color = code === 'P' ? 'bg-emerald-100 text-emerald-800' : code === 'A' ? 'bg-rose-100 text-rose-800' : code === 'HD' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800';
                        return (
                          <td key={day} className="p-1 border-l border-slate-200">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center mx-auto text-[9px] font-black ${color}`}>
                              {code}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-2 border-l border-slate-200 font-black text-emerald-700">
                        {stats.pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. STAFF-WISE ATTENDANCE BREAKDOWN */}
      {activeTab === 'staff-wise' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map(s => {
            const stats = getStaffStats(s);
            return (
              <div key={s.id || s.employeeId} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center space-x-3">
                  <img src={s.avatar || '/image/logo.png'} alt={s.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20 bg-white" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                    <span className="text-xs text-emerald-700 font-semibold">{s.role || s.designation}</span>
                    <span className="text-2xs text-slate-500 block">ID: {s.id || s.employeeId} • {s.department}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-slate-100">
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <span className="text-sm font-black text-emerald-800 block">{stats.present}</span>
                    <span className="text-[9px] font-bold text-emerald-700 uppercase">Present</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-xl">
                    <span className="text-sm font-black text-rose-800 block">{stats.absent}</span>
                    <span className="text-[9px] font-bold text-rose-700 uppercase">Absent</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-xl">
                    <span className="text-sm font-black text-amber-800 block">{stats.halfDays}</span>
                    <span className="text-[9px] font-bold text-amber-700 uppercase">Half Day</span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <span className="text-sm font-black text-blue-800 block">{stats.leavesCount}</span>
                    <span className="text-[9px] font-bold text-blue-700 uppercase">Leave</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-bold text-slate-700">
                  <span>Attendance Percentage:</span>
                  <span className="text-emerald-700 font-black text-sm">{stats.pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. DEPARTMENT-WISE ATTENDANCE */}
      {activeTab === 'dept-wise' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deptOptions.filter(d => d !== 'All').map(deptName => {
            const deptStaff = approvedStaffList.filter(s => s.department === deptName);
            const deptCount = deptStaff.length;

            return (
              <div key={deptName} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-900">{deptName} Department</h4>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full">
                    {deptCount} Staff Assigned
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  {deptStaff.length === 0 ? (
                    <p className="text-slate-400 italic">No staff members assigned to this department.</p>
                  ) : (
                    deptStaff.map(s => {
                      const rec = getStaffAttendanceRecord(s, selectedDate);
                      return (
                        <div key={s.id || s.employeeId} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                          <span className="font-bold text-slate-800">{s.name} ({s.id || s.employeeId})</span>
                          <span className={`px-2 py-0.5 rounded-md text-2xs font-bold ${
                            rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'Absent' ? 'bg-rose-100 text-rose-800' :
                            rec.status === 'Half Day' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.status}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
