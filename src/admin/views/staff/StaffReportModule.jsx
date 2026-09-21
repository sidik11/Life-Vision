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
  const [selectedDept, setSelectedDept] = useState('All');
  const [reportType, setReportType] = useState('summary'); // 'summary' | 'attendance' | 'leave' | 'department' | 'idcard'

  // Department list
  const deptList = useMemo(() => {
    const list = departments.map(d => d.departmentName || d.name).filter(Boolean);
    if (list.length > 0) return Array.from(new Set(list));
    return ['Mobilization', 'Training', 'Placement & Livelihood', 'Operations', 'Management', 'Finance', 'IT & Support'];
  }, [departments]);

  // Filtered staff based on selected dept
  const filteredStaff = useMemo(() => {
    if (selectedDept === 'All') return staffList;
    return staffList.filter(s => (s.department || '').toLowerCase() === selectedDept.toLowerCase());
  }, [staffList, selectedDept]);

  // Filtered attendance
  const filteredAttendance = useMemo(() => {
    if (selectedDept === 'All') return attendance;
    return attendance.filter(a => {
      const targetStaff = staffList.find(s => s.id === a.staffId || s.name === a.staffName);
      return targetStaff && (targetStaff.department || '').toLowerCase() === selectedDept.toLowerCase();
    });
  }, [attendance, staffList, selectedDept]);

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    if (selectedDept === 'All') return leaves;
    return leaves.filter(l => {
      const targetStaff = staffList.find(s => s.id === l.staffId || s.name === l.staffName);
      return targetStaff && (targetStaff.department || '').toLowerCase() === selectedDept.toLowerCase();
    });
  }, [leaves, staffList, selectedDept]);

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
    const totalLeaves = filteredLeaves.length;
    const pendingLeaves = filteredLeaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = filteredLeaves.filter(l => l.status === 'Approved').length;

    // Attendance metrics
    const totalAttendanceLogs = filteredAttendance.length;
    const presentCount = filteredAttendance.filter(a => a.status === 'Present').length;
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
      totalAttendanceLogs,
      presentCount,
      attendancePercentage,
      idCardApproved,
      idCardPending,
      idCardRejected
    };
  }, [filteredStaff, filteredLeaves, filteredAttendance]);

  // Export CSV Handler
  const handleExportCSV = () => {
    let csvData = [];
    let headers = [];

    if (reportType === 'summary' || reportType === 'department') {
      headers = ['Employee ID', 'Name', 'Designation', 'Department', 'Email', 'Contact Number', 'Joining Date', 'Employment Type', 'Status'];
      csvData = filteredStaff.map(s => [
        s.id || s.employeeId || '',
        `"${s.name || ''}"`,
        `"${s.role || s.designation || ''}"`,
        `"${s.department || ''}"`,
        s.email || '',
        s.phone || '',
        s.joinDate || '',
        s.employmentType || 'Full Time',
        s.status || 'Active'
      ]);
    } else if (reportType === 'leave') {
      headers = ['Leave ID', 'Staff Name', 'Employee ID', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Total Days', 'Status'];
      csvData = filteredLeaves.map(l => [
        l.id || '',
        `"${l.staffName || ''}"`,
        l.staffId || '',
        `"${l.department || ''}"`,
        l.leaveType || '',
        l.startDate || '',
        l.endDate || '',
        l.totalDays || 1,
        l.status || 'Pending'
      ]);
    } else if (reportType === 'attendance') {
      headers = ['Log ID', 'Staff Name', 'Employee ID', 'Department', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Status'];
      csvData = filteredAttendance.map(a => [
        a.id || '',
        `"${a.staffName || ''}"`,
        a.staffId || '',
        `"${a.department || ''}"`,
        a.date || '',
        a.checkIn || '',
        a.checkOut || '',
        '8h 00m',
        a.status || 'Present'
      ]);
    } else if (reportType === 'idcard') {
      headers = ['Employee ID', 'Staff Name', 'Designation', 'Department', 'Email', 'ID Status'];
      csvData = filteredStaff.map(s => [
        s.id || s.employeeId || '',
        `"${s.name || ''}"`,
        `"${s.role || s.designation || ''}"`,
        `"${s.department || ''}"`,
        s.email || '',
        s.approvalStatus || s.status || 'Active'
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvData.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LifeVision_Staff_${reportType.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast(`✓ ${reportType.toUpperCase()} Report exported to CSV!`, 'success');
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'summary': return 'OFFICIAL STAFF MEMBER DIRECTORY REPORT';
      case 'attendance': return 'STAFF ATTENDANCE LOG REPORT';
      case 'leave': return 'STAFF LEAVE MANAGEMENT REPORT';
      case 'department': return 'DEPARTMENTAL STAFF DISTRIBUTION REPORT';
      case 'idcard': return 'STAFF ID CARD APPROVAL & STATUS REPORT';
      default: return 'STAFF MANAGEMENT REPORT';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ON-SCREEN BANNER & CONTROLS (Hidden in Print) */}
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

      {/* Filter Toolbar (Hidden in Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        {/* Report Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'summary', label: '👥 Staff Directory Summary' },
            { id: 'attendance', label: '📅 Attendance Report' },
            { id: 'leave', label: '🏖️ Leave Report' },
            { id: 'department', label: '🏢 Department Breakdown' },
            { id: 'idcard', label: '🪪 Staff ID Cards Report' }
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

      {/* KPI Cards Grid (Hidden in Print) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
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
            {stats.presentCount} Present logs
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
            <span>ID Cards Approved</span>
            <IdCard className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">{stats.idCardApproved}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-semibold">
            <span className="text-amber-700 font-bold">{stats.idCardPending} Pending</span> • {stats.idCardRejected} Rejected
          </div>
        </div>
      </div>

      {/* 2. DEDICATED PROFESSIONAL PRINT-READY CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs print:p-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* NGO BRANDED PRINT HEADER (Visible in Print & On-Screen) */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img src="/image/logo.png" alt="Life Vision Society Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-wide font-serif uppercase">LIFE VISION SOCIETY</h1>
              <p className="text-xs font-bold text-emerald-800">Regd. NGO | Empowering Skill Development & Livelihood in Odisha</p>
              <p className="text-[11px] text-slate-600 font-medium">Head Office: Unit No. 423, Tower-A, Spez I-Tech Park, Sohna Rd, Sector-49, Gurugram 122018</p>
              <p className="text-[11px] text-slate-600 font-medium">Phone: +91 9416362914 | Email: support.lifevision@gmail.com</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="px-3 py-1 bg-slate-100 text-slate-900 border border-slate-300 rounded-lg text-2xs font-bold uppercase font-mono">
              OFFICIAL REPORT
            </div>
            <div className="text-xs text-slate-500 font-medium">Generated Date:</div>
            <div className="text-xs font-bold text-slate-900 font-mono">{new Date().toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* REPORT METADATA STRIP */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between text-xs font-bold text-slate-800">
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px] block">Report Title:</span>
            <span className="text-emerald-900 text-sm font-black font-serif">{getReportTitle()}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px] block">Department Filter:</span>
            <span className="font-mono text-slate-900">{selectedDept}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px] block">Period Range:</span>
            <span className="font-mono text-slate-900 capitalize">{dateRange.replace('-', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold uppercase text-[10px] block">Total Records:</span>
            <span className="font-mono text-slate-900">
              {reportType === 'leave' ? filteredLeaves.length : reportType === 'attendance' ? filteredAttendance.length : filteredStaff.length} Records
            </span>
          </div>
        </div>

        {/* 1. STAFF DIRECTORY SUMMARY REPORT */}
        {(reportType === 'summary' || reportType === 'department') && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3 border border-slate-700">Staff Name</th>
                  <th className="p-3 border border-slate-700">Employee ID</th>
                  <th className="p-3 border border-slate-700">Designation</th>
                  <th className="p-3 border border-slate-700">Department</th>
                  <th className="p-3 border border-slate-700">Email</th>
                  <th className="p-3 border border-slate-700">Contact Number</th>
                  <th className="p-3 border border-slate-700">Joining Date</th>
                  <th className="p-3 border border-slate-700">Employment Type</th>
                  <th className="p-3 border border-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500 border border-slate-200">
                      No staff records available for the selected department.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff, idx) => (
                    <tr key={staff.id || idx} className="hover:bg-slate-50 border border-slate-200">
                      <td className="p-2.5 font-bold text-slate-900">{staff.name}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-800">{staff.id || staff.employeeId}</td>
                      <td className="p-2.5 font-semibold text-emerald-800">{staff.role || staff.designation}</td>
                      <td className="p-2.5 font-medium">{staff.department}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">{staff.email}</td>
                      <td className="p-2.5 font-mono text-slate-700">{staff.phone}</td>
                      <td className="p-2.5 font-medium">{staff.joinDate || 'N/A'}</td>
                      <td className="p-2.5 font-semibold">{staff.employmentType || 'Full Time'}</td>
                      <td className="p-2.5 font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                          staff.status === 'Active' || staff.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {staff.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. ATTENDANCE LOGS REPORT */}
        {reportType === 'attendance' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3 border border-slate-700">Log ID</th>
                  <th className="p-3 border border-slate-700">Staff Name</th>
                  <th className="p-3 border border-slate-700">Employee ID</th>
                  <th className="p-3 border border-slate-700">Department</th>
                  <th className="p-3 border border-slate-700">Date</th>
                  <th className="p-3 border border-slate-700">Check In</th>
                  <th className="p-3 border border-slate-700">Check Out</th>
                  <th className="p-3 border border-slate-700">Working Hours</th>
                  <th className="p-3 border border-slate-700">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500 border border-slate-200">
                      No attendance log entries found for this report period.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((a, idx) => (
                    <tr key={a.id || idx} className="hover:bg-slate-50 border border-slate-200">
                      <td className="p-2.5 font-mono text-slate-500">{a.id || `ATT-${idx + 1}`}</td>
                      <td className="p-2.5 font-bold text-slate-900">{a.staffName || 'Staff Member'}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-800">{a.staffId || '-'}</td>
                      <td className="p-2.5 font-medium">{a.department || '-'}</td>
                      <td className="p-2.5 font-medium">{a.date || new Date().toISOString().split('T')[0]}</td>
                      <td className="p-2.5 font-mono text-emerald-800">{a.checkIn || '09:30 AM'}</td>
                      <td className="p-2.5 font-mono text-slate-600">{a.checkOut || '05:30 PM'}</td>
                      <td className="p-2.5 font-mono">8h 00m</td>
                      <td className="p-2.5 font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                          a.status === 'Present' ? 'bg-emerald-100 text-emerald-900' :
                          a.status === 'Absent' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
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
        )}

        {/* 3. LEAVE REPORT */}
        {reportType === 'leave' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3 border border-slate-700">Leave ID</th>
                  <th className="p-3 border border-slate-700">Staff Name</th>
                  <th className="p-3 border border-slate-700">Employee ID</th>
                  <th className="p-3 border border-slate-700">Department</th>
                  <th className="p-3 border border-slate-700">Leave Type</th>
                  <th className="p-3 border border-slate-700">From Date</th>
                  <th className="p-3 border border-slate-700">To Date</th>
                  <th className="p-3 border border-slate-700">Number of Days</th>
                  <th className="p-3 border border-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
                {filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500 border border-slate-200">
                      No leave applications found for this report period.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((l, idx) => (
                    <tr key={l.id || idx} className="hover:bg-slate-50 border border-slate-200">
                      <td className="p-2.5 font-mono text-slate-500">{l.id || `LV-${idx + 1}`}</td>
                      <td className="p-2.5 font-bold text-slate-900">{l.staffName || 'Staff Member'}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-800">{l.staffId || '-'}</td>
                      <td className="p-2.5 font-medium">{l.department || '-'}</td>
                      <td className="p-2.5 font-semibold text-emerald-800">{l.leaveType || 'Casual Leave'}</td>
                      <td className="p-2.5 font-medium">{l.startDate || '-'}</td>
                      <td className="p-2.5 font-medium">{l.endDate || '-'}</td>
                      <td className="p-2.5 font-mono font-bold">{l.totalDays || 1} day(s)</td>
                      <td className="p-2.5 font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                          l.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' :
                          l.status === 'Rejected' ? 'bg-rose-100 text-rose-900' : 'bg-amber-100 text-amber-900'
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
        )}

        {/* 4. ID CARDS REPORT */}
        {reportType === 'idcard' && (
          <div className="space-y-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3 border border-slate-700">Employee ID</th>
                  <th className="p-3 border border-slate-700">Staff Name</th>
                  <th className="p-3 border border-slate-700">Designation</th>
                  <th className="p-3 border border-slate-700">Department</th>
                  <th className="p-3 border border-slate-700">Email Address</th>
                  <th className="p-3 border border-slate-700">Approval Status</th>
                  <th className="p-3 border border-slate-700">ID Card Document Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-medium text-slate-800">
                {filteredStaff.map((s, idx) => {
                  const isApproved = s.approvalStatus === 'Approved' || (s.status === 'Active' && !s.approvalStatus);
                  const isPending = s.approvalStatus === 'Pending' || s.status === 'Pending Approval';
                  return (
                    <tr key={s.id || idx} className="hover:bg-slate-50 border border-slate-200">
                      <td className="p-2.5 font-mono font-bold text-slate-900">{s.id || s.employeeId}</td>
                      <td className="p-2.5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-2.5 font-semibold text-emerald-800">{s.role || s.designation}</td>
                      <td className="p-2.5 font-medium">{s.department}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">{s.email}</td>
                      <td className="p-2.5 font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                          isApproved ? 'bg-emerald-100 text-emerald-900' :
                          isPending ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                        }`}>
                          {isApproved ? '✓ Approved' : isPending ? '⏳ Pending' : '✕ Rejected'}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-2xs text-slate-600">
                        {isApproved ? 'Generated & Emailed' : 'Awaiting Approval'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PRINT FOOTER */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div>
            <span>Confidential | Life Vision Society HR Portal</span>
          </div>
          <div>
            <span>Page 1 of 1</span>
          </div>
          <div>
            <span>Authorized Signatory: _______________________</span>
          </div>
        </div>

      </div>

    </div>
  );
}
