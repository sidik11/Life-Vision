import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { 
  Users, UserPlus, IdCard, Calendar, FileText, 
  Building, CheckCircle2, Clock, XCircle, Search, 
  Filter, Download, Mail, Phone, MapPin, Shield, Plus, X, Eye, Edit, Trash2, Award, BookOpen
} from 'lucide-react';

export default function TrainersView({ 
  trainers = [], 
  setTrainers, 
  centers = [], 
  batches = [], 
  showToast 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileTab, setProfileTab] = useState('overview'); // overview, tot, batches, contact

  // New Trainer Form State
  const [newTrainer, setNewTrainer] = useState({
    name: '',
    role: 'Master Trainer',
    qualification: '',
    sector: '',
    experience: '',
    isTotCertified: true,
    totCertNumber: '',
    phone: '',
    email: '',
    address: '',
    assignedCenter: 'Unassigned',
    assignedBatches: 'None',
    specialization: '',
    joiningDate: new Date().toISOString().split('T')[0],
    photoDoc: '',
    aadharDoc: '',
    extraDocs: [], // [{ title: '', file: null, fileName: '' }]
    status: 'Active'
  });

  const filteredTrainers = useMemo(() => {
    return (trainers || []).filter(trn => {
      if (!trn) return false;
      const tName = String(trn.name || '').toLowerCase();
      const tId = String(trn.id || '').toLowerCase();
      const tPhone = String(trn.phone || '');
      const tCenter = String(trn.assignedCenter || trn.center || '');
      const tStatus = String(trn.status || 'Active');
      const tRole = String(trn.role || 'Master Trainer');

      const matchesSearch = tName.includes(searchTerm.toLowerCase()) || tId.includes(searchTerm.toLowerCase()) || tPhone.includes(searchTerm);
      const matchesCenter = selectedCenterFilter === 'All' || tCenter.includes(selectedCenterFilter);
      const matchesStatus = selectedStatusFilter === 'All' || tStatus === selectedStatusFilter;
      const matchesRole = selectedRoleFilter === 'All' || tRole === selectedRoleFilter;

      return matchesSearch && matchesCenter && matchesStatus && matchesRole;
    });
  }, [trainers, searchTerm, selectedCenterFilter, selectedStatusFilter, selectedRoleFilter]);

  const handleAddTrainerSubmit = (e) => {
    e.preventDefault();
    if (!newTrainer.name || !newTrainer.phone) {
      if (showToast) showToast('Please enter Trainer Name and Contact Number.', 'error');
      return;
    }

    const nextIdNum = String(trainers.length + 1).padStart(3, '0');
    const created = {
      id: `LVS-TRN-2026-${nextIdNum}`,
      photo: newTrainer.photoUrl || '/beautician_training.jpg',
      ...newTrainer,
      rating: '5.0 ★'
    };

    if (setTrainers) {
      setTrainers(prev => [created, ...prev]);
    }
    setShowAddModal(false);
    setNewTrainer({
      name: '',
      role: 'Master Trainer',
      qualification: '',
      sector: '',
      experience: '',
      isTotCertified: true,
      totCertNumber: '',
      phone: '',
      email: '',
      address: '',
      assignedCenter: 'Unassigned',
      assignedBatches: 'None',
      specialization: '',
      joiningDate: new Date().toISOString().split('T')[0],
      photoDoc: '',
      aadharDoc: '',
      extraDocs: [],
      status: 'Active'
    });
    if (showToast) showToast(`${created.role || 'Trainer'} ${created.name} (${created.id}) registered successfully!`, 'success');
  };

  const handleStatusUpdate = (trainerId, newStatus) => {
    if (setTrainers) {
      setTrainers(prev => prev.map(t => t.id === trainerId ? { ...t, status: newStatus } : t));
    }
    if (showToast) showToast(`Updated trainer status to "${newStatus}"`, 'info');
  };

  const handleDeleteTrainer = (trainerId) => {
    if (window.confirm(`Are you sure you want to remove trainer ${trainerId}?`)) {
      if (setTrainers) {
        setTrainers(prev => prev.filter(t => t.id !== trainerId));
      }
      if (showToast) showToast(`Trainer ${trainerId} removed.`, 'info');
    }
  };

  const handleExportCSV = () => {
    if (showToast) showToast('Exported Trainer Directory to CSV!', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Master Trainer Management</h1>
          <p className="text-xs text-slate-500">Register certified trainers, TOT qualifications, sector domain specializations & batch assignments</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Directory</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Master Trainer</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by trainer name, ID, domain or phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="All">All Roles</option>
            <option value="Master Trainer">Master Trainer</option>
            <option value="Center Head">Center Head</option>
          </select>

          <select
            value={selectedCenterFilter}
            onChange={(e) => setSelectedCenterFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="All">All Training Centres</option>
            {centers.map(c => (
              <option key={c.id || c.name} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Trainers Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase tracking-wider font-bold">
                <th className="p-4">Trainer ID</th>
                <th className="p-4">Trainer Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Skill Domain / Sector</th>
                <th className="p-4">TOT Certified</th>
                <th className="p-4">Assigned Centre</th>
                <th className="p-4">Assigned Batches</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrainers.length > 0 ? (
                filteredTrainers.map((trn) => (
                  <tr key={trn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-pink-700">{trn.id}</td>
                    <td className="p-4 font-semibold text-slate-900">
                      <div className="flex items-center space-x-3">
                        <img src={trn.photo || '/beautician_training.jpg'} alt={trn.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{trn.name}</div>
                          <div className="text-[10px] text-slate-500">{trn.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 font-bold rounded-md text-[10px] inline-block ${
                        trn.role === 'Center Head' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {trn.role || 'Master Trainer'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{trn.sector || trn.specialization || 'Apparel'}</td>
                    <td className="p-4">
                      {trn.isTotCertified !== false ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px] inline-flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>TOT Verified</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-[10px]">
                          Pending TOT
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-700">{trn.assignedCenter || trn.center || 'Main Centre'}</td>
                    <td className="p-4 font-mono text-slate-700">{trn.assignedBatches || 'BATCH-2026-T1'}</td>
                    <td className="p-4">
                      <StatusBadge status={trn.status || 'Active'} />
                    </td>
                    <td className="p-4 text-center">
                      <ActionPopover 
                        actions={[
                          {
                            label: 'View Profile',
                            icon: Eye,
                            onClick: () => {
                              setSelectedTrainer(trn);
                              setProfileTab('overview');
                            }
                          },
                          {
                            label: 'Mark as Active',
                            icon: CheckCircle2,
                            onClick: () => handleStatusUpdate(trn.id, 'Active')
                          },
                          {
                            label: 'Delete Record',
                            icon: Trash2,
                            danger: true,
                            onClick: () => handleDeleteTrainer(trn.id)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    No trainers found. Click <strong>"Add Master Trainer"</strong> above to register a new trainer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6 my-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Register New Master Trainer</h3>
                <p className="text-xs text-slate-500">Add certified trainer details to Life Vision skill division</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTrainerSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Trainer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newTrainer.name}
                    onChange={(e) => setNewTrainer({...newTrainer, name: e.target.value})}
                    placeholder="Enter Trainer Name"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Role Designation *</label>
                  <select
                    value={newTrainer.role || 'Master Trainer'}
                    onChange={(e) => setNewTrainer({...newTrainer, role: e.target.value})}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Master Trainer">Master Trainer</option>
                    <option value="Center Head">Center Head</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={newTrainer.phone}
                    onChange={(e) => setNewTrainer({...newTrainer, phone: e.target.value})}
                    placeholder="Enter Contact Mobile Number"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={newTrainer.email}
                    onChange={(e) => setNewTrainer({...newTrainer, email: e.target.value})}
                    placeholder="Enter Email Address"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Skill Domain / Sector</label>
                  <input
                    type="text"
                    value={newTrainer.sector}
                    onChange={(e) => setNewTrainer({...newTrainer, sector: e.target.value})}
                    placeholder="Enter Sector / Domain"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">TOT Certified (Training of Trainers)</label>
                  <select
                    value={newTrainer.isTotCertified ? 'Yes' : 'No'}
                    onChange={(e) => setNewTrainer({...newTrainer, isTotCertified: e.target.value === 'Yes'})}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Yes">Yes (TOT Certified)</option>
                    <option value="No">No (Pending)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">TOT Certificate Number</label>
                  <input
                    type="text"
                    value={newTrainer.totCertNumber}
                    onChange={(e) => setNewTrainer({...newTrainer, totCertNumber: e.target.value})}
                    placeholder="Enter TOT Certificate Number"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Years of Experience</label>
                  <input
                    type="text"
                    value={newTrainer.experience}
                    onChange={(e) => setNewTrainer({...newTrainer, experience: e.target.value})}
                    placeholder="Enter Experience (e.g. 5 Years)"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Dynamic Document Uploads Section (Photo, Aadhaar, Custom Documents <= 5MB) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Upload Verification Credentials & Documents</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTrainer(prev => ({
                        ...prev,
                        extraDocs: [...(prev.extraDocs || []), { title: '', fileName: '' }]
                      }));
                    }}
                    className="px-3 py-1 bg-pink-50 hover:bg-pink-100 text-[#C52B75] text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add More Document</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Photo Upload */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Trainer Photo</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            if (showToast) showToast('File size exceeds 5MB limit!', 'error');
                            e.target.value = '';
                            return;
                          }
                          setNewTrainer(p => ({ 
                            ...p, 
                            photoDoc: file.name, 
                            photoUrl: URL.createObjectURL(file) 
                          }));
                          if (showToast) showToast(`Selected Photo: ${file.name}`, 'info');
                        }
                      }}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-pink-100 file:text-[#C52B75] hover:file:bg-pink-200 cursor-pointer"
                    />
                  </div>

                  {/* Aadhaar Upload */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Aadhaar Card Copy</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            if (showToast) showToast('File size exceeds 5MB limit!', 'error');
                            e.target.value = '';
                            return;
                          }
                          setNewTrainer(p => ({ ...p, aadharDoc: file.name }));
                          if (showToast) showToast(`Selected Aadhaar: ${file.name}`, 'info');
                        }
                      }}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Additional Dynamic Custom Documents */}
                {newTrainer.extraDocs && newTrainer.extraDocs.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {newTrainer.extraDocs.map((docItem, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Document Name (e.g. Qualification Degree, Resume)"
                          value={docItem.title || ''}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            setNewTrainer(p => {
                              const updated = [...p.extraDocs];
                              updated[idx] = { ...updated[idx], title: newTitle };
                              return { ...p, extraDocs: updated };
                            });
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  if (showToast) showToast('File size exceeds 5MB limit!', 'error');
                                  e.target.value = '';
                                  return;
                                }
                                setNewTrainer(p => {
                                  const updated = [...p.extraDocs];
                                  updated[idx] = { ...updated[idx], fileName: file.name };
                                  return { ...p, extraDocs: updated };
                                });
                                if (showToast) showToast(`Attached ${file.name}`, 'info');
                              }
                            }}
                            className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-800 cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewTrainer(p => ({
                                ...p,
                                extraDocs: p.extraDocs.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-700 hover:bg-pink-800 text-white font-bold rounded-xl shadow-md"
                >
                  Save & Register Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainer Profile Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto space-y-0 text-slate-900">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={selectedTrainer.photo || '/beautician_training.jpg'} alt={selectedTrainer.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-300" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-serif">{selectedTrainer.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedTrainer.id} • Sector: {selectedTrainer.sector}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTrainer(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">TOT Status</span>
                  <p className="font-bold text-emerald-700">{selectedTrainer.isTotCertified ? `Certified (${selectedTrainer.totCertNumber})` : 'Pending'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Centre</span>
                  <p className="font-bold text-slate-900">{selectedTrainer.assignedCenter || 'Main Centre'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Assigned Batches</span>
                  <p className="font-mono font-bold text-slate-800">{selectedTrainer.assignedBatches || 'BATCH-2026-T1'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Contact Info</span>
                  <p className="font-semibold text-slate-800">{selectedTrainer.phone} • {selectedTrainer.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedTrainer(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
