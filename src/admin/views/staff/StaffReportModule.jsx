import React, { useState, useMemo } from 'react';
import {
  BarChart3, Users, Calendar, Clock, FileText, IdCard,
  Building, Filter, Download, Printer, CheckCircle2,
  XCircle, AlertCircle, TrendingUp, PieChart, RefreshCw
} from 'lucide-react';

export default function StaffReportModule({
  staffList = [],
  departments = [],
  attendance = [],
  leaves = [],
  staffIdCards = [],
  showToast
}) {
  const [dateRange, setDateRange] = useState('this-month'); // 'this-month' | 'last-month' | 'this-year' | 'custom'
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [reportType, setReportType] = useState('summary'); // 'summary' | 'attendance' | 'leave' | 'department' | 'idcard'

  // Department list fallback
  const deptList = useMemo(() => {
    if (departments.length > 0) return departments.map(d => d.name || d.departmentName);
    return ['Mobilization', 'Training', 'Placement & Livelihood', 'Operations', 'Management', 'Finance', 'IT & Support'];
  }, [departments]);

  // Filtered staff based on selected dept
  const filteredStaff = useMemo(() => {
    if (selectedDept === 'All') return staffList;
    return staffList.filter(s => (s.department || '').toLowerCase() === selectedDept.toLowerCase());
  }, [staffList, selectedDept]);

  // General Metrics
  const stats = useMemo(() => {
    const total = filteredStaff.length;
    const active = filteredStaff.filter(s => (s.status || 'Active') === 'Active' && s.approvalStatus !== 'Rejected').length;
    const inactive = filteredStaff.filter(s => s.status === 'Inactive').length;
    const pendingApproval = filteredStaff.filter(s => s.approvalStatus === 'Pending' || s.status === 'Pending Approval').length;

    // Dept breakdown
    const deptCounts = {};
    filteredStaff.forEach(s => {
      const d = s.department || 'Unassigned';
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    // Leaves metrics
    const totalLeaves = leaves.length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;

    // Attendance metrics
    const totalAttendanceLogs = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const halfDayCount = attendance.filter(a => a.status === 'Half Day').length;
    const lateCount = attendance.filter(a => a.status === 'Late').length;
    const attendancePercentage = totalAttendanceLogs > 0 ? Math.round((presentCount / totalAttendanceLogs) * 100) : 95;

    // ID Cards metrics
    const idCardApproved = filteredStaff.filter(s => s.approvalStatus === 'Approved' || (s.status === 'Active' && !s.approvalStatus)).length;
    const idCardPending = pendingApproval;
    const idCardRejected = filteredStaff.filter(s => s.approvalStatus === 'Rejected' || s.status === 'Rejected').length;

    return {
      total,
      active,
      inactive,
      pendingApproval,
      deptCounts,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalAttendanceLogs,
      presentCount,
      absentCount,
      halfDayCount,
      lateCount,
      attendancePercentage,
      idCardApproved,
      idCardPending,
      idCardRejected
    };
  }, [filteredStaff, leaves, attendance]);

  // Export CSV Handler
  const handleExportCSV = () => {
    let csvData = [];
    let headers = [];

    if (reportType === 'summary' || reportType === 'department') {
      headers = ['Employee ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Join Date', 'Status', 'Approval Status'];
      csvData = filteredStaff.map(s => [
        s.id || '',
        `"${s.name || ''}"`,
        `"${s.role || ''}"`,
        `"${s.department || ''}"`,
        s.email || '',
        s.phone || '',
        s.joinDate || '',
        s.status || 'Active',
        s.approvalStatus || 'Approved'
      ]);
    } else if (reportType === 'leave') {
      headers = ['Leave ID', 'Staff ID', 'Staff Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
      csvData = leaves.map(l => [
        l.id || '',
        l.staffId || '',
        `"${l.staffName || ''}"`,
        l.leaveType || '',
        l.startDate || '',
        l.endDate || '',
        l.totalDays || 1,
        l.status || 'Pending',
        `"${(l.reason || '').replace(/"/g, '""')}"`
      ]);
    } else if (reportType === 'attendance') {
      headers = ['Log ID', 'Staff ID', 'Staff Name', 'Date', 'Check In', 'Check Out', 'Status'];
      csvData = attendance.map(a => [
        a.id || '',
        a.staffId || '',
        `"${a.staffName || ''}"`,
        a.date || '',
        a.checkIn || '',
        a.checkOut || '',
        a.status || 'Present'
      ]);
    } else if (reportType === 'idcard') {
      headers = ['Employee ID', 'Name', 'Department', 'Email', 'ID Status', 'Approval Status'];
      csvData = filteredStaff.map(s => [
        s.id || '',
        `"${s.name || ''}"`,
        `"${s.department || ''}"`,
        s.email || '',
        s.status || 'Active',
        s.approvalStatus || 'Approved'
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_${reportType.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast(`✓ ${reportType.toUpperCase()} Report exported to CSV!`, 'success');
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Top Banner / Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>HR Analytics & Management Reports</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-serif">Staff Management Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and export staff directory summaries, attendance logs, leave records, and ID card reports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-emerald-200 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-[#123B5D] hover:bg-[#0E2F4A] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        {/* Report Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'summary', label: '👥 Overview Summary' },
            { id: 'attendance', label: '📅 Attendance' },
            { id: 'leave', label: '🏖️ Leaves' },
            { id: 'department', label: '🏢 Departments' },
            { id: 'idcard', label: '🪪 ID Cards' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                reportType === tab.id
                  ? 'bg-[#123B5D] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Departments</option>
              {deptList.map((dept, i) => (
                <option key={i} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="h-1 bg-blue-500 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Staff</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-semibold">
            <span className="text-emerald-600 font-bold">{stats.active} Active</span> • {stats.inactive} Inactive
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="h-1 bg-emerald-500 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Attendance Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2 font-mono">{stats.attendancePercentage}%</div>
          <div className="text-[11px] text-slate-500 mt-1 font-semibold">
            {stats.presentCount} Present logs logged
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="h-1 bg-amber-500 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Leave Applications</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.totalLeaves}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-semibold">
            <span className="text-amber-700 font-bold">{stats.pendingLeaves} Pending</span> • {stats.approvedLeaves} Approved
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="h-1 bg-teal-500 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>ID Card Approvals</span>
            <IdCard className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.idCardApproved}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-semibold">
            <span className="text-amber-700 font-bold">{stats.idCardPending} Pending</span> • {stats.idCardRejected} Rejected
          </div>
        </div>
      </div>

      {/* REPORT CONTENT DEPENDING ON TAB */}

      {/* 1. OVERVIEW SUMMARY */}
      {reportType === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Staff Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 font-serif flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Department Staff Distribution</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{Object.keys(stats.deptCounts).length} Departments</span>
            </div>

            <div className="space-y-3">
              {Object.entries(stats.deptCounts).map(([dept, count], idx) => {
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{dept}</span>
                      <span className="text-slate-900 font-mono font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Staff Directory Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 font-serif flex items-center gap-2">
                <Users className="w-4 h-4 text-[#123B5D]" />
                <span>Recent Staff Records</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">Showing {Math.min(5, filteredStaff.length)} of {filteredStaff.length}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredStaff.slice(0, 5).map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={s.avatar || '/image/logo.png'}
                      alt={s.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 bg-white shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{s.name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{s.role} • {s.department}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    s.approvalStatus === 'Approved' || (s.status === 'Active' && !s.approvalStatus)
                      ? 'bg-emerald-100 text-emerald-800'
                      : s.approvalStatus === 'Pending' || s.status === 'Pending Approval'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {s.approvalStatus || s.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE REPORT */}
      {reportType === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-serif">Detailed Attendance Logs</h3>
              <p className="text-xs text-slate-500">Record of daily staff check-ins and check-outs across Odisha training centers.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              {stats.totalAttendanceLogs} Logs Found
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Check In</th>
                  <th className="p-3">Check Out</th>
                  <th className="p-3">Work Hours</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No attendance logs recorded for this period yet.
                    </td>
                  </tr>
                ) : (
                  attendance.map((a, idx) => (
                    <tr key={a.id || idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500">{a.id || `ATT-${idx + 1}`}</td>
                      <td className="p-3 font-bold text-slate-800">{a.staffName || 'Staff Member'}</td>
                      <td className="p-3">{a.date || new Date().toISOString().split('T')[0]}</td>
                      <td className="p-3 font-mono text-emerald-700">{a.checkIn || '09:30 AM'}</td>
                      <td className="p-3 font-mono text-slate-500">{a.checkOut || '05:30 PM'}</td>
                      <td className="p-3 font-mono">8h 00m</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          a.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'Absent' ? 'bg-rose-100 text-rose-800' :
                          a.status === 'Half Day' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {a.status || 'Present'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LEAVE REPORT */}
      {reportType === 'leave' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-serif">Staff Leave Management Report</h3>
              <p className="text-xs text-slate-500">Historical summary of leave applications, approvals, and rejections.</p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
              {leaves.length} Applications
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Leave ID</th>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Leave Type</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Total Days</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No leave applications found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((l, idx) => (
                    <tr key={l.id || idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500">{l.id || `LV-${idx + 1}`}</td>
                      <td className="p-3 font-bold text-slate-800">{l.staffName || 'Staff Member'}</td>
                      <td className="p-3 font-semibold text-emerald-700">{l.leaveType || 'Casual Leave'}</td>
                      <td className="p-3">{l.startDate || '-'}</td>
                      <td className="p-3">{l.endDate || '-'}</td>
                      <td className="p-3 font-mono font-bold">{l.totalDays || 1} day(s)</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          l.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {l.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DEPARTMENT REPORT */}
      {reportType === 'department' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-serif">Departmental Operational Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution of active staff across Life Vision Society departments.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptList.map((dName, idx) => {
              const count = staffList.filter(s => (s.department || '').toLowerCase() === dName.toLowerCase()).length;
              return (
                <div key={idx} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{dName}</span>
                    <Building className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">{count} Staff</div>
                  <p className="text-[11px] text-slate-500 font-medium">Assigned active staff members</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ID CARD REPORT */}
      {reportType === 'idcard' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 font-serif">Official ID Card Approval & Status Report</h3>
              <p className="text-xs text-slate-500">Track approved, pending, and rejected staff ID cards.</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Staff ID</th>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Approval Status</th>
                  <th className="p-3">ID Card Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStaff.map((s) => {
                  const isApproved = s.approvalStatus === 'Approved' || (s.status === 'Active' && !s.approvalStatus);
                  const isPending = s.approvalStatus === 'Pending' || s.status === 'Pending Approval';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{s.id}</td>
                      <td className="p-3 font-bold text-slate-800">{s.name}</td>
                      <td className="p-3 font-semibold text-emerald-700">{s.department}</td>
                      <td className="p-3 text-slate-500">{s.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isApproved ? 'bg-emerald-100 text-emerald-800' :
                          isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isApproved ? '✓ Approved' : isPending ? '⏳ Pending' : '✗ Rejected'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {isApproved ? 'Generated & Emailed' : 'Awaiting Approval'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
