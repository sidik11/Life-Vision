import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { 
  Search, Filter, Download, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, ArrowUpDown, Calendar, MapPin
} from 'lucide-react';

export default function TrainingAppsView({ 
  applications = [], 
  onViewApp, 
  onDeleteApp, 
  onShowToast,
  activeTab = 'app-training'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(() => {
    if (activeTab === 'app-volunteer') return 'Volunteer';
    if (activeTab === 'app-partner') return 'Partner';
    if (activeTab === 'app-contact') return 'Contact';
    return 'All';
  });
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortField, setSortField] = useState('applicationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredApps = useMemo(() => {
    return (applications || []).filter(app => {
      if (!app) return false;
      
      const appType = String(app.type || app.applicationType || '').toLowerCase();
      const appCourse = String(app.course || '').toLowerCase();

      // Category matching
      if (categoryFilter === 'Volunteer' || activeTab === 'app-volunteer') {
        if (!appType.includes('volunteer') && !appCourse.includes('volunteer')) return false;
      } else if (categoryFilter === 'Partner' || activeTab === 'app-partner') {
        if (!appType.includes('partner') && !appCourse.includes('partner')) return false;
      } else if (categoryFilter === 'Contact' || activeTab === 'app-contact') {
        if (!appType.includes('contact')) return false;
      } else if (categoryFilter === 'Training' || activeTab === 'app-training') {
        if (appType.includes('volunteer') || appType.includes('partner') || appType.includes('contact')) return false;
      }

      const appName = String(app.name || app.fullName || '').toLowerCase();
      const appId = String(app.id || '').toLowerCase();
      const appMobile = String(app.mobile || app.phone || '');
      const appStatus = String(app.status || 'New');
      const appLocation = String(app.location || app.address || app.district || '');

      const matchesSearch = appName.includes(searchTerm.toLowerCase()) ||
                            appId.includes(searchTerm.toLowerCase()) ||
                            appMobile.includes(searchTerm);
      const matchesCourse = courseFilter === 'All' || appCourse.includes(courseFilter.toLowerCase());
      const matchesStatus = statusFilter === 'All' || appStatus === statusFilter;
      const matchesLocation = locationFilter === 'All' || appLocation.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesCourse && matchesStatus && matchesLocation;
    }).sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [applications, activeTab, categoryFilter, searchTerm, courseFilter, statusFilter, locationFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    onShowToast('Exported applications report to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">Training Applications</h1>
          <p className="text-xs text-[#64748B]">Real candidate applications submitted via the public website</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Secondary Button: Blue #2563EB */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, ID or phone..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>

          {/* Filter Course */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
          >
            <option value="All">All Courses</option>
            <option value="Tailoring">Tailoring & Stitching</option>
            <option value="Beautician">Beautician & Wellness</option>
            <option value="Agriculture">Agriculture & Farming</option>
            <option value="Healthcare">Healthcare & Caregiving</option>
            <option value="Food & Beverage">Food & Beverages</option>
            <option value="Tourism">Tourism & Hospitality</option>
          </select>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Selected">Selected</option>
            <option value="Waitlisted">Waitlisted</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Filter Location */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
          >
            <option value="All">All Locations</option>
            <option value="Bhubaneswar">Bhubaneswar, Odisha</option>
            <option value="Cuttack">Cuttack, Odisha</option>
            <option value="Puri">Puri District, Odisha</option>
            <option value="Khordha">Khordha, Odisha</option>
            <option value="Ganjam">Ganjam District, Odisha</option>
          </select>

        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B] bg-[#F8FAFC] uppercase tracking-wider font-bold">
                <th className="p-4">App ID</th>
                <th className="p-4">Applicant</th>
                <th className="p-4">Gender / Age</th>
                <th className="p-4">Course</th>
                <th className="p-4">Location</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#64748B] font-medium">
                    No applications found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#2563EB]">{app.id}</td>
                    <td className="p-4 font-semibold text-[#1E293B]">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={app.photo} 
                          alt={app.name} 
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#E2E8F0] shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-[#1E293B]">{app.name}</div>
                          <div className="text-[10px] text-[#64748B]">{app.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#1E293B]">{app.gender}, {app.age} Yrs</td>
                    <td className="p-4 font-bold text-[#1E293B]">{app.course}</td>
                    <td className="p-4 text-[#64748B]">{app.location}</td>
                    <td className="p-4 text-[#64748B]">{app.applicationDate}</td>
                    <td className="p-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <ActionPopover
                        items={[
                          { label: 'View Application Details', icon: Eye, onClick: () => onViewApp(app) },
                          { divider: true },
                          { label: 'Delete Application', icon: Trash2, danger: true, onClick: () => onDeleteApp(app.id) }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B] font-semibold">
          <span>Showing {paginatedApps.length} of {filteredApps.length} Applications</span>
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 text-[#1E293B]" />
            </button>
            <span className="font-bold text-[#1E293B]">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4 text-[#1E293B]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
