import React, { useState, useEffect } from 'react';
import { Users, UserPlus } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);

  // Sync subTab with activeSubTab prop when changed from parent / sidebar navigation
  useEffect(() => {
    if (activeSubTab && activeSubTab !== 'staff') {
      if (activeSubTab === 'add-staff') {
        setSubTab('all-staff');
        setShowAddModal(true);
      } else {
        setSubTab(activeSubTab);
      }
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6 font-sans">
      {/* Simple Header (Clean design matching Training Centres page) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <span>Staff Member Management System</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 font-sans">
              {staffList.length} Active Staff
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage trainers, placement officers, center coordinators & executive staff across Odisha centers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#123B5D] hover:bg-[#0E2F4A] text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* SUB-MODULE VIEW ROUTING */}
      {subTab === 'all-staff' && (
        <AllStaffModule
          staffList={staffList}
          setStaffList={setStaffList}
          departments={departments}
          attendance={attendance}
          leaves={leaves}
          staffDocuments={staffDocuments}
          onViewProfile={(staff) => setSelectedProfileStaff(staff)}
          onOpenAddModal={() => setShowAddModal(true)}
          showToast={showToast}
        />
      )}

      {subTab === 'staff-id-cards' && (
        <StaffIdCardModule
          staffList={staffList}
          setStaffList={setStaffList}
          staffIdCards={staffIdCards}
          setStaffIdCards={setStaffIdCards}
          showToast={showToast}
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

      {/* ADD STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Add New Staff Member</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <AddStaffModule
              departments={departments}
              staffList={staffList}
              setStaffList={setStaffList}
              showToast={showToast}
              onSuccess={() => setShowAddModal(false)}
            />
          </div>
        </div>
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
