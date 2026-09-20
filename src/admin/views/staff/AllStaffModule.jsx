import React, { useState } from 'react';
import { 
  Search, Filter, Users, Mail, Phone, Calendar, 
  MapPin, Eye, Edit, Trash2, IdCard, FileText, 
  CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight, UserPlus
} from 'lucide-react';
import ActionPopover from '../../components/Common/ActionPopover';
import StaffProfileModal from './StaffProfileModal';

export default function AllStaffModule({ 
  staffList = [], 
  setStaffList, 
  departments = [], 
  attendance = [], 
  leaves = [], 
  staffDocuments = [],
  onNavigateTab,
  onViewProfile,
  onOpenAddModal,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter Dropdown state
  const [filterCategory, setFilterCategory] = useState('All Staff'); // 'All Staff' | 'Active' | 'Inactive' | 'Department' | 'Designation' | 'Employment Type'
  const [selectedSubValue, setSelectedSubValue] = useState('All');

  // Modals state
  const [viewingProfileStaff, setViewingProfileStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dynamic Options
  const deptOptions = Array.from(new Set([
    ...departments.map(d => d.departmentName || d.name).filter(Boolean),
    ...staffList.map(s => s.department).filter(Boolean)
  ]));

  const roleOptions = Array.from(new Set([
    ...staffList.map(s => s.role || s.designation).filter(Boolean)
  ]));

  const empTypeOptions = Array.from(new Set([
    'Full Time',
    'Part Time',
    'Contractual',
    'Trainee',
    ...staffList.map(s => s.employmentType).filter(Boolean)
  ]));

  // Delete Staff Member
  const handleDeleteStaff = (staffMember) => {
    if (window.confirm(`Are you sure you want to delete staff member "${staffMember.name}" (${staffMember.id || staffMember.employeeId})?`)) {
      if (setStaffList) {
        setStaffList(prev => prev.filter(s => s.id !== staffMember.id && s.firestoreId !== staffMember.firestoreId));
      }
      if (showToast) showToast(`Staff member "${staffMember.name}" deleted.`, 'info');
    }
  };

  // Filter staff records
  const filteredStaff = staffList.filter(s => {
    const term = searchQuery.toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(term);
    const idMatch = (s.id || s.employeeId || '').toLowerCase().includes(term);
    const emailMatch = (s.email || '').toLowerCase().includes(term);
    const phoneMatch = (s.phone || '').toLowerCase().includes(term);
    const roleMatch = (s.role || s.designation || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || idMatch || emailMatch || phoneMatch || roleMatch;

    if (!matchesSearch) return false;

    if (filterCategory === 'All Staff') return true;
    if (filterCategory === 'Active') {
      return s.status === 'Active' || s.approvalStatus === 'Approved' || (!s.status && !s.approvalStatus);
    }
    if (filterCategory === 'Inactive') {
      return s.status === 'Inactive' || s.status === 'Rejected' || s.approvalStatus === 'Rejected';
    }
    if (filterCategory === 'Department') {
      return selectedSubValue === 'All' || s.department === selectedSubValue;
    }
    if (filterCategory === 'Designation') {
      return selectedSubValue === 'All' || (s.role || s.designation) === selectedSubValue;
    }
    if (filterCategory === 'Employment Type') {
      return selectedSubValue === 'All' || (s.employmentType || 'Full Time') === selectedSubValue;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getActionItems = (s) => [
    {
      label: 'View Profile',
      icon: Eye,
      onClick: () => onViewProfile ? onViewProfile(s) : setViewingProfileStaff(s)
    },
    {
      label: 'Edit Details',
      icon: Edit,
      onClick: () => setEditingStaff({ ...s })
    },
    {
      label: 'View Documents',
      icon: FileText,
      onClick: () => onViewProfile ? onViewProfile(s) : setViewingProfileStaff(s)
    },
    { divider: true },
    {
      label: 'Delete Staff Member',
      icon: Trash2,
      danger: true,
      onClick: () => handleDeleteStaff(s)
    }
  ];

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search staff name, ID, email, designation..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Category Filter Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setSelectedSubValue('All');
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All Staff">All Staff ({staffList.length})</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Department">Filter by Department</option>
                <option value="Designation">Filter by Designation</option>
                <option value="Employment Type">Filter by Employment Type</option>
              </select>
            </div>

            {/* Dynamic Value Selector (Shown if Department, Designation, or Employment Type is selected) */}
            {filterCategory === 'Department' && (
              <select
                value={selectedSubValue}
                onChange={(e) => { setSelectedSubValue(e.target.value); setCurrentPage(1); }}
                className="bg-emerald-50 border border-emerald-200 text-xs font-bold rounded-xl px-3 py-2 text-emerald-900 focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {deptOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {filterCategory === 'Designation' && (
              <select
                value={selectedSubValue}
                onChange={(e) => { setSelectedSubValue(e.target.value); setCurrentPage(1); }}
                className="bg-emerald-50 border border-emerald-200 text-xs font-bold rounded-xl px-3 py-2 text-emerald-900 focus:outline-none cursor-pointer"
              >
                <option value="All">All Designations</option>
                {roleOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            )}

            {filterCategory === 'Employment Type' && (
              <select
                value={selectedSubValue}
                onChange={(e) => { setSelectedSubValue(e.target.value); setCurrentPage(1); }}
                className="bg-emerald-50 border border-emerald-200 text-xs font-bold rounded-xl px-3 py-2 text-emerald-900 focus:outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                {empTypeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}

            {/* Add Staff Button inside All Staff page */}
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Staff Photo</th>
                <th className="p-3.5">Staff Name</th>
                <th className="p-3.5">Employee ID</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Contact Number</th>
                <th className="p-3.5">Joining Date</th>
                <th className="p-3.5">Employment Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-slate-500">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 font-serif">No Staff Members Found</p>
                    <p className="text-2xs text-slate-500 mt-1">
                      No staff members match the selected filter ({filterCategory}). Add a staff member using the button above.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff) => (
                  <tr key={staff.id || staff.employeeId || staff.firestoreId} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Staff Photo */}
                    <td className="p-3.5">
                      <img
                        src={staff.avatar || staff.photoDoc || '/image/logo.png'}
                        alt={staff.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20 bg-white shrink-0 cursor-pointer"
                        onClick={() => onViewProfile ? onViewProfile(staff) : setViewingProfileStaff(staff)}
                      />
                    </td>

                    {/* Staff Name */}
                    <td className="p-3.5 font-bold text-slate-900">
                      <span 
                        className="hover:text-emerald-700 cursor-pointer transition-colors"
                        onClick={() => onViewProfile ? onViewProfile(staff) : setViewingProfileStaff(staff)}
                      >
                        {staff.name}
                      </span>
                    </td>

                    {/* Employee ID */}
                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      {staff.id || staff.employeeId}
                    </td>

                    {/* Designation */}
                    <td className="p-3.5 font-bold text-emerald-800">
                      {staff.role || staff.designation}
                    </td>

                    {/* Department */}
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-2xs font-bold text-slate-700">
                        {staff.department}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="p-3.5 text-slate-600 truncate max-w-[150px]">
                      {staff.email}
                    </td>

                    {/* Contact Number */}
                    <td className="p-3.5 text-slate-600 whitespace-nowrap">
                      {staff.phone}
                    </td>

                    {/* Joining Date */}
                    <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">
                      {staff.joinDate || 'N/A'}
                    </td>

                    {/* Employment Type */}
                    <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-2xs font-bold">
                        {staff.employmentType || 'Full Time'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      {staff.status === 'Active' || staff.approvalStatus === 'Approved' || (!staff.status && !staff.approvalStatus) ? (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                          ● Active
                        </span>
                      ) : staff.status === 'Pending Approval' || staff.approvalStatus === 'Pending' ? (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold text-[10px]">
                          ⏳ Pending Approval
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px]">
                          ✕ Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions Menu */}
                    <td className="p-3.5 text-right">
                      <ActionPopover items={getActionItems(staff)} />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredStaff.length)}</strong> of <strong>{filteredStaff.length}</strong> staff members
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800 px-2">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Staff Profile Modal */}
      {viewingProfileStaff && (
        <StaffProfileModal
          staff={viewingProfileStaff}
          onClose={() => setViewingProfileStaff(null)}
          attendance={attendance}
          leaves={leaves}
          staffDocuments={staffDocuments}
          showToast={showToast}
        />
      )}
    </div>
  );
}
