import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, GraduationCap, Briefcase, Building2, 
  Heart, Star, Users, UserCheck, Inbox, 
  Newspaper, BarChart3, Settings as SettingsIcon, LogOut, 
  ChevronDown, ChevronRight, X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout 
}) {
  const [expandedSections, setExpandedSections] = useState({
    training: true,
    placement: false,
    partners: false,
    donations: false,
    stories: false,
    staff: false,
    volunteers: false,
    applications: false,
    content: false,
    reports: false,
    administration: false
  });

  const [activePopover, setActivePopover] = useState(null);
  const [popoverTop, setPopoverTop] = useState(0);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const [tooltipTop, setTooltipTop] = useState(0);

  const sidebarRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Close floating popovers if sidebar is expanded or activeTab changes
  useEffect(() => {
    setActivePopover(null);
    setHoveredTooltip(null);
  }, [isCollapsed, activeTab]);

  // Click outside and Escape key listeners
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        (!popoverRef.current || !popoverRef.current.contains(event.target))
      ) {
        setActivePopover(null);
        setHoveredTooltip(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActivePopover(null);
        setHoveredTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleItemClick = (itemId) => {
    setActiveTab(itemId);
    setActivePopover(null);
    setHoveredTooltip(null);
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  };

  const calculateTopPosition = (rectTop, popoverHeight = 340) => {
    const viewportHeight = window.innerHeight;
    if (rectTop + popoverHeight > viewportHeight - 20) {
      return Math.max(10, viewportHeight - popoverHeight - 20);
    }
    return Math.max(10, rectTop);
  };

  const handleMouseEnterItem = (item, e) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const calculatedTop = calculateTopPosition(rect.top, 340);
      
      if (item.hasSubmenu) {
        setPopoverTop(calculatedTop);
        setActivePopover(item.id);
        setHoveredTooltip(null);
      } else {
        setTooltipTop(rect.top + 8);
        setHoveredTooltip(item.id);
        setActivePopover(null);
      }
    }
  };

  const handleMouseLeaveItem = () => {
    if (isCollapsed) {
      closeTimeoutRef.current = setTimeout(() => {
        setActivePopover(null);
        setHoveredTooltip(null);
      }, 200);
    }
  };

  const handleMouseEnterPopover = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  const handleMouseLeavePopover = () => {
    if (isCollapsed) {
      closeTimeoutRef.current = setTimeout(() => {
        setActivePopover(null);
      }, 200);
    }
  };

  const handleModuleClick = (item, e) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const calculatedTop = calculateTopPosition(rect.top, 340);
      setPopoverTop(calculatedTop);
      setActivePopover(prev => (prev === item.id ? null : item.id));
      setHoveredTooltip(null);
    } else {
      toggleSection(item.id);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    
    // 📚 TRAINING
    {
      id: 'training',
      label: 'Training',
      icon: GraduationCap,
      hasSubmenu: true,
      subItems: [
        { id: 'programs', label: 'Training Programs' },
        { id: 'centers', label: 'Training Centres' },
        { id: 'batches', label: 'Batches' },
        { id: 'students', label: 'Students' },
        { id: 'trainers', label: 'Trainers' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'assessments', label: 'Assessments' },
        { id: 'certificates', label: 'Certificates' },
        { id: 'training-reports', label: 'Training Reports' }
      ]
    },

    // 💼 PLACEMENT
    {
      id: 'placement',
      label: 'Placement',
      icon: Briefcase,
      hasSubmenu: true,
      subItems: [
        { id: 'placement-overview', label: 'Placement Overview' },
        { id: 'students-seeking-jobs', label: 'Students Seeking Jobs' },
        { id: 'job-opportunities', label: 'Job Opportunities' },
        { id: 'interviews', label: 'Interviews' },
        { id: 'selected-students', label: 'Selected Students' },
        { id: 'employed-students', label: 'Employed Students' },
        { id: 'self-employed', label: 'Self-Employed' },
        { id: 'placement-reports', label: 'Placement Reports' }
      ]
    },

    // 🤝 PARTNERS
    {
      id: 'partners',
      label: 'Partners',
      icon: Building2,
      hasSubmenu: true,
      subItems: [
        { id: 'all-partners', label: 'All Partners' },
        { id: 'csr-partners', label: 'CSR Partners' },
        { id: 'corporate-partners', label: 'Corporate Partners' },
        { id: 'training-partners', label: 'Training Partners' },
        { id: 'employment-partners', label: 'Employment Partners' },
        { id: 'ngo-partners', label: 'NGO Partners' },
        { id: 'gov-partners', label: 'Government / Institutional' },
        { id: 'partner-applications', label: 'Partner Applications' }
      ]
    },

    // 💰 DONATIONS
    {
      id: 'donations',
      label: 'Donations',
      icon: Heart,
      hasSubmenu: true,
      subItems: [
        { id: 'donation-overview', label: 'Donation Overview' },
        { id: 'all-donations', label: 'All Donations' },
        { id: 'successful-donations', label: 'Successful Donations' },
        { id: 'pending-donations', label: 'Pending Donations' },
        { id: 'failed-donations', label: 'Failed / Refunded' },
        { id: 'campaigns', label: 'Campaigns' },
        { id: 'donation-receipts', label: 'Donation Receipts' }
      ]
    },

    // ⭐ SUCCESS STORIES
    {
      id: 'stories',
      label: 'Success Stories',
      icon: Star,
      hasSubmenu: true,
      subItems: [
        { id: 'all-stories', label: 'All Stories' },
        { id: 'add-success-story', label: 'Add Success Story' },
        { id: 'featured-stories', label: 'Featured Stories' },
        { id: 'draft-stories', label: 'Draft Stories' },
        { id: 'published-stories', label: 'Published Stories' }
      ]
    },

    // 👥 STAFF MEMBERS
    {
      id: 'staff',
      label: 'Staff Members',
      icon: Users,
      hasSubmenu: true,
      subItems: [
        { id: 'all-staff', label: 'All Staff' },
        { id: 'add-staff', label: 'Add Staff' },
        { id: 'staff-id-approval', label: 'Staff ID Approval' },
        { id: 'staff-id-cards', label: 'Staff ID Cards' },
        { id: 'staff-attendance', label: 'Staff Attendance' },
        { id: 'leave-management', label: 'Leave Management' },
        { id: 'staff-documents', label: 'Staff Documents' },
        { id: 'staff-departments', label: 'Departments' },
        { id: 'staff-reports', label: 'Staff Reports' }
      ]
    },

    // 🙋 VOLUNTEERS
    {
      id: 'volunteers',
      label: 'Volunteers',
      icon: UserCheck,
      hasSubmenu: true,
      subItems: [
        { id: 'all-volunteers', label: 'All Volunteers' },
        { id: 'volunteer-new-apps', label: 'New Applications' },
        { id: 'active-volunteers', label: 'Active Volunteers' },
        { id: 'volunteer-projects', label: 'Volunteer Projects' },
        { id: 'volunteer-reports', label: 'Volunteer Reports' }
      ]
    },

    // 📩 APPLICATIONS
    {
      id: 'applications',
      label: 'Applications',
      icon: Inbox,
      hasSubmenu: true,
      subItems: [
        { id: 'app-training', label: 'Training Applications' },
        { id: 'app-partner', label: 'Partner Applications' },
        { id: 'app-volunteer', label: 'Volunteer Applications' },
        { id: 'app-contact', label: 'Contact Enquiries' }
      ]
    },

    // 📰 CONTENT
    {
      id: 'content',
      label: 'Content',
      icon: Newspaper,
      hasSubmenu: true,
      subItems: [
        { id: 'content-news-blog', label: 'News & Blogs' },
        { id: 'content-events', label: 'Events' },
        { id: 'content-gallery', label: 'Gallery' },
        { id: 'content-homepage', label: 'Homepage Content' },
        { id: 'content-website-sections', label: 'Website Sections' }
      ]
    },

    // 📊 REPORTS
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      hasSubmenu: true,
      subItems: [
        { id: 'report-training', label: 'Training Reports' },
        { id: 'report-student', label: 'Student Reports' },
        { id: 'report-placement', label: 'Placement Reports' },
        { id: 'report-staff', label: 'Staff Reports' },
        { id: 'report-partner', label: 'Partner Reports' },
        { id: 'report-donation', label: 'Donation Reports' },
        { id: 'report-impact', label: 'Impact Reports' }
      ]
    },

    // ⚙️ ADMINISTRATION
    {
      id: 'administration',
      label: 'Administration',
      icon: SettingsIcon,
      hasSubmenu: true,
      subItems: [
        { id: 'admin-users-roles', label: 'Users & Roles' },
        { id: 'admin-notifications', label: 'Notifications' },
        { id: 'admin-documents', label: 'Documents' },
        { id: 'admin-settings', label: 'Settings' },
        { id: 'admin-activity-logs', label: 'Activity Logs' }
      ]
    }
  ];

  const activePopoverItem = navItems.find(item => item.id === activePopover);

  const SidebarContent = (
    <div 
      ref={sidebarRef}
      className="h-full flex flex-col bg-[#111827] text-slate-200 select-none shadow-xl relative border-r border-slate-800"
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center border-b border-slate-800/80 text-center relative">
        <div className="flex flex-col items-center cursor-pointer group" onClick={() => handleItemClick('dashboard')}>
          <img 
            src="/image/logo.png" 
            alt="Life Vision Society Logo" 
            className={`${isCollapsed ? 'h-10 w-10' : 'h-14 w-auto'} object-contain filter drop-shadow-md mb-1 transition-all group-hover:scale-105`} 
          />
          {!isCollapsed && (
            <div className="text-center">
              <h2 className="text-sm font-bold text-white font-serif tracking-tight">Life Vision Society</h2>
              <p className="text-[10px] text-pink-500 font-bold tracking-tight italic">Empowering Lives, Inspiring Futures</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Scroll Container */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isGroupExpanded = expandedSections[item.id];
          const isDirectActive = activeTab === item.id;
          const isChildActive = item.hasSubmenu && item.subItems?.some(sub => sub.id === activeTab);
          const isActive = isDirectActive || isChildActive;

          if (!item.hasSubmenu) {
            return (
              <div 
                key={item.id}
                onMouseEnter={(e) => handleMouseEnterItem(item, e)}
                onMouseLeave={handleMouseLeaveItem}
                className="relative"
              >
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'} rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-[#D92656] text-white shadow-lg shadow-rose-950/50' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                </button>

                {/* Collapsed mode single tooltip */}
                {isCollapsed && hoveredTooltip === item.id && (
                  <div 
                    className="fixed left-20 z-[9999] px-3 py-1.5 bg-[#1F2937] text-white text-xs font-bold rounded-xl border border-slate-700 shadow-2xl pointer-events-none animate-fade-in"
                    style={{ top: `${tooltipTop}px` }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div 
              key={item.id} 
              className="space-y-1 relative"
              onMouseEnter={(e) => handleMouseEnterItem(item, e)}
              onMouseLeave={handleMouseLeaveItem}
            >
              <button
                onClick={(e) => handleModuleClick(item, e)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'} rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isChildActive 
                    ? 'text-white bg-slate-800/90 font-bold border-l-4 border-[#D92656]' 
                    : activePopover === item.id && isCollapsed
                    ? 'text-white bg-slate-800 border-l-4 border-[#D92656]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isChildActive || activePopover === item.id ? 'text-pink-500' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && (
                  isGroupExpanded 
                    ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> 
                    : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Submenu Accordion for Expanded Sidebar */}
              {!isCollapsed && isGroupExpanded && (
                <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-800 ml-4 animate-fade-in">
                  {item.subItems.map((sub) => {
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleItemClick(sub.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          isSubActive
                            ? 'text-white font-bold bg-[#D92656] shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Logout */}
      <div className="p-3 border-t border-slate-800 bg-[#0B0F19]">
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center py-2.5' : 'space-x-3 px-3 py-2.5'} rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Floating Popover Dropdown when Sidebar is Collapsed (Strict Floating position right of sidebar above all dashboard elements) */}
      {isCollapsed && activePopoverItem && (
        <div 
          ref={popoverRef}
          onMouseEnter={handleMouseEnterPopover}
          onMouseLeave={handleMouseLeavePopover}
          className="fixed left-20 z-[9999] w-64 bg-[#1F2937] border border-slate-700/90 rounded-2xl p-3 shadow-2xl ring-1 ring-black/20 animate-fade-in space-y-1.5 drop-shadow-2xl"
          style={{ top: `${popoverTop}px` }}
        >
          {/* Header */}
          <div className="px-3 py-2 text-xs font-bold text-white border-b border-slate-700/80 flex items-center justify-between bg-[#111827]/80 rounded-xl">
            <div className="flex items-center space-x-2">
              {React.createElement(activePopoverItem.icon, { className: "w-4 h-4 text-pink-500" })}
              <span className="text-slate-100">{activePopoverItem.label}</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-pink-400 font-extrabold bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-800/40">
              Module
            </span>
          </div>

          {/* Submenu Item Links */}
          <div className="max-h-72 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {activePopoverItem.subItems.map((sub) => {
              const isSubActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleItemClick(sub.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                    isSubActive
                      ? 'text-white font-bold bg-[#D92656] shadow-md shadow-rose-950/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span>{sub.label}</span>
                  {isSubActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block h-screen sticky top-0 transition-all duration-300 shrink-0 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 h-full">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
