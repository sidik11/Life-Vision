import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { 
  Plus, Calendar, User, Building2, BookOpen, Clock, 
  Search, Filter, Eye, Edit, Trash2, CheckCircle2, AlertCircle, X, Award, FileText, Users, BarChart2, ShieldCheck, Play, Pause, Archive
} from 'lucide-react';

export default function BatchesView({ 
  batches = [], 
  centers = [], 
  programs = [], 
  trainers = [], 
  students = [], 
  attendance = [], 
  assessments = [], 
  certificates = [],
  onAddBatch, 
  onUpdateBatch, 
  onDeleteBatch, 
  showToast,
  onNavigate 
}) {
  const notify = showToast || (() => {});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeBatchTab, setActiveBatchTab] = useState('overview'); // 'overview' | 'students' | 'trainer' | 'attendance' | 'assessment' | 'certificates' | 'reports'
  const [deleteConfirmBatch, setDeleteConfirmBatch] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [centerFilter, setCenterFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form State
  const [formData, setFormData] = useState({
    course: 'Tailoring & Stitching',
    center: 'Bhubaneswar LVS Skill Center',
    trainer: 'Sunita Sahu',
    centerHead: 'Dr. Sunita Sharma',
    qualification: 'Level 4 (AMH/Q1947)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    duration: '300 Hours (3 Months)',
    theoryHours: 80,
    practicalHours: 160,
    ojtHours: 60,
    capacity: 30,
    batchTiming: 'Morning (09:00 AM - 01:00 PM)',
    status: 'Upcoming'
  });

  // Calculate Total Hours automatically: Theory + Practical + OJT
  const totalHours = Number(formData.theoryHours || 0) + Number(formData.practicalHours || 0) + Number(formData.ojtHours || 0);

  // Enriched Batches with student counts
  const enrichedBatches = useMemo(() => {
    return batches.map(b => {
      const batchStudents = students.filter(s => s.batch === b.id || s.batchId === b.id);
      return {
        ...b,
        currentStudentsCount: batchStudents.length || b.students || 0
      };
    });
  }, [batches, students]);

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return enrichedBatches.filter(b => {
      const matchesSearch = 
        b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.center?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.trainer?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchesCenter = centerFilter === 'ALL' || b.center === centerFilter;

      return matchesSearch && matchesStatus && matchesCenter;
    });
  }, [enrichedBatches, searchTerm, statusFilter, centerFilter]);

  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage) || 1;
  const paginatedBatches = filteredBatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.course || !formData.center) {
      notify('Please select Course and Training Centre.', 'error');
      return;
    }

    if (editBatch) {
      const updated = {
        ...editBatch,
        ...formData,
        totalHours: totalHours
      };
      if (onUpdateBatch) onUpdateBatch(updated);
      notify(`Batch ${updated.id} updated successfully!`, 'success');
      setEditBatch(null);
    } else {
      const uniqueId = `LVS-BATCH-2026-${String(batches.length + 1).padStart(3, '0')}`;
      const newBatch = {
        id: uniqueId,
        ...formData,
        totalHours: totalHours,
        students: 0,
        currentStudentsCount: 0
      };
      if (onAddBatch) onAddBatch(newBatch);
      notify(`New Batch ${uniqueId} created successfully!`, 'success');
      setShowAddModal(false);
    }
  };

  const updateBatchStatus = (batch, nextStatus) => {
    const updated = { ...batch, status: nextStatus };
    if (onUpdateBatch) onUpdateBatch(updated);
    notify(`Batch ${batch.id} status updated to ${nextStatus}.`, 'info');
  };

  const handleDelete = (batch) => {
    if (batch.status === 'Active') {
      notify(`Cannot delete Batch ${batch.id} while it is Active! Please Close or Cancel the batch first.`, 'error');
      return;
    }
    setDeleteConfirmBatch(batch);
  };

  const confirmDeleteBatch = () => {
    if (deleteConfirmBatch) {
      if (onDeleteBatch) onDeleteBatch(deleteConfirmBatch.id);
      notify(`Batch ${deleteConfirmBatch.id} deleted successfully.`, 'info');
      setDeleteConfirmBatch(null);
    }
  };

  // Batch Specific Filtered Sub-datasets for Tabbed Detail Modal
  const batchStudents = useMemo(() => {
    if (!selectedBatch) return [];
    return students.filter(s => s.batch === selectedBatch.id || s.batchId === selectedBatch.id);
  }, [selectedBatch, students]);

  const batchAttendance = useMemo(() => {
    if (!selectedBatch) return [];
    return attendance.filter(a => a.batchId === selectedBatch.id || a.batch === selectedBatch.id);
  }, [selectedBatch, attendance]);

  const batchAssessments = useMemo(() => {
    if (!selectedBatch) return [];
    return assessments.filter(a => a.batchId === selectedBatch.id || a.batch === selectedBatch.id);
  }, [selectedBatch, assessments]);

  const batchCertificates = useMemo(() => {
    if (!selectedBatch) return [];
    return certificates.filter(c => c.batch === selectedBatch.id || c.batchId === selectedBatch.id);
  }, [selectedBatch, certificates]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <span>Batch Management</span>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full border border-purple-200 font-sans">
              {batches.length} Total Batches
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Schedule training modules, theory/practical hours, trainers, and student batch lifecycles</p>
        </div>

        <button
          onClick={() => {
            setEditBatch(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Batch ID, Course, Trainer, Centre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requirement 2: Batch List Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 uppercase tracking-wider font-bold">
                <th className="p-4">Batch ID</th>
                <th className="p-4">Course / Program</th>
                <th className="p-4">Training Centre</th>
                <th className="p-4">Trainer</th>
                <th className="p-4">Start – End Date</th>
                <th className="p-4">Student Capacity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedBatches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No Batches Found</p>
                    <p className="text-xs text-slate-500">Click "Create New Batch" above to start a new training schedule.</p>
                  </td>
                </tr>
              ) : (
                paginatedBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#C52B75]">{b.id}</td>
                    
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{b.course}</div>
                      <div className="text-3xs text-slate-500">{b.qualification || 'Level 4'}</div>
                    </td>

                    <td className="p-4 text-slate-700 font-medium">{b.center}</td>
                    
                    <td className="p-4 font-semibold text-slate-900">{b.trainer || 'Unassigned'}</td>
                    
                    <td className="p-4 text-slate-600 font-medium">
                      {b.startDate} to {b.endDate}
                    </td>

                    <td className="p-4 font-black text-slate-900">
                      {b.currentStudentsCount} / {b.capacity} Students
                    </td>

                    <td className="p-4">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Requirement 2: Three-dot (⋮) Action Popover */}
                    <td className="p-4 text-right">
                      <ActionPopover
                        items={[
                          { label: 'View Batch Details', icon: Eye, onClick: () => { setSelectedBatch(b); setActiveBatchTab('overview'); } },
                          { label: 'Edit Batch', icon: Edit, onClick: () => setEditBatch(b) },
                          { divider: true },
                          { label: 'Start Batch', icon: Play, onClick: () => updateBatchStatus(b, 'Active'), disabled: b.status === 'Active' },
                          { label: 'Close Batch', icon: CheckCircle2, onClick: () => updateBatchStatus(b, 'Completed'), disabled: b.status === 'Completed' },
                          { label: 'Put On Hold', icon: Pause, onClick: () => updateBatchStatus(b, 'On Hold') },
                          { label: 'Cancel Batch', icon: X, onClick: () => updateBatchStatus(b, 'Cancelled') },
                          { divider: true },
                          { label: 'View Students', icon: Users, onClick: () => onNavigate && onNavigate('students', { batchId: b.id }) },
                          { label: 'View Attendance', icon: Calendar, onClick: () => onNavigate && onNavigate('attendance', { batchId: b.id }) },
                          { label: 'View Assessment', icon: Award, onClick: () => onNavigate && onNavigate('assessments', { batchId: b.id }) },
                          { label: 'View Certificates', icon: FileText, onClick: () => onNavigate && onNavigate('certificates', { batchId: b.id }) },
                          { label: 'Delete Batch', icon: Trash2, danger: true, onClick: () => handleDelete(b) }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing Page {currentPage} of {totalPages} ({filteredBatches.length} Total)</span>
            <div className="flex space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-100 rounded-lg disabled:opacity-50 font-bold"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-100 rounded-lg disabled:opacity-50 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Requirement 2: CREATE / EDIT BATCH FORM MODAL */}
      {(showAddModal || editBatch) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-black text-slate-900">
                {editBatch ? `Edit Batch: ${editBatch.id}` : 'Create New Training Batch'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditBatch(null); }} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Course / Training Program *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData(p => ({ ...p, course: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-bold"
                  >
                    <option value="Tailoring & Stitching">Tailoring & Stitching</option>
                    <option value="Beautician & Wellness">Beautician & Wellness</option>
                    <option value="Agriculture & Farming">Agriculture & Farming</option>
                    <option value="Healthcare & Caregiving">Healthcare & Caregiving</option>
                    <option value="Tourism & Hospitality">Tourism & Hospitality</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Training Centre *</label>
                  <select
                    value={formData.center}
                    onChange={(e) => setFormData(p => ({ ...p, center: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-bold"
                  >
                    {centers.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.location})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Assigned Trainer</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita Sahu"
                    value={formData.trainer}
                    onChange={(e) => setFormData(p => ({ ...p, trainer: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Qualification / NSQF Level</label>
                  <input
                    type="text"
                    placeholder="e.g. Level 4 (AMH/Q1947)"
                    value={formData.qualification}
                    onChange={(e) => setFormData(p => ({ ...p, qualification: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Batch Capacity (Students)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(p => ({ ...p, capacity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Batch Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-bold"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Requirement 2: Auto-calculated Total Hours */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-wider block">
                  Automatic Duration & Hours Breakdown
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-3xs font-bold text-slate-600 block">Theory Hours</label>
                    <input
                      type="number"
                      value={formData.theoryHours}
                      onChange={(e) => setFormData(p => ({ ...p, theoryHours: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-bold text-slate-600 block">Practical Hours</label>
                    <input
                      type="number"
                      value={formData.practicalHours}
                      onChange={(e) => setFormData(p => ({ ...p, practicalHours: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-bold text-slate-600 block">OJT Hours</label>
                    <input
                      type="number"
                      value={formData.ojtHours}
                      onChange={(e) => setFormData(p => ({ ...p, ojtHours: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200 mt-2 font-bold text-slate-900">
                  <span>Total Calculated Hours:</span>
                  <span className="text-[#C52B75] font-mono text-sm">{totalHours} Hours</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => { setShowAddModal(false); setEditBatch(null); }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#C52B75] text-white rounded-xl font-bold shadow-md">
                  {editBatch ? 'Save Changes' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requirement 2: BATCH DETAILS TABBED PAGE MODAL (Overview, Students, Trainer, Attendance, Assessment, Certificates, Reports) */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[92vh] overflow-y-auto space-y-5 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#C52B75] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-extrabold text-[#C52B75]">{selectedBatch.id}</span>
                    <StatusBadge status={selectedBatch.status} />
                  </div>
                  <h3 className="text-lg font-serif font-black text-slate-900">{selectedBatch.course}</h3>
                  <p className="text-2xs text-slate-500">{selectedBatch.center} • Trainer: {selectedBatch.trainer}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100">✕</button>
            </div>

            {/* Requirement 2: 7 Tabs Bar */}
            <div className="flex items-center space-x-1.5 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'overview', label: '📌 Overview' },
                { id: 'students', label: `👥 Students (${batchStudents.length})` },
                { id: 'trainer', label: '👩‍🏫 Trainer' },
                { id: 'attendance', label: `📅 Attendance (${batchAttendance.length})` },
                { id: 'assessment', label: `📝 Assessment (${batchAssessments.length})` },
                { id: 'certificates', label: `🧾 Certificates (${batchCertificates.length})` },
                { id: 'reports', label: '📊 Reports' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveBatchTab(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    activeBatchTab === tab.id
                      ? 'bg-[#123B5D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: OVERVIEW */}
            {activeBatchTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-3xs text-slate-400 font-bold uppercase block">Capacity</span>
                    <span className="font-bold text-slate-900">{selectedBatch.currentStudentsCount} / {selectedBatch.capacity} Enrolled</span>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 font-bold uppercase block">Start Date</span>
                    <span className="font-bold text-slate-900">{selectedBatch.startDate}</span>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 font-bold uppercase block">End Date</span>
                    <span className="font-bold text-slate-900">{selectedBatch.endDate}</span>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 font-bold uppercase block">Total Hours</span>
                    <span className="font-mono font-bold text-[#C52B75]">{selectedBatch.totalHours || 300} Hours</span>
                  </div>
                </div>

                <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
                  <h4 className="font-bold text-slate-900">Training Schedule & Syllabus Breakdown</h4>
                  <div className="grid grid-cols-3 gap-2 text-2xs font-bold text-slate-700">
                    <div>Theory: {selectedBatch.theoryHours || 80} Hours</div>
                    <div>Practical: {selectedBatch.practicalHours || 160} Hours</div>
                    <div>OJT: {selectedBatch.ojtHours || 60} Hours</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: STUDENTS */}
            {activeBatchTab === 'students' && (
              <div className="space-y-3 text-xs">
                {batchStudents.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">No trainees assigned to this batch yet.</p>
                ) : (
                  batchStudents.map(s => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={s.photo || '/image/logo.png'} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-3xs text-slate-500 font-mono">{s.id} • {s.phone}</div>
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: TRAINER */}
            {activeBatchTab === 'trainer' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Assigned Lead Trainer</h4>
                <p><span className="font-bold">Name:</span> {selectedBatch.trainer || 'Dr. Sunita Sharma'}</p>
                <p><span className="font-bold">Qualification:</span> ToT Certified Specialist</p>
                <p><span className="font-bold">Centre:</span> {selectedBatch.center}</p>
              </div>
            )}

            {/* Tab 4: ATTENDANCE */}
            {activeBatchTab === 'attendance' && (
              <div className="space-y-2 text-xs">
                {batchAttendance.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">No attendance marked for this batch yet.</p>
                ) : (
                  batchAttendance.map((a, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold">{a.studentName}</span>
                        <span className="text-2xs text-slate-500 block">{a.date} • {a.session}</span>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 5: ASSESSMENT */}
            {activeBatchTab === 'assessment' && (
              <div className="space-y-2 text-xs">
                {batchAssessments.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">No assessments evaluated for this batch yet.</p>
                ) : (
                  batchAssessments.map((ass, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold">{ass.studentName}</span>
                        <span className="text-2xs text-slate-500 block">{ass.type} ({ass.date})</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700">{ass.marksObtained} / {ass.maxMarks} ({ass.result})</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 6: CERTIFICATES */}
            {activeBatchTab === 'certificates' && (
              <div className="space-y-2 text-xs">
                {batchCertificates.length === 0 ? (
                  <p className="p-6 text-center text-slate-400">No certificates generated for this batch yet.</p>
                ) : (
                  batchCertificates.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold">{c.student}</span>
                        <span className="text-3xs font-mono text-[#C52B75] block">{c.certNo}</span>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 7: REPORTS */}
            {activeBatchTab === 'reports' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">Batch Performance Summary</h4>
                <p>Enrolled: {selectedBatch.currentStudentsCount} Trainees</p>
                <p>Status: {selectedBatch.status}</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedBatch(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs">
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Delete Batch {deleteConfirmBatch.id}?</h3>
            <p className="text-xs text-slate-600">Are you sure you want to remove this batch record?</p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button onClick={() => setDeleteConfirmBatch(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={confirmDeleteBatch} className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
