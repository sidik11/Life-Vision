import React, { useState, useRef } from 'react';
import { 
  ChevronDown, ChevronRight, Menu, X, Heart, 
  BookOpen, Target, Users, Award, Handshake, 
  Sparkles, Scissors, Sprout, HeartPulse, Briefcase, 
  GraduationCap, Calendar, MapPin, FileCheck, 
  Star, Image as ImageIcon, Globe, ShieldCheck, UserCheck, Send 
} from 'lucide-react';

export default function Navbar({ activeSection, setActiveSection, onOpenDonate, onOpenVolunteer, onOpenApply, onOpenStudentPlacement, onOpenCsr }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState({});
  const leaveTimeoutRef = useRef(null);

  const handleMouseEnter = (id) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { 
      name: 'About Us', 
      id: 'about',
      hasDropdown: true,
      categoryBadge: 'Our NGO Identity',
      headerTheme: 'from-[#4A1039] via-[#6B1D52] to-[#8C2366]',
      accentColor: 'text-[#C52B75]',
      borderHover: 'hover:border-[#C52B75]',
      bgHover: 'hover:bg-pink-50/90',
      dropdownItems: [
        { name: 'Our Story & Purpose', targetId: 'our-story', icon: BookOpen, desc: 'Origins of Life Vision Society' },
        { name: 'Vision & Mission', targetId: 'vision-mission', icon: Target, desc: 'Empowerment & social goals' },
        { name: 'Trustees & Leadership', targetId: 'our-team', icon: Users, desc: 'Managing board & founders' },
        { name: '80G & Governance', targetId: 'governance-status', icon: ShieldCheck, desc: '80G tax exemption & compliance' },
        { name: 'CSR Partners', targetId: 'partners', icon: Handshake, desc: 'Corporate collaborators' },
      ]
    },
    { 
      name: 'Social Causes', 
      id: 'programs',
      hasDropdown: true,
      categoryBadge: 'Welfare Initiatives',
      headerTheme: 'from-[#4A1039] via-[#6B1D52] to-[#8C2366]',
      accentColor: 'text-[#C52B75]',
      borderHover: 'hover:border-[#C52B75]',
      bgHover: 'hover:bg-pink-50/90',
      dropdownItems: [
        { name: 'Women Empowerment & Work Support', targetId: 'women-empowerment', icon: Heart, desc: 'Free skill drives & work toolkits' },
        { name: 'Student Study & Placement Aid', page: 'training', targetId: 'student-education-aid', icon: GraduationCap, badge: 'Scholarships', desc: 'Tuition aid & placement support' },
        { name: 'Community Healthcare Camps', targetId: 'healthcare-programs', icon: HeartPulse, desc: 'Free doctor checkups & medicines' },
        { name: 'Women Tailoring Livelihoods', targetId: 'tailoring-training', icon: Scissors, desc: 'Sewing machine skill kits' },
        { name: 'Beauty & Wellness', targetId: 'beautician-training', icon: Sparkles, desc: 'Salon skills for women' },
        { name: 'Sustainable Farming', targetId: 'agriculture-training', icon: Sprout, desc: 'Organic agri-livelihoods' },
      ]
    },
    { 
      name: 'Community & Student Hub', 
      id: 'training',
      hasDropdown: true,
      categoryBadge: 'Welfare Services',
      headerTheme: 'from-[#4A1039] via-[#6B1D52] to-[#8C2366]',
      accentColor: 'text-[#C52B75]',
      borderHover: 'hover:border-[#C52B75]',
      bgHover: 'hover:bg-pink-50/90',
      dropdownItems: [
        { name: 'Student Scholarship & Placement Support', targetId: 'student-education-aid', icon: GraduationCap, desc: 'Higher education tuition sponsorship' },
        { name: 'Available Vocational Courses', targetId: 'available-courses', icon: BookOpen, desc: 'Free skill modules' },
        { name: 'Welfare Locations & Reach', targetId: 'training-centers', icon: MapPin, desc: 'Districts served' },
      ]
    },
    { 
      name: 'Our Impact', 
      id: 'stories',
      hasDropdown: true,
      categoryBadge: 'Results & Stories',
      headerTheme: 'from-[#4A1039] via-[#6B1D52] to-[#8C2366]',
      accentColor: 'text-[#C52B75]',
      borderHover: 'hover:border-[#C52B75]',
      bgHover: 'hover:bg-pink-50/90',
      dropdownItems: [
        { name: 'Transformation Stories', page: 'stories', targetId: 'success-stories', icon: Star, desc: 'Real beneficiary journeys' },
        { name: 'Field Photo Gallery', page: 'stories', targetId: 'gallery', icon: ImageIcon, desc: 'Grassroots event photos' }
      ]
    },
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id, targetId) => {
    setActiveSection(id, targetId);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleSubNavClick = (linkId, item) => {
    if (item.action === 'donate') {
      onOpenDonate();
    } else if (item.action === 'volunteer') {
      if (onOpenVolunteer) onOpenVolunteer();
    } else if (item.action === 'csr') {
      if (onOpenCsr) onOpenCsr();
    } else if (item.page) {
      setActiveSection(item.page, item.targetId);
    } else if (item.targetId) {
      setActiveSection(linkId, item.targetId);
    } else {
      setActiveSection(linkId);
    }
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleMobileExpanded = (id) => {
    setMobileExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <nav className="sticky top-0 z-50 font-sans">
      
      {/* Top NGO Compliance & Trust Strip */}
      <div className="bg-[#2B0721] text-pink-200 text-[11px] font-medium py-1 px-4 border-b border-pink-900/40 hidden sm:block">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Registered NGO Society</span>
            </span>
            <span className="text-pink-300/60">•</span>
            <span>50% Tax Exemption Eligible under Section 80G</span>
            <span className="text-pink-300/60">•</span>
            <span>Women Empowerment & Student Education Aid</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <button onClick={() => setActiveSection('training', 'student-education-aid')} className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-amber-300" />
              <span>Student Aid</span>
            </button>
            <span className="text-pink-300/60">|</span>
            <button onClick={onOpenVolunteer} className="hover:text-white transition-colors cursor-pointer">
              Volunteer
            </button>
            <span className="text-pink-300/60">|</span>
            <button onClick={onOpenDonate} className="text-amber-300 hover:text-amber-200 transition-colors cursor-pointer">
              Donate Now 💖
            </button>
          </div>
        </div>
      </div>

      {/* Main Curved Navigation Bar */}
      <div className="bg-gradient-to-r from-[#3D0A2E] via-[#5A1644] to-[#7A1D59] text-white shadow-2xl relative rounded-bl-[2.5rem] lg:rounded-bl-[3.5rem] rounded-br-none border-b border-pink-900/50 backdrop-blur-xl">
        
        {/* Top Multi-Color Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#F472B6] via-[#EC4899] to-[#F59E0B]" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24 relative">
            
            {/* Left Side: Brand Logo */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center cursor-pointer shrink-0 py-1.5 group"
            >
              <img 
                src="/image/logo.png" 
                alt="Life Vision Society Logo" 
                className="h-14 sm:h-18 lg:h-[80px] w-auto object-contain filter drop-shadow-lg group-hover:scale-102 transition-transform duration-300" 
              />
            </div>

            {/* Right Side Group: Desktop Navigation Links & Action Buttons */}
            <div className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-5 font-sans">
              
              {/* Navigation Links */}
              <div className="flex items-center space-x-1 lg:space-x-1.5 xl:space-x-2 font-sans">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id;
                  const isOpen = activeDropdown === link.id;

                  if (link.hasDropdown) {
                    return (
                      <div 
                        key={link.id} 
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(link.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <button
                          onClick={() => handleNavClick(link.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs lg:text-[13.5px] font-bold tracking-wide transition-all duration-300 cursor-pointer relative rounded-xl group/btn ${
                            isActive || isOpen
                              ? 'text-white bg-white/15 shadow-md backdrop-blur-md border border-white/20 ring-1 ring-white/20'
                              : 'text-pink-100/90 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span>{link.name}</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(prev => (prev === link.id ? null : link.id));
                            }}
                            className="p-0.5 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                          >
                            <ChevronDown 
                              className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pink-300 scale-110' : 'group-hover/btn:translate-y-0.5'}`} 
                            />
                          </span>
                          {isActive && (
                            <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-gradient-to-r from-pink-400 via-amber-300 to-pink-400 rounded-full shadow-md animate-pulse" />
                          )}
                        </button>

                        {/* Desktop Dropdown Menu Card */}
                        {isOpen && (
                          <div 
                            className="absolute left-0 top-full pt-3 -mt-1 w-76 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
                            onMouseEnter={() => handleMouseEnter(link.id)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className="bg-white/95 backdrop-blur-xl text-slate-800 rounded-2xl shadow-2xl border border-pink-100/90 relative">
                              
                              <div className="bg-gradient-to-r from-[#4A1039] via-[#6B1D52] to-[#8C2366] text-white px-4 py-2.5 flex items-center justify-between shadow-xs rounded-t-2xl">
                                <span className="text-[10.5px] font-black tracking-widest text-pink-200">
                                  {link.categoryBadge}
                                </span>
                              </div>

                              <div className="py-2 px-1.5 space-y-0.5">
                                {link.dropdownItems.map((item, idx) => {
                                  const ItemIcon = item.icon;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => handleSubNavClick(link.id, item)}
                                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between group border-l-3 border-transparent ${link.borderHover} ${link.bgHover}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {ItemIcon && (
                                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 via-[#C52B75] to-[#6B1D52] text-white flex items-center justify-center shrink-0 border border-white/40 shadow-xs shadow-pink-500/20 group-hover:scale-105 group-hover:rotate-3 transition-transform">
                                            <ItemIcon className="w-4 h-4 text-white" />
                                          </div>
                                        )}
                                        <div>
                                          <div className="text-xs font-bold text-slate-800 group-hover:text-[#6B1D52] transition-colors flex items-center gap-2">
                                            <span>{item.name}</span>
                                            {item.badge && (
                                              <span className="text-[9.5px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                                                {item.badge}
                                              </span>
                                            )}
                                          </div>
                                          {item.desc && (
                                            <div className="text-[10.5px] text-slate-500 font-medium leading-tight">{item.desc}</div>
                                          )}
                                        </div>
                                      </div>
                                      <ChevronRight className={`w-3.5 h-3.5 ${link.accentColor} opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5`} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className={`px-3 py-2 text-xs lg:text-[13.5px] font-bold tracking-wide transition-all duration-300 cursor-pointer relative rounded-xl ${
                        isActive
                          ? 'text-white bg-white/15 shadow-md backdrop-blur-md border border-white/20 ring-1 ring-white/20'
                          : 'text-pink-100/90 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-gradient-to-r from-pink-400 via-amber-300 to-pink-400 rounded-full shadow-md animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSection('training', 'student-education-aid')}
                  className="bg-white/10 hover:bg-white/20 text-pink-100 hover:text-white text-xs font-bold px-3.5 py-2.5 rounded-full border border-white/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Student Aid</span>
                </button>

                <button
                  onClick={() => onOpenDonate()}
                  className={`bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black px-5 py-2.5 rounded-full shadow-xl hover:shadow-amber-400/20 transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 tracking-wider border border-amber-200 ring-2 ring-amber-400/30 ${
                    activeSection === 'donate' ? 'ring-white ring-4' : ''
                  }`}
                >
                  <Heart className="w-4 h-4 fill-[#C52B75] text-[#C52B75] animate-pulse" />
                  <span>Donate Now</span>
                </button>
              </div>

            </div>

            {/* Mobile Menu Header Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => onOpenDonate()}
                className="bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-md"
              >
                <Heart className="w-3.5 h-3.5 fill-[#C52B75] text-[#C52B75]" />
                <span>Donate</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-2xl text-white hover:bg-white/10 transition-colors border border-white/10"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#3D0A2E] border-t border-pink-800/80 px-4 pt-4 pb-6 space-y-4 animate-fade-in shadow-2xl font-sans">
            <div className="space-y-2 max-h-[72vh] overflow-y-auto pr-1">
              {navLinks.map((link) => {
                const isExpanded = mobileExpanded[link.id];

                if (link.hasDropdown) {
                  return (
                    <div key={link.id} className="space-y-1.5 bg-white/5 rounded-2xl p-1.5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleNavClick(link.id)}
                          className={`text-left flex-1 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeSection === link.id
                              ? 'bg-[#C52B75] text-white shadow-md'
                              : 'text-pink-100 hover:bg-white/10'
                          }`}
                        >
                          {link.name}
                        </button>
                        <button
                          onClick={() => toggleMobileExpanded(link.id)}
                          className="p-2.5 text-pink-200 hover:text-white"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-amber-300' : ''}`} />
                        </button>
                      </div>

                      {/* Mobile Accordion Sub-items */}
                      {isExpanded && (
                        <div className="pl-3 pr-1 py-1.5 space-y-1.5 bg-black/30 rounded-xl border-l-2 border-pink-400">
                          {link.dropdownItems.map((item, idx) => {
                            const ItemIcon = item.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleSubNavClick(link.id, item)}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-pink-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  {ItemIcon && <ItemIcon className="w-3.5 h-3.5 text-pink-300 shrink-0" />}
                                  <span>{item.name}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[9px] font-black text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      activeSection === link.id
                        ? 'bg-[#C52B75] text-white shadow-md'
                        : 'text-pink-100 hover:bg-white/10'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
            </div>

            {/* Mobile Action Buttons */}
            <div className="pt-3 border-t border-pink-800/80 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenDonate();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-black py-3 px-4 rounded-full text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg tracking-wider border border-amber-200"
              >
                <Heart className="w-4 h-4 fill-[#C52B75] text-[#C52B75]" />
                <span>Donate Now (80G Tax Exempt)</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('training', 'student-education-aid');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-white/10 text-amber-300 font-bold py-2.5 px-4 rounded-full text-xs flex items-center justify-center gap-2 border border-white/20"
              >
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>Student Study & Placement Aid</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}
