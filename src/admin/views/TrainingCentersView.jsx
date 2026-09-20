import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { 
  Plus, MapPin, Users, BookOpen, Phone, Mail, Building, 
  Calendar, Search, Filter, Eye, Edit, Trash2, ShieldCheck, CheckCircle2, AlertCircle, X
} from 'lucide-react';

export default function TrainingCentersView({ 
  centers = [], 
  batches = [], 
  students = [], 
  trainers = [],
  programs = [],
  onAddCenter, 
  onUpdateCenter, 
  onDeleteCenter, 
  showToast,
  onNavigate 
}) {
  const notify = showToast || (() => {});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [editCenter, setEditCenter] = useState(null);
  const [deleteConfirmCenter, setDeleteConfirmCenter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Initial Form State for Adding / Editing Centre
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state: 'Odisha',
    district: '',
    city: '',
    pincode: '',
    contactNumber: '',
    email: '',
    centerHead: '',
    capacity: '',
    rooms: '',
    facilities: '',
    coursesOffered: [],
    openingDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    description: '',
    photo: '/image/logo.png'
  });

  // Calculate active trainees & batches per centre dynamically from real DB
  const enrichedCenters = useMemo(() => {
    return centers.map(ctr => {
      const activeBatchesCount = batches.filter(b => 
        (b.center === ctr.name || b.centerId === ctr.id) && b.status !== 'Completed' && b.status !== 'Cancelled'
      ).length;

      const activeTraineesCount = students.filter(s => 
        (s.center === ctr.name || s.centerId === ctr.id) && s.status !== 'Dropout' && s.status !== 'Completed'
      ).length;

      return {
        ...ctr,
        activeBatchesCount,
        activeStudents: activeTraineesCount || ctr.activeStudents || 0
      };
    });
  }, [centers, batches, students]);

  // Search & Filtered Centres
  const filteredCenters = useMemo(() => {
    return enrichedCenters.filter(ctr => {
      const matchesSearch = 
        ctr.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctr.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctr.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ctr.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || ctr.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedCenters, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage) || 1;
  const paginatedCenters = filteredCenters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.district) {
      notify('Please fill in Centre Name, Address and District.', 'error');
      return;
    }

    if (editCenter) {
      const updated = {
        ...editCenter,
        ...formData,
        location: `${formData.city || formData.district}, ${formData.state}`,
        contactPerson: `${formData.centerHead} (${formData.contactNumber})`
      };
      if (onUpdateCenter) onUpdateCenter(updated);
      notify(`Training Centre ${updated.name} updated successfully!`, 'success');
      setEditCenter(null);
    } else {
      const uniqueId = `LVS-CENTRE-2026-${String(centers.length + 1).padStart(3, '0')}`;
      const newCenter = {
        id: uniqueId,
        ...formData,
        courses: Array.isArray(formData.coursesOffered) ? formData.coursesOffered : [formData.coursesOffered],
        location: `${formData.city || formData.district}, ${formData.state}`,
        contactPerson: `${formData.centerHead} (${formData.contactNumber})`,
        activeStudents: 0
      };
      if (onAddCenter) onAddCenter(newCenter);
      notify(`Training Centre ${newCenter.name} (${uniqueId}) added successfully!`, 'success');
      setShowAddModal(false);
    }

    // Reset Form
    setFormData({
      name: '',
      address: '',
      state: 'Odisha',
      district: '',
      city: '',
      pincode: '',
      contactNumber: '',
      email: '',
      centerHead: '',
      capacity: 250,
      rooms: 4,
      facilities: 'Sewing Machines, Beauty Kits, Computer Lab, Health Aid Kits',
      coursesOffered: ['Tailoring & Stitching', 'Beautician & Wellness'],
      openingDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      description: '',
      photo: '/image/logo.png'
    });
  };

  const handleStartEdit = (ctr) => {
    setEditCenter(ctr);
    setFormData({
      name: ctr.name || '',
      address: ctr.address || ctr.location || '',
      state: ctr.state || 'Odisha',
      district: ctr.district || '',
      city: ctr.city || '',
      pincode: ctr.pincode || '',
      contactNumber: ctr.contactNumber || '',
      email: ctr.email || '',
      centerHead: ctr.centerHead || '',
      capacity: ctr.capacity || 250,
      rooms: ctr.rooms || 4,
      facilities: ctr.facilities || '',
      coursesOffered: ctr.courses || ['Tailoring & Stitching'],
      openingDate: ctr.openingDate || '2026-01-01',
      status: ctr.status || 'Active',
      description: ctr.description || '',
      photo: ctr.photo || '/image/logo.png'
    });
  };

  const handleDeleteAttempt = (ctr) => {
    // Safety check: Prevent deletion if active batches/students are linked to this centre
    const activeBatchesCount = batches.filter(b => (b.center === ctr.name || b.centerId === ctr.id) && b.status === 'Active').length;
    const activeStudentsCount = students.filter(s => (s.center === ctr.name || s.centerId === ctr.id) && s.status === 'Active').length;

    if (activeBatchesCount > 0 || activeStudentsCount > 0) {
      notify(`Cannot delete ${ctr.name}! It currently has ${activeBatchesCount} active batches and ${activeStudentsCount} active trainees linked. Please reassign or close batches first.`, 'error');
      return;
    }
    setDeleteConfirmCenter(ctr);
  };

  const confirmDelete = () => {
    if (deleteConfirmCenter) {
      if (onDeleteCenter) onDeleteCenter(deleteConfirmCenter.id);
      notify(`Training Centre ${deleteConfirmCenter.name} deleted safely.`, 'info');
      setDeleteConfirmCenter(null);
    }
  };

  const toggleStatus = (ctr) => {
    const nextStatus = ctr.status === 'Active' ? 'Inactive' : 'Active';
    if (onUpdateCenter) onUpdateCenter({ ...ctr, status: nextStatus });
    notify(`Centre ${ctr.name} is now ${nextStatus}.`, 'info');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <span>Training Centres Management</span>
            <span className="text-xs bg-pink-100 text-[#C52B75] font-bold px-2.5 py-0.5 rounded-full border border-pink-200 font-sans">
              {centers.length} Centres Registered
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage LVS vocational skill hubs, capacity, rooms, facility infrastructure & regional heads</p>
        </div>

        <button
          onClick={() => {
            setEditCenter(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Training Centre</span>
        </button>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Centre Name, ID, Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requirement 1: Training Centre List Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 uppercase tracking-wider font-bold">
                <th className="p-4">Centre ID & Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Courses Offered</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Active Trainees</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedCenters.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">
                    <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No Training Centres Found</p>
                    <p className="text-xs text-slate-500">Click "Add Training Centre" above to register a new vocational hub.</p>
                  </td>
                </tr>
              ) : (
                paginatedCenters.map((ctr) => (
                  <tr key={ctr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{ctr.name}</div>
                      <div className="text-3xs text-[#C52B75] font-mono font-bold">{ctr.id}</div>
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C52B75] shrink-0" />
                        <span>{ctr.location || `${ctr.city || ctr.district}, ${ctr.state}`}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(ctr.courses || ['Tailoring & Stitching']).map((c, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-800 font-bold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 text-slate-800 font-bold">{ctr.capacity} Trainees</td>

                    <td className="p-4 font-black text-emerald-700 text-sm">
                      {ctr.activeStudents} Active
                    </td>

                    <td className="p-4">
                      <StatusBadge status={ctr.status} />
                    </td>

                    {/* Requirement 1: Three-dot (⋮) Menu Action Popover */}
                    <td className="p-4 text-right">
                      <ActionPopover
                        items={[
                          { label: 'View Details', icon: Eye, onClick: () => setSelectedCenter(ctr) },
                          { label: 'Edit Centre', icon: Edit, onClick: () => handleStartEdit(ctr) },
                          { label: ctr.status === 'Active' ? 'Deactivate' : 'Activate', icon: ShieldCheck, onClick: () => toggleStatus(ctr) },
                          { divider: true },
                          { label: 'View Batches', icon: BookOpen, onClick: () => onNavigate && onNavigate('batches', { centerId: ctr.id }) },
                          { label: 'View Students', icon: Users, onClick: () => onNavigate && onNavigate('students', { centerId: ctr.id }) },
                          { label: 'View Reports', icon: Calendar, onClick: () => onNavigate && onNavigate('training-reports', { centerId: ctr.id }) },
                          { divider: true },
                          { label: 'Delete Centre', icon: Trash2, danger: true, onClick: () => handleDeleteAttempt(ctr) }
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
            <span>Showing Page {currentPage} of {totalPages} ({filteredCenters.length} Total)</span>
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

      {/* Requirement 1: ADD / EDIT TRAINING CENTRE MODAL FORM */}
      {(showAddModal || editCenter) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-black text-slate-900">
                {editCenter ? `Edit Centre: ${editCenter.name}` : 'Add New Training Centre'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditCenter(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Centre Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Centre Name"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Assigned Centre Head / Coordinator</label>
                  {trainers && trainers.length > 0 ? (
                    <select
                      value={formData.centerHead}
                      onChange={(e) => setFormData(p => ({ ...p, centerHead: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-bold"
                    >
                      <option value="">-- Select Centre Head / Trainer --</option>
                      {trainers.map(t => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.role || 'Trainer'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter Centre Head Name"
                      value={formData.centerHead}
                      onChange={(e) => setFormData(p => ({ ...p, centerHead: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter Phone Number"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(p => ({ ...p, contactNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter District Name"
                    value={formData.district}
                    onChange={(e) => setFormData(p => ({ ...p, district: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">City / Village</label>
                  <input
                    type="text"
                    placeholder="Enter City or Village"
                    value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Centre Capacity (Trainees)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter total student capacity"
                    value={formData.capacity === undefined ? '' : formData.capacity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormData(p => ({ ...p, capacity: '' }));
                      } else {
                        const num = Math.max(0, parseInt(val, 10) || 0);
                        setFormData(p => ({ ...p, capacity: num }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Available Rooms / Labs</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter number of rooms/labs"
                    value={formData.rooms === undefined ? '' : formData.rooms}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormData(p => ({ ...p, rooms: '' }));
                      } else {
                        const num = Math.max(0, parseInt(val, 10) || 0);
                        setFormData(p => ({ ...p, rooms: num }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 mb-1">Full Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              {/* Multi-Course Selection */}
              <div>
                <label className="block text-2xs font-bold text-slate-700 mb-1">Available Courses / Programs Offered *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
                  {(programs && programs.length > 0 ? programs.map(p => p.name || p.title) : [
                    'Tailoring & Stitching',
                    'Beautician & Wellness',
                    'Agriculture & Farming',
                    'Healthcare & Caregiving',
                    'Tourism & Hospitality',
                    'Food & Beverages'
                  ]).map((cName) => {
                    const isChecked = Array.isArray(formData.coursesOffered) && formData.coursesOffered.includes(cName);
                    return (
                      <label key={cName} className="flex items-center space-x-2 text-xs text-slate-800 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = Array.isArray(formData.coursesOffered) ? [...formData.coursesOffered] : [];
                            if (e.target.checked) {
                              setFormData(p => ({ ...p, coursesOffered: [...current, cName] }));
                            } else {
                              setFormData(p => ({ ...p, coursesOffered: current.filter(c => c !== cName) }));
                            }
                          }}
                          className="rounded text-[#C52B75] focus:ring-[#C52B75]"
                        />
                        <span>{cName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold text-slate-700 mb-1">Training Facilities & Lab Tools</label>
                <textarea
                  rows={2}
                  placeholder="Enter training equipment and facility details"
                  value={formData.facilities}
                  onChange={(e) => setFormData(p => ({ ...p, facilities: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditCenter(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C52B75] hover:opacity-90 text-white rounded-xl font-bold shadow-md"
                >
                  {editCenter ? 'Save Changes' : 'Submit & Create Centre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requirement 1: VIEW CENTRE DETAILS MODAL */}
      {selectedCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-3xs font-black text-[#C52B75] font-mono">{selectedCenter.id}</span>
                <h3 className="text-lg font-serif font-black text-slate-900">{selectedCenter.name}</h3>
              </div>
              <button onClick={() => setSelectedCenter(null)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-pink-50/40 p-4 rounded-2xl border border-pink-100">
                <div>
                  <span className="text-3xs text-slate-400 font-bold uppercase block">Capacity</span>
                  <span className="font-bold text-slate-900">{selectedCenter.capacity} Trainees</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 font-bold uppercase block">Active Trainees</span>
                  <span className="font-black text-emerald-700">{selectedCenter.activeStudents} Enrolled</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 font-bold uppercase block">Centre Head</span>
                  <span className="font-bold text-slate-900">{selectedCenter.contactPerson || selectedCenter.centerHead || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 font-bold uppercase block">Status</span>
                  <StatusBadge status={selectedCenter.status} />
                </div>
              </div>

              <div>
                <span className="text-3xs text-slate-400 font-bold uppercase block">Location & Address</span>
                <span className="font-medium text-slate-800">{selectedCenter.address || selectedCenter.location}</span>
              </div>

              <div>
                <span className="text-3xs text-slate-400 font-bold uppercase block">Facilities & Equipment</span>
                <span className="font-medium text-slate-700">{selectedCenter.facilities || 'Sewing Machines, Beauty Kits, Labs'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedCenter(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold">
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requirement 1: DELETE CONFIRMATION DIALOG */}
      {deleteConfirmCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirmCenter.name}</span> ({deleteConfirmCenter.id})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button onClick={() => setDeleteConfirmCenter(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md">
                Yes, Delete Centre
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
