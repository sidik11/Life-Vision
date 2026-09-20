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
  onOpenCardModal,
  onEditStaff,
  onDeleteStaff,
  onOpenAddModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'id' | 'joinDate'
  
  // Modals state
  const [viewingProfileStaff, setViewingProfileStaff] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Department options dynamically populated from departments prop + default departments
  const deptOptions = Array.from(new Set([
    'All',
    'Mobilization',
    'Training',
    'Placement & Livelihood',
    'Operations',
    'Finance',
    'Management',
    'IT & Support',
    ...departments.map(d => d.departmentName).filter(Boolean)
  ]));

  // Designation options
  const roleOptions = Array.from(new Set([
    'All',
    ...staffList.map(s => s.role || s.designation).filter(Boolean)
  ]));

  // Filter staff records
  const filteredStaff = staffList.filter(s => {
    const term = searchQuery.toLowerCase();
    const nameMatch = (s.name || '').toLowerCase().includes(term);
    const idMatch = (s.id || s.employeeId || '').toLowerCase().includes(term);
    const emailMatch = (s.email || '').toLowerCase().includes(term);
    const phoneMatch = (s.phone || '').toLowerCase().includes(term);
    const roleMatch = (s.role || s.designation || '').toLowerCase().includes(term);
    const matchesSearch = nameMatch || idMatch || emailMatch || phoneMatch || roleMatch;

    const matchesDept = selectedDept === 'All' || s.department === selectedDept;
    const matchesRole = selectedRole === 'All' || (s.role || s.designation) === selectedRole;
    
    let matchesStatus = true;
    if (selectedStatus === 'Active') {
      matchesStatus = s.status === 'Active' || s.approvalStatus === 'Approved' || (!s.status && !s.approvalStatus);
    } else if (selectedStatus === 'Inactive') {
      matchesStatus = s.status === 'Inactive' || s.status === 'Rejected' || s.approvalStatus === 'Rejected';
    } else if (selectedStatus === 'Pending') {
      matchesStatus = s.status === 'Pending Approval' || s.approvalStatus === 'Pending';
    }

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  // Sorting
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'id') return (a.id || a.employeeId || '').localeCompare(b.id || b.employeeId || '');
    if (sortBy === 'joinDate') return new Date(b.joinDate || 0) - new Date(a.joinDate || 0);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedStaff.length / itemsPerPage) || 1;
  const paginatedStaff = sortedStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getActionItems = (s) => [
    {
      label: 'View Profile',
      icon: Eye,
      onClick: () => setViewingProfileStaff(s)
    },
    {
      label: 'Edit Staff Details',
      icon: Edit,
      onClick: () => onEditStaff(s)
    },
    {
      label: 'View ID Card',
      icon: IdCard,
      onClick: () => onOpenCardModal(s)
    },
    {
      label: 'View Documents',
      icon: FileText,
      onClick: () => onNavigateTab('staff-documents', s)
    },
    {
      label: 'View Attendance',
      icon: Calendar,
      onClick: () => onNavigateTab('staff-attendance', s)
    },
    {
      label: 'View Leave',
      icon: Clock,
      onClick: () => onNavigateTab('leave-management', s)
    },
    { divider: true },
    {
      label: 'Delete Staff Member',
      icon: Trash2,
      danger: true,
      onClick: () => onDeleteStaff(s)
    }
  ];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
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
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Departments</option>
              {deptOptions.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Designation Filter */}
            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Designations</option>
              {roleOptions.filter(r => r !== 'All').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active / Approved</option>
              <option value="Pending">Pending Approval</option>
              <option value="Inactive">Inactive / Rejected</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="id">Sort by Employee ID</option>
              <option value="joinDate">Sort by Joining Date</option>
            </select>

            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
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
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Employee ID</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Joining Date</th>
                <th className="p-3.5">Employment Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 font-serif">No Staff Members Found</p>
                    <p className="text-2xs text-slate-500 mt-1">
                      No staff members match the current search or filter criteria. Add a staff member using the button above.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff) => (
                  <tr key={staff.id || staff.employeeId || staff.firestoreId} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Staff Photo & Name */}
                    <td className="p-3.5">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer group"
                        onClick={() => setViewingProfileStaff(staff)}
                      >
                        <img
                          src={staff.avatar || staff.photoDoc || '/image/logo.png'}
                          alt={staff.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20 bg-white shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {staff.name}
                          </div>
                          {staff.bloodGroup && (
                            <span className="text-[10px] font-extrabold text-rose-600 block">
                              🩸 {staff.bloodGroup}
                            </span>
                          )}
                        </div>
                      </div>
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

                    {/* Contact Details */}
                    <td className="p-3.5 space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-2xs">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{staff.email}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-2xs">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{staff.phone}</span>
                      </div>
                    </td>

                    {/* Joining Date */}
                    <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">
                      {staff.joinDate || 'N/A'}
                    </td>

                    {/* Employment Type */}
                    <td className="p-3.5 font-medium text-slate-700">
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
                          ✗ Inactive
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
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, sortedStaff.length)}</strong> of <strong>{sortedStaff.length}</strong> staff members
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
        />
      )}
    </div>
  );
}
