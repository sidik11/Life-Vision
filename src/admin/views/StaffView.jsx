import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, IdCard, Calendar, FileText,
  Building, BarChart3, Clock, CheckCircle2, Shield
} from 'lucide-react';

// Modular Staff Management Components
import AllStaffModule from './staff/AllStaffModule';
import AddStaffModule from './staff/AddStaffModule';
import StaffIdCardModule from './staff/StaffIdCardModule';
import StaffAttendanceModule from './staff/StaffAttendanceModule';
import LeaveManagementModule from './staff/LeaveManagementModule';
import StaffDocumentModule from './staff/StaffDocumentModule';
import DepartmentModule from './staff/DepartmentModule';
import StaffReportModule from './staff/StaffReportModule';
import StaffProfileModal from './staff/StaffProfileModal';

export default function StaffView({
  staffList = [],
  setStaffList,
  departments = [],
  setDepartments,
  attendance = [],
  setAttendance,
  leaves = [],
  setLeaves,
  staffDocuments = [],
  setStaffDocuments,
  staffIdCards = [],
  setStaffIdCards,
  activeSubTab = 'all-staff',
  showToast
}) {
  const [subTab, setSubTab] = useState(activeSubTab || 'all-staff');
  const [selectedProfileStaff, setSelectedProfileStaff] = useState(null);

  // Sync subTab with activeSubTab prop when changed from parent / sidebar
  useEffect(() => {
    if (activeSubTab && activeSubTab !== 'staff') {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Derived counts for sub-nav badges
  const pendingIdApprovals = staffList.filter(s => s.approvalStatus === 'Pending' || s.status === 'Pending Approval').length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123B5D] to-[#1E527B] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Human Resources & Staff Management</span>
          </div>
          <h1 className="text-2xl font-bold font-serif">Staff Member Management System</h1>
          <p className="text-slate-200 text-xs mt-1">
            Manage trainers, placement officers, center coordinators & executive staff across Odisha centers.
          </p>
        </div>

        <button
          onClick={() => setSubTab('add-staff')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Internal Sub-Nav Tabs (All 8 Modules + Approval tab) */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all-staff', label: '👥 All Staff', count: staffList.length },
          { id: 'add-staff', label: '➕ Add Staff' },
          { id: 'staff-id-approval', label: '⏳ Staff ID Approval', count: pendingIdApprovals },
          { id: 'staff-id-cards', label: '🪪 Staff ID Cards' },
          { id: 'staff-attendance', label: '📅 Staff Attendance' },
          { id: 'leave-management', label: '🏖️ Leave Management', count: pendingLeaves },
          { id: 'staff-documents', label: '📁 Staff Documents' },
          { id: 'staff-departments', label: '🏢 Departments' },
          { id: 'staff-reports', label: '📊 Staff Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              subTab === tab.id
                ? 'bg-[#123B5D] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                subTab === tab.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#047857]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SUB-MODULE VIEW ROUTING */}
      {subTab === 'all-staff' && (
        <AllStaffModule
          staffList={staffList}
          setStaffList={setStaffList}
          departments={departments}
          onViewProfile={(staff) => setSelectedProfileStaff(staff)}
          showToast={showToast}
        />
      )}

      {subTab === 'add-staff' && (
        <AddStaffModule
          departments={departments}
          setStaffList={setStaffList}
          showToast={showToast}
          onSuccess={() => setSubTab('all-staff')}
        />
      )}

      {(subTab === 'staff-id-cards' || subTab === 'staff-id-approval') && (
        <StaffIdCardModule
          staffList={staffList}
          setStaffList={setStaffList}
          staffIdCards={staffIdCards}
          setStaffIdCards={setStaffIdCards}
          showToast={showToast}
          initialApprovalFilter={subTab === 'staff-id-approval' ? 'pending' : 'all'}
        />
      )}

      {subTab === 'staff-attendance' && (
        <StaffAttendanceModule
          staffList={staffList}
          departments={departments}
          attendance={attendance}
          setAttendance={setAttendance}
          showToast={showToast}
        />
      )}

      {subTab === 'leave-management' && (
        <LeaveManagementModule
          staffList={staffList}
          leaves={leaves}
          setLeaves={setLeaves}
          attendance={attendance}
          setAttendance={setAttendance}
          showToast={showToast}
        />
      )}

      {subTab === 'staff-documents' && (
        <StaffDocumentModule
          staffList={staffList}
          staffDocuments={staffDocuments}
          setStaffDocuments={setStaffDocuments}
          showToast={showToast}
        />
      )}

      {subTab === 'staff-departments' && (
        <DepartmentModule
          departments={departments}
          setDepartments={setDepartments}
          staffList={staffList}
          showToast={showToast}
        />
      )}

      {subTab === 'staff-reports' && (
        <StaffReportModule
          staffList={staffList}
          departments={departments}
          attendance={attendance}
          leaves={leaves}
          staffIdCards={staffIdCards}
          showToast={showToast}
        />
      )}

      {/* STAFF PROFILE MODAL */}
      {selectedProfileStaff && (
        <StaffProfileModal
          staff={selectedProfileStaff}
          onClose={() => setSelectedProfileStaff(null)}
          attendance={attendance}
          leaves={leaves}
          staffDocuments={staffDocuments}
          showToast={showToast}
        />
      )}
    </div>
  );
}
