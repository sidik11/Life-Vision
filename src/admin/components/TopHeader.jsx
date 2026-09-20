import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, Search, ChevronDown, User, Settings, 
  HelpCircle, LogOut, CheckCircle2, X, Command
} from 'lucide-react';

export default function TopHeader({ 
  activeTab, 
  setActiveTab,
  isCollapsed, 
  setIsCollapsed,
  setMobileOpen,
  user,
  onLogout,
  unreadCount = 0
}) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const breadcrumbMap = {
    'dashboard': ['Dashboard', 'Operational Overview'],
    
    // Training
    'programs': ['Training', 'Training Programs'],
    'centers': ['Training', 'Training Centres'],
    'batches': ['Training', 'Batches'],
    'students': ['Training', 'Students'],
    'trainers': ['Training', 'Trainers'],
    'attendance': ['Training', 'Attendance'],
    'assessments': ['Training', 'Assessments'],
    'certificates': ['Training', 'Certificates'],
    'training-reports': ['Training', 'Training Reports'],

    // Placement
    'placement-overview': ['Placement', 'Placement Overview'],
    'students-seeking-jobs': ['Placement', 'Students Seeking Jobs'],
    'job-opportunities': ['Placement', 'Job Opportunities'],
    'interviews': ['Placement', 'Interviews'],
    'selected-students': ['Placement', 'Selected Students'],
    'employed-students': ['Placement', 'Employed Students'],
    'self-employed': ['Placement', 'Self-Employed'],
    'placement-reports': ['Placement', 'Placement Reports'],

    // Partners
    'all-partners': ['Partners', 'All Partners'],
    'csr-partners': ['Partners', 'CSR Partners'],
    'corporate-partners': ['Partners', 'Corporate Partners'],
    'training-partners': ['Partners', 'Training Partners'],
    'employment-partners': ['Partners', 'Employment Partners'],
    'ngo-partners': ['Partners', 'NGO Partners'],
    'gov-partners': ['Partners', 'Government / Institutional'],
    'partner-applications': ['Partners', 'Partner Applications'],

    // Donations
    'donation-overview': ['Donations', 'Donation Overview'],
    'all-donations': ['Donations', 'All Donations'],
    'successful-donations': ['Donations', 'Successful Donations'],
    'pending-donations': ['Donations', 'Pending Donations'],
    'failed-donations': ['Donations', 'Failed / Refunded'],
    'campaigns': ['Donations', 'Campaigns'],
    'donation-receipts': ['Donations', 'Donation Receipts'],

    // Success Stories
    'all-stories': ['Success Stories', 'All Stories'],
    'add-success-story': ['Success Stories', 'Add Success Story'],
    'featured-stories': ['Success Stories', 'Featured Stories'],
    'draft-stories': ['Success Stories', 'Draft Stories'],
    'published-stories': ['Success Stories', 'Published Stories'],

    // Staff
    'all-staff': ['Staff Members', 'All Staff'],
    'add-staff': ['Staff Members', 'Add Staff'],
    'staff-id-cards': ['Staff Members', 'Staff ID Cards'],
    'staff-attendance': ['Staff Members', 'Staff Attendance'],
    'leave-management': ['Staff Members', 'Leave Management'],
    'staff-documents': ['Staff Members', 'Staff Document'],
    'staff-departments': ['Staff Members', 'Department'],
    'staff-reports': ['Staff Members', 'Staff Report'],

    // Volunteers
    'all-volunteers': ['Volunteers', 'All Volunteers'],
    'volunteer-new-apps': ['Volunteers', 'New Applications'],
    'active-volunteers': ['Volunteers', 'Active Volunteers'],
    'volunteer-projects': ['Volunteers', 'Volunteer Projects'],
    'volunteer-reports': ['Volunteers', 'Volunteer Reports'],

    // Applications
    'app-training': ['Applications', 'Training Applications'],
    'app-partner': ['Applications', 'Partner Applications'],
    'app-volunteer': ['Applications', 'Volunteer Applications'],
    'app-contact': ['Applications', 'Contact Enquiries'],

    // Content
    'content-news-blog': ['Content', 'News & Blogs'],
    'content-events': ['Content', 'Events'],
    'content-gallery': ['Content', 'Gallery'],
    'content-homepage': ['Content', 'Homepage Content'],
    'content-website-sections': ['Content', 'Website Sections'],

    // Reports
    'report-training': ['Reports', 'Training Reports'],
    'report-student': ['Reports', 'Student Reports'],
    'report-placement': ['Reports', 'Placement Reports'],
    'report-staff': ['Reports', 'Staff Reports'],
    'report-partner': ['Reports', 'Partner Reports'],
    'report-donation': ['Reports', 'Donation Reports'],
    'report-impact': ['Reports', 'Impact Reports'],

    // Administration
    'admin-users-roles': ['Administration', 'Users & Roles'],
    'admin-notifications': ['Administration', 'Notifications'],
    'admin-documents': ['Administration', 'Documents'],
    'admin-settings': ['Administration', 'Settings'],
    'admin-activity-logs': ['Administration', 'Activity Logs']
  };

  const breadcrumbs = breadcrumbMap[activeTab] || ['Dashboard', 'Overview'];

  const notifications = [
    { id: 1, title: 'New Public Training Application', desc: 'Sunita Sahu applied for Tailoring & Stitching (Bhubaneswar Hub)', time: '10 mins ago', type: 'app', unread: true },
    { id: 2, title: 'CSR Grant Sanctioned', desc: 'HDFC Parivartan released ₹45,00,000 for women empowerment', time: '2 hours ago', type: 'grant', unread: true },
    { id: 3, title: 'Batch Completed & Certified', desc: 'BATCH-2026-T1 completed graduation with 96% pass rate', time: 'Yesterday', type: 'batch', unread: false }
  ];

  return (
    <header className="h-20 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left side: Toggle & Breadcrumb */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen(true);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
          className="p-2 rounded-xl text-[#1E293B] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-[#64748B]">{breadcrumbs[0]}</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#1E293B] font-extrabold">{breadcrumbs[1]}</span>
        </nav>
      </div>

      {/* Right side: Global Search, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="hidden sm:flex items-center space-x-3 px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-slate-300 rounded-xl text-xs text-[#64748B] transition-all cursor-pointer w-48 lg:w-64 justify-between shadow-xs"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-[#64748B]" />
            <span>Search applications...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#1E293B] bg-white border border-[#E2E8F0] rounded-md shadow-xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        <button
          onClick={() => setShowSearchModal(true)}
          className="sm:hidden p-2 rounded-xl text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
            }}
            className="p-2 rounded-xl text-[#2563EB] hover:bg-[#F8FAFC] transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F59E0B] rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="p-4 bg-[#123B5D] border-b border-[#123B5D] flex items-center justify-between text-white">
                <h3 className="text-xs font-bold uppercase tracking-wider">System Notifications</h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#F59E0B] text-slate-950 rounded-full">
                  {unreadCount > 0 ? `${unreadCount} Unread` : 'Notifications'}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => {
                      setActiveTab('admin-notifications');
                      setShowNotifications(false);
                    }}
                    className={`p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-start space-x-3 ${
                      n.unread ? 'bg-blue-50/60 font-semibold' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-blue-100 text-[#2563EB] shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#1E293B] truncate">{n.title}</h4>
                        <span className="text-[10px] text-[#64748B] shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
                <button
                  onClick={() => {
                    setActiveTab('admin-notifications');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-bold text-[#2563EB] hover:underline transition-colors"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-all cursor-pointer border border-transparent hover:border-[#E2E8F0]"
          >
            <img
              src={user?.avatar || "/image/logo.png"}
              alt="Admin Avatar"
              className="w-9 h-9 rounded-xl object-contain p-0.5 bg-white ring-2 ring-[#16A34A]"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-[#1E293B]">{user?.name || "Life Vision Society"}</div>
              <div className="text-[10px] font-extrabold text-[#16A34A] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                {user?.role || "Super Admin"}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#64748B] hidden md:block" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 py-2">
              <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <p className="text-xs font-bold text-[#1E293B]">{user?.name || "Life Vision Society"}</p>
                <p className="text-[11px] text-[#64748B] truncate">{user?.email || "support.lifevision@gmail.com"}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('admin-settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] flex items-center space-x-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#64748B]" />
                  <span>Profile Settings</span>
                </button>
              </div>

              <div className="border-t border-[#E2E8F0] pt-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#DC2626] hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#DC2626]" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#123B5D]/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center space-x-3 bg-[#F8FAFC]">
              <Search className="w-5 h-5 text-[#64748B] shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real applications, programs, Odisha centers, certificates..."
                className="w-full bg-transparent text-sm text-[#1E293B] font-medium placeholder-[#64748B] focus:outline-none"
              />
              <button onClick={() => setShowSearchModal(false)} className="p-1 text-[#64748B] hover:text-[#1E293B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-2 text-xs">
              <p className="text-[11px] font-semibold text-[#64748B] uppercase">Search Results</p>
              
              <div 
                onClick={() => { setActiveTab('app-training'); setShowSearchModal(false); }}
                className="p-3 bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] rounded-xl flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold text-[#1E293B]">Sunita Sahu - Fashion Boutique Application</div>
                  <div className="text-[11px] text-[#64748B]">ID: APP-LVS-2026-001 • Bhubaneswar Hub</div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-[#16A34A] rounded-md font-bold text-[10px]">Selected</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
