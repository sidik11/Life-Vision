import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, Search, ChevronDown, User, Settings, 
  LogOut, CheckCheck, X, Command, Phone, Mail, 
  GraduationCap, Briefcase, Heart, MessageSquare, Handshake, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function TopHeader({ 
  activeTab, 
  setActiveTab,
  isCollapsed, 
  setIsCollapsed,
  setMobileOpen,
  user,
  onLogout,
  applications = [],
  placements = [],
  volunteers = [],
  contacts = [],
  partners = [],
  programs = [],
  centers = []
}) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Read notifications tracked in localStorage
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('lvs_read_notification_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
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
    'app-training': ['Training', 'Training Applications'],
    'training-reports': ['Training', 'Training Reports'],

    // Placement Support / Support Applications
    'placement': ['Placement Support', 'Support Applications'],
    'placement-applications': ['Placement Support', 'Support Applications'],
    'placement-overview': ['Placement Support', 'Support Applications'],
    'students-seeking-jobs': ['Placement Support', 'Support Applications'],
    'job-opportunities': ['Placement Support', 'Support Applications'],
    'interviews': ['Placement Support', 'Support Applications'],
    'selected-students': ['Placement Support', 'Support Applications'],
    'employed-students': ['Placement Support', 'Support Applications'],
    'self-employed': ['Placement Support', 'Support Applications'],
    'placement-reports': ['Placement Support', 'Support Applications'],

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
    'volunteer-applications': ['Volunteers', 'Volunteer Applications'],
    'volunteer-new-apps': ['Volunteers', 'Volunteer Applications'],
    'active-volunteers': ['Volunteers', 'Active Volunteers'],
    'volunteer-projects': ['Volunteers', 'Volunteer Projects'],
    'volunteer-reports': ['Volunteers', 'Volunteer Reports'],

    // Contact Details
    'contact-details': ['Contact Details', 'Contact Enquiries'],
    'app-contact': ['Contact Details', 'Contact Enquiries'],

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
    'admin-notifications': ['Administration', 'Notifications'],
    'admin-settings': ['Administration', 'Settings'],
    'admin-scanner': ['Administration', 'Scanner'],
    'admin-activity-logs': ['Administration', 'Activity Logs']
  };

  const breadcrumbs = breadcrumbMap[activeTab] || ['Dashboard', 'Overview'];

  // Build Real Notifications from all 5 application sections
  const realNotifications = [
    ...applications.map(item => ({
      id: `train-${item.id || item.firestoreId}`,
      type: 'training',
      badgeLabel: 'Training App',
      icon: GraduationCap,
      color: 'bg-emerald-100 text-emerald-700',
      title: item.studentName || item.fullName || item.name || 'New Training Student',
      desc: `Applied for ${item.courseName || item.program || item.trade || 'Training Program'} (${item.district || item.state || 'Odisha'})`,
      time: item.appliedDate || item.appliedAt || item.createdAt || 'Recent',
      tab: 'app-training'
    })),
    ...placements.map(item => ({
      id: `place-${item.id || item.firestoreId}`,
      type: 'placement',
      badgeLabel: 'Placement Support',
      icon: Briefcase,
      color: 'bg-purple-100 text-purple-700',
      title: item.studentName || item.student || item.fullName || item.name || 'New Placement Applicant',
      desc: `${item.supportType || item.preferredJobRole || 'Tuition Fee Sponsorship & Placement'} • ${item.district || item.state || 'Odisha'}`,
      time: item.appliedDate || item.applicationDate || item.appliedAt || 'Recent',
      tab: 'placement-applications'
    })),
    ...volunteers.map(item => ({
      id: `vol-${item.id || item.firestoreId}`,
      type: 'volunteer',
      badgeLabel: 'Volunteer App',
      icon: Heart,
      color: 'bg-pink-100 text-pink-700',
      title: item.fullName || item.name || 'New Volunteer Applicant',
      desc: `Volunteer for ${item.role || item.area || 'Social Support Work'} (${item.city || item.state || 'Location'})`,
      time: item.appliedDate || item.appliedAt || item.date || 'Recent',
      tab: 'volunteer-applications'
    })),
    ...contacts.map(item => ({
      id: `contact-${item.id || item.firestoreId}`,
      type: 'contact',
      badgeLabel: 'Contact Enquiry',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-700',
      title: item.name || item.fullName || 'New Contact Inquiry',
      desc: `${item.subject || item.message || 'General Website Contact Inquiry'}`,
      time: item.date || item.appliedAt || item.createdAt || 'Recent',
      tab: 'contact-details'
    })),
    ...partners.map(item => ({
      id: `part-${item.id || item.firestoreId}`,
      type: 'partner',
      badgeLabel: 'Partner App',
      icon: Handshake,
      color: 'bg-amber-100 text-amber-800',
      title: item.orgName || item.organizationName || item.name || 'New Partner Applicant',
      desc: `${item.partnerType || item.type || 'CSR / Corporate Partnership Collaboration'}`,
      time: item.date || item.appliedAt || item.createdAt || 'Recent',
      tab: 'partner-applications'
    }))
  ];

  // Calculate Unread Count
  const unreadCount = realNotifications.filter(n => !readIds.includes(n.id)).length;

  const handleMarkAllRead = () => {
    const allIds = realNotifications.map(n => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('lvs_read_notification_ids', JSON.stringify(allIds));
    } catch (e) {}
  };

  const handleNotificationClick = (item) => {
    if (!readIds.includes(item.id)) {
      const nextRead = [...readIds, item.id];
      setReadIds(nextRead);
      try {
        localStorage.setItem('lvs_read_notification_ids', JSON.stringify(nextRead));
      } catch (e) {}
    }
    setActiveTab(item.tab);
    setShowNotifications(false);
  };

  // Real Search Filtering across real records
  const searchResults = realNotifications.filter(n => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;
    return (
      n.title.toLowerCase().includes(query) ||
      n.desc.toLowerCase().includes(query) ||
      n.badgeLabel.toLowerCase().includes(query) ||
      (n.id && n.id.toLowerCase().includes(query))
    );
  });

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

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(prev => !prev);
              setShowProfileDropdown(false);
            }}
            className="p-2 rounded-xl text-[#2563EB] hover:bg-[#F8FAFC] transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-rose-600 text-white rounded-full ring-2 ring-white animate-pulse min-w-[18px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 overflow-hidden">
              
              {/* Header */}
              <div className="p-4 bg-[#123B5D] text-white flex items-center justify-between border-b border-[#123B5D]">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-pink-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Live System Notifications</h3>
                </div>
                
                {unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllRead}
                    className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark All Read</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    All Read
                  </span>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
                {realNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                    <p className="font-bold">No Applications Yet</p>
                    <p className="text-[11px]">When users apply on the main website, notifications will appear here.</p>
                  </div>
                ) : (
                  realNotifications.map((n) => {
                    const IconComp = n.icon;
                    const isUnread = !readIds.includes(n.id);
                    return (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-start space-x-3 ${
                          isUnread ? 'bg-blue-50/70 font-semibold' : 'opacity-85'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${n.color} shrink-0 mt-0.5`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                              {n.badgeLabel}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.time}</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#1E293B] truncate mt-1">{n.title}</h4>
                          <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">{n.desc}</p>
                        </div>
                        {isUnread && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-2" title="Unread" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mark All Read</span>
                </button>
                
                <span className="text-[10px] font-medium text-slate-400">
                  {realNotifications.length} Total Applications
                </span>
              </div>

            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileDropdown(prev => !prev);
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
            <div className="absolute right-0 mt-3 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-[#E2E8F0] bg-slate-50 space-y-1.5">
                <div className="flex items-center space-x-2.5">
                  <img src={user?.avatar || "/image/logo.png"} alt="Avatar" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 ring-2 ring-emerald-500 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#1E293B] truncate">{user?.name || "Life Vision Society"}</p>
                    <p className="text-[10px] font-extrabold text-[#16A34A]">{user?.role || "Super Admin"}</p>
                  </div>
                </div>

                <div className="pt-1.5 space-y-1 text-[11px] text-[#64748B]">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{user?.email || "support.lifevision@gmail.com"}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('admin-settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#1E293B] hover:bg-[#F8FAFC] flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <User className="w-4 h-4 text-[#64748B]" />
                  <span>Profile Settings</span>
                </button>
              </div>

              <div className="border-t border-[#E2E8F0] pt-1">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-[#DC2626] hover:bg-rose-50 flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#DC2626]" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Global Real Data Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-[#123B5D]/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Search Input Bar */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center space-x-3 bg-[#F8FAFC]">
              <Search className="w-5 h-5 text-[#64748B] shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real applications (Training, Placement, Volunteer, Contact, Partner)..."
                className="w-full bg-transparent text-sm text-[#1E293B] font-medium placeholder-[#64748B] focus:outline-none"
              />
              <button onClick={() => setShowSearchModal(false)} className="p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results List */}
            <div className="p-4 max-h-96 overflow-y-auto space-y-2 text-xs">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                {searchQuery ? `Search Results (${searchResults.length})` : 'Recent Submissions across Admin Sections'}
              </p>

              {(searchQuery ? searchResults : realNotifications.slice(0, 8)).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No matching application records found for "{searchQuery}".
                </div>
              ) : (
                (searchQuery ? searchResults : realNotifications.slice(0, 8)).map(n => {
                  const IconComp = n.icon;
                  return (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className="p-3 bg-[#F8FAFC] hover:bg-blue-50/70 border border-[#E2E8F0] hover:border-blue-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-2 rounded-xl ${n.color} shrink-0`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#1E293B] text-xs truncate">{n.title}</div>
                          <div className="text-[11px] text-[#64748B] truncate">{n.desc}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold text-[10px] uppercase">
                          {n.badgeLabel}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center text-[11px] text-slate-500 font-medium">
              Click any application to jump directly to its management view.
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
