import React, { useState } from 'react';
import { 
  Users, UserCheck, Layers, Briefcase, Building2, Heart, 
  Plus, Calendar, ArrowUp, ChevronDown, Eye, BarChart2, 
  FileText, Settings, Image as ImageIcon, ArrowRight, UserPlus, Inbox, CheckCircle2, Award
} from 'lucide-react';

export default function DashboardView({ 
  applications = [], 
  placements = [],
  partners = [],
  donations = [],
  contacts = [],
  programs = [],
  centers = [],
  batches = [],
  students = [],
  staff = [],
  trainers = [],
  onNavigate,
  onViewApp 
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  // Compute real totals directly from section props
  const totalStudentsCount = students.length + applications.length;
  const activeStaffCount = staff.length + trainers.length;
  const activeBatchesCount = batches.length;
  const placementCount = placements.length;
  const partnersCount = partners.length;
  
  // Calculate total donation sum
  const totalDonationAmount = donations.reduce((sum, d) => {
    if (!d.amount) return sum;
    const num = parseFloat(String(d.amount).replace(/[^0-9.]/g, '')) || 0;
    return sum + num;
  }, 0);

  // Dynamic Chart Data from Real Applications & Students
  const programCounts = {
    'Tailoring & Stitching': 0,
    'Beautician': 0,
    'Agriculture': 0,
    'Healthcare': 0,
    'Food & Beverages': 0,
    'Tourism & Hospitality': 0
  };

  applications.concat(students).forEach(item => {
    const course = item.course || item.program || item.higherCourse || '';
    if (course.includes('Tailor')) programCounts['Tailoring & Stitching']++;
    else if (course.includes('Beauty')) programCounts['Beautician']++;
    else if (course.includes('Agri')) programCounts['Agriculture']++;
    else if (course.includes('Health')) programCounts['Healthcare']++;
    else if (course.includes('Food')) programCounts['Food & Beverages']++;
    else if (course.includes('Tourism')) programCounts['Tourism & Hospitality']++;
  });

  const maxCount = Math.max(...Object.values(programCounts), 1);
  const chartData = [
    { program: 'Tailoring & Stitching', count: programCounts['Tailoring & Stitching'], color: '#E11D48' },
    { program: 'Beautician', count: programCounts['Beautician'], color: '#8B5CF6' },
    { program: 'Agriculture', count: programCounts['Agriculture'], color: '#3B82F6' },
    { program: 'Healthcare', count: programCounts['Healthcare'], color: '#10B981' },
    { program: 'Food & Beverages', count: programCounts['Food & Beverages'], color: '#F59E0B' },
    { program: 'Tourism & Hospitality', count: programCounts['Tourism & Hospitality'], color: '#14B8A6' },
  ].map(item => ({
    ...item,
    heightPct: maxCount > 0 && item.count > 0 ? Math.max(Math.round((item.count / maxCount) * 100), 18) : 6
  }));

  // Placement Student Details & Status Breakdown Grow Bars
  const placementMetrics = {
    employed: placements.filter(p => p.placementStatus?.toLowerCase().includes('employed') && !p.placementStatus?.toLowerCase().includes('self')).length,
    selfEmployed: placements.filter(p => p.placementStatus?.toLowerCase().includes('self')).length,
    selected: placements.filter(p => p.placementStatus?.toLowerCase().includes('selected') || p.placementStatus?.toLowerCase().includes('offer')).length,
    interview: placements.filter(p => p.placementStatus?.toLowerCase().includes('interview')).length,
    seeking: placements.filter(p => p.placementStatus?.toLowerCase().includes('seeking') || p.placementStatus?.toLowerCase().includes('pending')).length,
  };

  const totalPlacementsRecorded = Math.max(placements.length, 1);

  const placementGrowBars = [
    {
      label: 'Employed (Salaried Jobs)',
      icon: '👔',
      count: placementMetrics.employed,
      gradient: 'from-emerald-500 via-teal-600 to-[#047857]',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      pct: Math.round((placementMetrics.employed / totalPlacementsRecorded) * 100) || (placementMetrics.employed > 0 ? 15 : 4)
    },
    {
      label: 'Self-Employed (Micro-Boutiques)',
      icon: '🚀',
      count: placementMetrics.selfEmployed,
      gradient: 'from-blue-600 via-indigo-600 to-[#123B5D]',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      pct: Math.round((placementMetrics.selfEmployed / totalPlacementsRecorded) * 100) || (placementMetrics.selfEmployed > 0 ? 15 : 4)
    },
    {
      label: 'Selected / Offer Received',
      icon: '✅',
      count: placementMetrics.selected,
      gradient: 'from-purple-500 via-indigo-500 to-[#1E527B]',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      pct: Math.round((placementMetrics.selected / totalPlacementsRecorded) * 100) || (placementMetrics.selected > 0 ? 15 : 4)
    },
    {
      label: 'Interview Scheduled',
      icon: '🗣️',
      count: placementMetrics.interview,
      gradient: 'from-cyan-500 via-teal-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      pct: Math.round((placementMetrics.interview / totalPlacementsRecorded) * 100) || (placementMetrics.interview > 0 ? 15 : 4)
    },
    {
      label: 'Seeking Employment',
      icon: '🔍',
      count: placementMetrics.seeking,
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      pct: Math.round((placementMetrics.seeking / totalPlacementsRecorded) * 100) || (placementMetrics.seeking > 0 ? 15 : 4)
    }
  ];

  const recentAppsList = applications.slice(0, 5);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* 1. Welcome Greeting Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <span>Welcome Back, Admin</span>
            <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time control center for Life Vision Society applications, donor contributions & NGO activities.
          </p>
        </div>

        {/* Date Selector Badge */}
        <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs text-xs font-bold text-slate-700 cursor-pointer">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Today: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* 2. Real KPI Cards Row (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Total Students */}
        <div 
          onClick={() => onNavigate && onNavigate('students')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-[#E11D48] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 leading-tight">Total Students</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{totalStudentsCount}</div>
            </div>
          </div>
          <div className="flex items-center text-[10px] font-extrabold text-emerald-600">
            <ArrowUp className="w-3 h-3 mr-0.5" /> Live <span className="text-slate-400 font-medium ml-1">enrolled students</span>
          </div>
        </div>

        {/* Card 2: Active Staff */}
        <div 
          onClick={() => onNavigate && onNavigate('staff')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 leading-tight">Active Staff</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{activeStaffCount}</div>
            </div>
          </div>
          <div className="flex items-center text-[10px] font-extrabold text-slate-400 font-medium">
            Staff & Trainers
          </div>
        </div>

        {/* Card 3: Active Batches */}
        <div 
          onClick={() => onNavigate && onNavigate('batches')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 leading-tight">Active Batches</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{activeBatchesCount}</div>
            </div>
          </div>
          <div className="flex items-center text-[10px] font-extrabold text-slate-400 font-medium">
            Skill Batches
          </div>
        </div>

        {/* Card 4: Placement */}
        <div 
          onClick={() => onNavigate && onNavigate('placement')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 leading-tight">Placements</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{placementCount}</div>
            </div>
          </div>
          <div className="flex items-center text-[10px] font-extrabold text-slate-400 font-medium">
            Job & Boutique Records
          </div>
        </div>

        {/* Card 5: Partners */}
        <div 
          onClick={() => onNavigate && onNavigate('partners')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 leading-tight">Partners</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{partnersCount}</div>
            </div>
          </div>
          <div className="flex items-center text-[10px] font-extrabold text-slate-400 font-medium">
            CSR / Alliances
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Student Enrollment Chart + Placement Detail Growing Color Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Column 1: Students Enrolled by Training Program Bar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Enrollment by Sector / Course</h3>
              <p className="text-[11px] text-slate-500">Live student applications and training course registration</p>
            </div>
            <span className="text-[11px] font-extrabold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
              Live: {totalStudentsCount} Students
            </span>
          </div>

          {/* Bar Chart Graphics */}
          <div className="pt-4 pb-2 px-2 flex items-end justify-between h-48 border-b border-slate-100">
            {chartData.map((bar, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 mx-1 group cursor-pointer h-full justify-end">
                <span className="text-[11px] font-extrabold text-slate-700 mb-1 group-hover:scale-110 transition-transform">
                  {bar.count}
                </span>
                <div 
                  className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-xs"
                  style={{ height: `${bar.heightPct}%`, backgroundColor: bar.color }}
                />
              </div>
            ))}
          </div>

          {/* X Axis Labels */}
          <div className="grid grid-cols-6 gap-1 text-center text-[9px] font-bold text-slate-500 leading-tight">
            <span>Tailoring & Stitching</span>
            <span>Beautician</span>
            <span>Agriculture</span>
            <span>Healthcare</span>
            <span>Food & Beverages</span>
            <span>Tourism</span>
          </div>
        </div>

        {/* Column 2: Placement Student Details Growing Color Bars (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#047857]" />
                <span>Placement Student Details & Status Breakdown</span>
              </h3>
              <p className="text-[11px] text-slate-500">Live job placement status progress for all trained candidates</p>
            </div>
            <button 
              onClick={() => onNavigate && onNavigate('placement')}
              className="text-[11px] font-bold text-[#047857] hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
            >
              View All ({placements.length})
            </button>
          </div>

          {/* COLORFUL GROW PROGRESS BARS */}
          <div className="space-y-3 py-1">
            {placementGrowBars.map((bar, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 font-bold text-slate-800">
                    <span className="text-sm">{bar.icon}</span>
                    <span>{bar.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${bar.bgColor} ${bar.textColor}`}>
                      {bar.count} Students
                    </span>
                    <span className="font-mono text-[10px] font-extrabold text-slate-500 w-8 text-right">
                      {bar.pct}%
                    </span>
                  </div>
                </div>

                {/* ANIMATED GROWING COLOR BAR */}
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50 shadow-inner">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${bar.gradient} transition-all duration-700 ease-out shadow-xs`}
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Total Placed & Tracked Candidates</span>
            <span className="font-extrabold text-slate-900">{placements.length} Candidates</span>
          </div>
        </div>

      </div>

      {/* 4. Quick Actions & Upcoming Events Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Quick Actions (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Admin Quick Control Actions</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            <button 
              onClick={() => onNavigate && onNavigate('students')}
              className="p-3 bg-blue-50/80 hover:bg-blue-100 text-blue-600 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center space-y-2 border border-blue-200/60 transition-all cursor-pointer shadow-2xs"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <span>+ Add Student</span>
            </button>

            <button 
              onClick={() => onNavigate && onNavigate('staff')}
              className="p-3 bg-pink-50/80 hover:bg-pink-100 text-pink-600 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center space-y-2 border border-pink-200/60 transition-all cursor-pointer shadow-2xs"
            >
              <UserPlus className="w-5 h-5 text-pink-600" />
              <span>+ Add Staff</span>
            </button>

            <button 
              onClick={() => onNavigate && onNavigate('batches')}
              className="p-3 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-600 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center space-y-2 border border-emerald-200/60 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>+ Create Batch</span>
            </button>

            <button 
              onClick={() => onNavigate && onNavigate('partners')}
              className="p-3 bg-amber-50/80 hover:bg-amber-100 text-amber-600 rounded-xl font-extrabold text-xs flex flex-col items-center justify-center space-y-2 border border-amber-200/60 transition-all cursor-pointer shadow-2xs"
            >
              <Building2 className="w-5 h-5 text-amber-600" />
              <span>+ Add Partner</span>
            </button>
          </div>
        </div>

        {/* Upcoming Activities (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Livelihood & Training Activities</h3>
            <button onClick={() => onNavigate && onNavigate('events')} className="text-[11px] font-bold text-blue-600 hover:underline">
              View All Activities
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
            {[
              { date: '20', month: 'Sep', title: 'Healthcare Batch Starts', location: 'Cuttack Hub' },
              { date: '23', month: 'Sep', title: 'Women Empowerment Drive', location: 'Bhubaneswar' },
              { date: '28', month: 'Sep', title: 'Community Health Camp', location: 'Puri District' },
              { date: '02', month: 'Oct', title: 'Skill Convocation Day', location: 'Khordha Center' }
            ].map((act, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors flex items-center justify-between group cursor-pointer border border-slate-200/60">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex flex-col items-center justify-center shrink-0 border border-purple-100">
                    <span className="text-xs font-black leading-none">{act.date}</span>
                    <span className="text-[8px] font-bold uppercase leading-none mt-0.5 text-purple-600">{act.month}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{act.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">📍 {act.location}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Recent Applications Table */}
      <div className="w-full">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Student Applications from Website ({applications.length})</h3>
            <button onClick={() => onNavigate && onNavigate('applications')} className="text-[11px] font-bold text-blue-600 hover:underline">
              View All Applications
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentAppsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-xs text-slate-600">No Student Applications Yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  When a student registers on the public website, their application will appear here in real-time.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 bg-slate-50/50 uppercase font-bold text-[10px]">
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Course</th>
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentAppsList.map((app, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-mono text-slate-500 font-bold">{app.id || `APP-2026-00${idx+1}`}</td>
                      <td className="p-2.5 font-bold text-slate-800">{app.fullName || app.name}</td>
                      <td className="p-2.5 text-slate-600">{app.course || app.higherCourse}</td>
                      <td className="p-2.5 text-slate-500">{app.district || app.location || 'Odisha'}</td>
                      <td className="p-2.5 text-slate-500">{app.applicationDate || 'Today'}</td>
                      <td className="p-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          app.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'Shortlisted' ? 'bg-purple-100 text-purple-700' :
                          app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
