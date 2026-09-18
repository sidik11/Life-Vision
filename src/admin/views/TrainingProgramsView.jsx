import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import { Plus, Edit, Eye, Clock, Users, BookOpen, Layers, Award, ShieldCheck, CheckCircle2, X, FileText, Briefcase, ChevronRight, Trash2, Save, Upload, Image as ImageIcon, GraduationCap, Search, Download, Filter } from 'lucide-react';

export default function TrainingProgramsView({ programs = [], setPrograms, onAddProgram, applications = [], onViewApp, showToast, onShowToast }) {
  const notify = showToast || onShowToast || (() => {});
  const [viewTab, setViewTab] = useState('programs'); // 'programs' | 'applications'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNqrDetail, setSelectedNqrDetail] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);

  // Filters for Student Applications view inside Training Programs
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const appName = app.name || app.fullName || '';
      const appId = app.id || '';
      const appMobile = app.mobile || app.phone || '';
      const appCourse = app.course || app.higherCourse || '';

      const matchesSearch = appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            appId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            appMobile.includes(searchTerm);
      const matchesCourse = courseFilter === 'All' || appCourse.toLowerCase().includes(courseFilter.toLowerCase()) || courseFilter.toLowerCase().includes(appCourse.toLowerCase());
      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [applications, searchTerm, courseFilter, statusFilter]);

  // Preset Course Images
  const presetCourseImages = [
    { label: 'Tailoring & Stitching', url: '/image/Tailoring_training.png' },
    { label: 'Beautician & Wellness', url: '/image/Beautician.png' },
    { label: 'Agriculture & Farming', url: '/image/Agriculture.png' },
    { label: 'Healthcare & Caregiving', url: '/image/Healthcare&caregiving.png' },
    { label: 'Tourism & Hospitality', url: '/image/Tourism & hospitality.png' },
    { label: 'Food & Beverages', url: '/image/Food & Beverages.png' }
  ];

  // NQR Create Form State
  const [formData, setFormData] = useState({
    name: '',
    sector: 'Apparel, Made-ups & Home Furnishing',
    qpCode: '',
    nsqfLevel: 'Level 4',
    totalHours: '300 Hours',
    monthsDuration: '3 Months',
    theoryHours: '80 Hours',
    practicalHours: '160 Hours',
    ojtHours: '60 Hours',
    qualification: '10th Pass',
    batchSize: '30 Students',
    category: 'Skill Vocational',
    image: '/image/Tailoring_training.png',
    description: ''
  });

  // NQR Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    sector: '',
    qpCode: '',
    nsqfLevel: '',
    duration: '',
    theoryHours: '',
    practicalHours: '',
    ojtHours: '',
    qualification: '',
    batchSize: '',
    status: 'Active',
    image: '/image/Tailoring_training.png',
    description: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Image Upload File Handler
  const handleImageFileUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditFormData(prev => ({ ...prev, image: reader.result }));
        } else {
          setFormData(prev => ({ ...prev, image: reader.result }));
        }
        notify('Course image uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProgram = (e) => {
    e.preventDefault();
    if (!formData.name) {
      notify('Please enter Course Name', 'error');
      return;
    }

    const qpCodeGenerated = formData.qpCode.trim() || `NQR/LVS/${Math.floor(1000 + Math.random() * 9000)}`;
    const durationFormatted = `${formData.totalHours} (${formData.monthsDuration})`;

    const newProgram = {
      id: `PROG-NQR-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      category: formData.category || 'Skill Vocational',
      sector: formData.sector,
      qpCode: qpCodeGenerated,
      nsqfLevel: formData.nsqfLevel,
      duration: durationFormatted,
      theoryHours: formData.theoryHours,
      practicalHours: formData.practicalHours,
      ojtHours: formData.ojtHours,
      qualification: formData.qualification,
      batchSize: formData.batchSize,
      activeBatches: 1,
      students: 30,
      status: 'Active',
      image: formData.image || '/image/Tailoring_training.png',
      description: formData.description || `National Qualification Register (NQR) aligned skill course for ${formData.sector}.`
    };

    if (onAddProgram) {
      onAddProgram(newProgram);
    } else if (setPrograms) {
      setPrograms(prev => {
        const updated = [newProgram, ...prev];
        try {
          localStorage.setItem('lvs_submitted_programs', JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
      notify(`New NQR Program (${qpCodeGenerated}) created successfully!`, 'success');
    }

    // Reset Form
    setFormData({
      name: '',
      sector: 'Apparel, Made-ups & Home Furnishing',
      qpCode: '',
      nsqfLevel: 'Level 4',
      totalHours: '300 Hours',
      monthsDuration: '3 Months',
      theoryHours: '80 Hours',
      practicalHours: '160 Hours',
      ojtHours: '60 Hours',
      qualification: '10th Pass',
      batchSize: '30 Students',
      category: 'Skill Vocational',
      image: '/image/Tailoring_training.png',
      description: ''
    });

    setShowAddModal(false);
  };

  const handleOpenEdit = (prog) => {
    setEditingProgram(prog);
    setEditFormData({
      name: prog.name || '',
      sector: prog.sector || 'Apparel, Made-ups & Home Furnishing',
      qpCode: prog.qpCode || '',
      nsqfLevel: prog.nsqfLevel || 'Level 4',
      duration: prog.duration || '300 Hours (3 Months)',
      theoryHours: prog.theoryHours || '80 Hours',
      practicalHours: prog.practicalHours || '160 Hours',
      ojtHours: prog.ojtHours || '60 Hours',
      qualification: prog.qualification || '10th Pass',
      batchSize: prog.batchSize || '30 Students',
      status: prog.status || 'Active',
      image: prog.image || '/image/Tailoring_training.png',
      description: prog.description || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editFormData.name) {
      notify('Please enter Course Name', 'error');
      return;
    }

    if (setPrograms) {
      setPrograms(prev => {
        const updated = prev.map(p => p.id === editingProgram.id ? {
          ...p,
          name: editFormData.name,
          sector: editFormData.sector,
          qpCode: editFormData.qpCode,
          nsqfLevel: editFormData.nsqfLevel,
          duration: editFormData.duration,
          theoryHours: editFormData.theoryHours,
          practicalHours: editFormData.practicalHours,
          ojtHours: editFormData.ojtHours,
          qualification: editFormData.qualification,
          batchSize: editFormData.batchSize,
          status: editFormData.status,
          image: editFormData.image,
          description: editFormData.description
        } : p);

        try {
          localStorage.setItem('lvs_submitted_programs', JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
    }

    notify(`NQR Program "${editFormData.name}" updated successfully!`, 'success');
    setEditingProgram(null);
  };

  const handleDeleteProgram = (progId) => {
    if (window.confirm('Are you sure you want to delete this training program?')) {
      if (setPrograms) {
        setPrograms(prev => {
          const updated = prev.filter(p => p.id !== progId);
          try {
            localStorage.setItem('lvs_submitted_programs', JSON.stringify(updated));
          } catch (err) {}
          return updated;
        });
      }
      notify('Training program deleted.', 'info');
      setEditingProgram(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#123B5D] via-[#1E527B] to-[#16A34A] rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>National Qualification Register (NQR) & NSQF Framework</span>
          </div>
          <h1 className="text-2xl font-bold font-serif">Training Programs & Qualification Packs</h1>
          <p className="text-slate-200 text-xs mt-1">
            Official NQR-aligned vocational courses with theory, practical, OJT hours & QP codes.
          </p>
        </div>

        {/* Primary Action Button: Green #16A34A */}
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>+ Add New NQR Program</span>
        </button>
      </div>

      {/* View Switcher Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewTab('programs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              viewTab === 'programs'
                ? 'bg-[#123B5D] text-white shadow-xs'
                : 'bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>NQR Training Courses ({programs.length})</span>
          </button>

          <button
            onClick={() => {
              setViewTab('applications');
              setCourseFilter('All');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              viewTab === 'applications'
                ? 'bg-[#16A34A] text-white shadow-xs'
                : 'bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Applications Received ({applications.length})</span>
          </button>
        </div>

        {viewTab === 'applications' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#64748B]">Course Filter:</span>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1E293B]"
            >
              <option value="All">All Submitted Courses</option>
              {programs.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {viewTab === 'programs' ? (
        /* Program Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => {
            const progAppsCount = applications.filter(a => {
              const c = (a.course || a.higherCourse || '').toLowerCase();
              const p = (prog.name || '').toLowerCase();
              return c.includes(p) || p.includes(c);
            }).length;

            return (
              <div 
                key={prog.id}
                className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Program Header Image & Badges */}
                  <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                    <img 
                      src={prog.image || "/image/Tailoring_training.png"} 
                      alt={prog.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg shadow-sm uppercase tracking-wider">
                        {prog.qpCode || 'NQR/QP-2026'}
                      </span>
                      <StatusBadge status={prog.status} />
                    </div>

                    {/* Bottom Sector Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-[#123B5D]/90 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 truncate">
                        {prog.sector || prog.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase">
                        {prog.nsqfLevel || 'Level 4'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    <h3 className="text-lg font-bold text-[#1E293B] font-serif leading-snug group-hover:text-blue-600 transition-colors">
                      {prog.name}
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                      {prog.description}
                    </p>

                    {/* NQR Hours Breakdown Grid */}
                    <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-1 flex items-center justify-between">
                        <span>NQR Hours Breakdown</span>
                        <span className="text-[#123B5D] font-extrabold">{prog.duration}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-center pt-0.5">
                        <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Theory</div>
                          <div className="text-xs font-black text-slate-800">{prog.theoryHours || '80 Hours'}</div>
                        </div>
                        <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Practical</div>
                          <div className="text-xs font-black text-emerald-700">{prog.practicalHours || '160 Hours'}</div>
                        </div>
                        <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">OJT</div>
                          <div className="text-xs font-black text-purple-700">{prog.ojtHours || '60 Hours'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Eligibility & Batch Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B]">
                      <div className="flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span className="truncate">Min: <strong className="text-slate-800">{prog.qualification || '10th Pass'}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span className="truncate">Batch: <strong className="text-slate-800">{prog.batchSize || '30 Students'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                  <button 
                    onClick={() => setSelectedNqrDetail(prog)}
                    className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>NQR Details</span>
                  </button>

                  <button 
                    onClick={() => {
                      setCourseFilter(prog.name);
                      setViewTab('applications');
                    }}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6B1D52] rounded-lg text-xs font-extrabold flex items-center space-x-1 cursor-pointer transition-all border border-purple-200"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-[#C52B75]" />
                    <span>Student Apps ({progAppsCount})</span>
                  </button>

                  <button 
                    onClick={() => handleOpenEdit(prog)}
                    className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-emerald-50 hover:border-emerald-300 text-[#1E293B] hover:text-[#16A34A] rounded-lg text-xs font-extrabold flex items-center space-x-1 cursor-pointer shadow-xs transition-all"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STUDENT APPLICATIONS RECEIVED VIEW */
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student name, ID or mobile..."
                className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end text-xs font-bold text-[#64748B]">
              <span>Showing {filteredApps.length} Applications</span>
              {courseFilter !== 'All' && (
                <button
                  onClick={() => setCourseFilter('All')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                >
                  Clear Course Filter
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] bg-[#F8FAFC] uppercase tracking-wider font-bold">
                    <th className="p-4">App ID</th>
                    <th className="p-4">Student Candidate</th>
                    <th className="p-4">Gender / Age</th>
                    <th className="p-4">Course Applied</th>
                    <th className="p-4">District / Location</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-[#64748B] font-medium">
                        No student applications found for this course selection.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#2563EB]">{app.id}</td>
                        <td className="p-4 font-semibold text-[#1E293B]">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={app.photo || "/hero_training.png"} 
                              alt={app.name || app.fullName} 
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#E2E8F0] shrink-0" 
                            />
                            <div>
                              <div className="font-bold text-[#1E293B]">{app.name || app.fullName}</div>
                              <div className="text-[10px] text-[#64748B]">{app.mobile || app.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[#1E293B]">{app.gender || 'Female'}, {app.age || 22} Yrs</td>
                        <td className="p-4 font-bold text-[#1E293B]">{app.course || app.higherCourse}</td>
                        <td className="p-4 text-[#64748B]">{app.location || `${app.district || 'Bhubaneswar'}, ${app.state || 'Odisha'}`}</td>
                        <td className="p-4 text-[#64748B]">{app.applicationDate || app.appliedAt || '2026-09-18'}</td>
                        <td className="p-4">
                          <StatusBadge status={app.status || 'New'} />
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onViewApp && onViewApp(app)}
                            className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Candidate</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW NQR PROGRAM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#123B5D]/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 text-[#1E293B] shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>National Qualification Register Form</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-[#1E293B]">Create NQR Training Program</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
              
              {/* Row 1: Course Name & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Course / Qualification Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Self Employed Tailor & Boutique Designer"
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Industry Sector *</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="Apparel, Made-ups & Home Furnishing">Apparel, Made-ups & Home Furnishing</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Tourism & Hospitality">Tourism & Hospitality</option>
                    <option value="Food Processing">Food Processing</option>
                    <option value="Electronics & IT">Electronics & IT</option>
                    <option value="Renewable Energy & Solar">Renewable Energy & Solar</option>
                  </select>
                </div>
              </div>

              {/* Course Image Upload & Preset Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#123B5D] text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Upload Course Cover Image</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Select Preset or Upload File</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview */}
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-300 shrink-0 relative shadow-xs">
                    <img 
                      src={formData.image || "/image/Tailoring_training.png"} 
                      alt="Course Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* File Upload Input */}
                    <div className="flex items-center space-x-2">
                      <label className="px-3.5 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all">
                        <Upload className="w-3.5 h-3.5 text-white" />
                        <span>Upload From Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preset Dropdown */}
                    <div>
                      <select
                        value={formData.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                      >
                        <option value="">-- Or Select Preset Course Image --</option>
                        {presetCourseImages.map((img, idx) => (
                          <option key={idx} value={img.url}>{img.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: QP Code & NSQF Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">QP Code (Qualification Pack Code)</label>
                  <input
                    type="text"
                    value={formData.qpCode}
                    onChange={(e) => handleInputChange('qpCode', e.target.value)}
                    placeholder="e.g. AMH/Q1947 or BWS/Q0101"
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-mono focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">NSQF Level</label>
                  <select
                    value={formData.nsqfLevel}
                    onChange={(e) => handleInputChange('nsqfLevel', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                    <option value="Level 5">Level 5</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Total Hours & Duration Months */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Total Duration (Hours)</label>
                  <input
                    type="text"
                    value={formData.totalHours}
                    onChange={(e) => handleInputChange('totalHours', e.target.value)}
                    placeholder="e.g. 300 Hours"
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Duration (Months)</label>
                  <input
                    type="text"
                    value={formData.monthsDuration}
                    onChange={(e) => handleInputChange('monthsDuration', e.target.value)}
                    placeholder="e.g. 3 Months"
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              {/* Row 4: Hours Split (Theory, Practical, OJT) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#123B5D]">
                  ⏱️ NQR Hours Split (Theory + Practical + OJT)
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Theory Hours</label>
                    <input
                      type="text"
                      value={formData.theoryHours}
                      onChange={(e) => handleInputChange('theoryHours', e.target.value)}
                      placeholder="80 Hours"
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Practical Hours</label>
                    <input
                      type="text"
                      value={formData.practicalHours}
                      onChange={(e) => handleInputChange('practicalHours', e.target.value)}
                      placeholder="160 Hours"
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 text-[10px] uppercase">OJT Hours</label>
                    <input
                      type="text"
                      value={formData.ojtHours}
                      onChange={(e) => handleInputChange('ojtHours', e.target.value)}
                      placeholder="60 Hours"
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-purple-700"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Qualification & Recommended Batch Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Minimum Student Qualification *</label>
                  <select
                    value={formData.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="5th Pass">5th Pass</option>
                    <option value="8th Pass">8th Pass</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="ITI / Diploma">ITI / Diploma</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Recommended Batch Size *</label>
                  <input
                    type="text"
                    value={formData.batchSize}
                    onChange={(e) => handleInputChange('batchSize', e.target.value)}
                    placeholder="e.g. 30 Students"
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              {/* Row 6: Description */}
              <div>
                <label className="font-bold text-slate-700">Course Syllabus & Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter practical training modules, pattern drafting, boutique finishing & equipment requirements..."
                  className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-[#64748B] rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md uppercase tracking-wider cursor-pointer"
                >
                  Save & Publish NQR Course
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT NQR PROGRAM MODAL */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#123B5D]/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 text-[#1E293B] shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider">
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit NQR Qualification Pack</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-[#1E293B]">Edit {editingProgram.name}</h3>
              </div>
              <button 
                onClick={() => setEditingProgram(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              {/* Row 1: Course Name & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Course / Qualification Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Industry Sector *</label>
                  <select
                    value={editFormData.sector}
                    onChange={(e) => handleEditInputChange('sector', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="Apparel, Made-ups & Home Furnishing">Apparel, Made-ups & Home Furnishing</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Tourism & Hospitality">Tourism & Hospitality</option>
                    <option value="Food Processing">Food Processing</option>
                    <option value="Electronics & IT">Electronics & IT</option>
                    <option value="Renewable Energy & Solar">Renewable Energy & Solar</option>
                  </select>
                </div>
              </div>

              {/* Course Image Upload & Preset Section for Edit Modal */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#123B5D] text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Change Course Cover Image</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Upload File or Select Preset</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Image Preview */}
                  <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-800 border border-slate-300 shrink-0 relative shadow-xs">
                    <img 
                      src={editFormData.image || "/image/Tailoring_training.png"} 
                      alt="Course Edit Preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* File Upload Input */}
                    <div className="flex items-center space-x-2">
                      <label className="px-3.5 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all">
                        <Upload className="w-3.5 h-3.5 text-white" />
                        <span>Upload New Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preset Dropdown */}
                    <div>
                      <select
                        value={editFormData.image}
                        onChange={(e) => handleEditInputChange('image', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                      >
                        <option value="">-- Or Select Preset Course Image --</option>
                        {presetCourseImages.map((img, idx) => (
                          <option key={idx} value={img.url}>{img.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: QP Code & NSQF Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">QP Code (Qualification Pack)</label>
                  <input
                    type="text"
                    value={editFormData.qpCode}
                    onChange={(e) => handleEditInputChange('qpCode', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-mono focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">NSQF Level</label>
                  <select
                    value={editFormData.nsqfLevel}
                    onChange={(e) => handleEditInputChange('nsqfLevel', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                    <option value="Level 5">Level 5</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Total Duration & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Total Duration</label>
                  <input
                    type="text"
                    value={editFormData.duration}
                    onChange={(e) => handleEditInputChange('duration', e.target.value)}
                    placeholder="e.g. 300 Hours (3 Months)"
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => handleEditInputChange('status', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Hours Split (Theory, Practical, OJT) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#123B5D]">
                  ⏱️ NQR Hours Split (Theory + Practical + OJT)
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Theory Hours</label>
                    <input
                      type="text"
                      value={editFormData.theoryHours}
                      onChange={(e) => handleEditInputChange('theoryHours', e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Practical Hours</label>
                    <input
                      type="text"
                      value={editFormData.practicalHours}
                      onChange={(e) => handleEditInputChange('practicalHours', e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 text-[10px] uppercase">OJT Hours</label>
                    <input
                      type="text"
                      value={editFormData.ojtHours}
                      onChange={(e) => handleEditInputChange('ojtHours', e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-purple-700"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Qualification & Recommended Batch Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Minimum Student Qualification</label>
                  <select
                    value={editFormData.qualification}
                    onChange={(e) => handleEditInputChange('qualification', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="5th Pass">5th Pass</option>
                    <option value="8th Pass">8th Pass</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="ITI / Diploma">ITI / Diploma</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Recommended Batch Size</label>
                  <input
                    type="text"
                    value={editFormData.batchSize}
                    onChange={(e) => handleEditInputChange('batchSize', e.target.value)}
                    className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              {/* Row 6: Description */}
              <div>
                <label className="font-bold text-slate-700">Course Syllabus & Description</label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  className="w-full mt-1.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteProgram(editingProgram.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Delete Course</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingProgram(null)}
                    className="px-5 py-2.5 bg-slate-100 text-[#64748B] rounded-xl text-xs font-semibold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md uppercase tracking-wider cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW NQR QUALIFICATION DETAILS MODAL */}
      {selectedNqrDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#123B5D]/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-5 text-[#1E293B] shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-lg uppercase tracking-wider">
                  QP CODE: {selectedNqrDetail.qpCode || 'AMH/Q1947'}
                </span>
                <h3 className="text-xl font-bold font-serif text-[#1E293B] mt-1.5">
                  {selectedNqrDetail.name}
                </h3>
                <p className="text-xs text-[#64748B]">{selectedNqrDetail.sector}</p>
              </div>

              <button 
                onClick={() => setSelectedNqrDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* NQR Specification Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[9px] font-bold text-slate-400 uppercase">NSQF Level</div>
                <div className="text-sm font-black text-emerald-600 mt-0.5">{selectedNqrDetail.nsqfLevel || 'Level 4'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Total Duration</div>
                <div className="text-sm font-black text-[#123B5D] mt-0.5">{selectedNqrDetail.duration}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Eligibility</div>
                <div className="text-sm font-black text-slate-800 mt-0.5">{selectedNqrDetail.qualification || '10th Pass'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Batch Capacity</div>
                <div className="text-sm font-black text-purple-700 mt-0.5">{selectedNqrDetail.batchSize || '30 Students'}</div>
              </div>
            </div>

            {/* Hours Breakdown Box */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                NQR Curriculum Hours Distribution
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Theory Classes</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1">{selectedNqrDetail.theoryHours || '80 Hours'}</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Practical Lab</div>
                  <div className="text-sm font-extrabold text-emerald-600 mt-1">{selectedNqrDetail.practicalHours || '160 Hours'}</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">On-the-Job Training</div>
                  <div className="text-sm font-extrabold text-purple-600 mt-1">{selectedNqrDetail.ojtHours || '60 Hours'}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Qualification Overview & Syllabus</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {selectedNqrDetail.description}
              </p>
            </div>

            {/* Modal Close */}
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedNqrDetail(null)}
                className="px-5 py-2 bg-[#123B5D] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
