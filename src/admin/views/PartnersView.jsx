import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { Plus, Building2, Mail, Phone, MapPin, Handshake, Filter, Download, Eye, Edit, Trash2, CheckCircle2, Clock, X, XCircle } from 'lucide-react';
import { db, doc, updateDoc, deleteDoc } from '../../firebase';

export default function PartnersView({ partners = [], setPartners, onAddPartner, showToast, activeSubTab = 'all-partners' }) {
  const [subTab, setSubTab] = useState(activeSubTab);

  useEffect(() => {
    if (activeSubTab && activeSubTab !== 'partners') {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);
  const [showModal, setShowModal] = useState(false);
  const [viewingPartner, setViewingPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);

  // Add Partner Form State
  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [partnerType, setPartnerType] = useState('CSR Partner');

  // Edit Partner Form State
  const [editForm, setEditForm] = useState({
    orgName: '',
    contactPerson: '',
    email: '',
    phone: '',
    partnerType: 'CSR Partner',
    location: '',
    status: 'Approved',
    interests: '',
    notes: ''
  });

  const notify = showToast || (() => {});

  const handleAdd = () => {
    if (!orgName.trim()) {
      notify('Please enter Organization Name', 'error');
      return;
    }
    const created = {
      id: `PRT-OD-0${partners.length + 1}`,
      orgName: orgName,
      contactPerson: contactPerson || 'Authorized Representative',
      email: 'partner@organization.org',
      partnerType: partnerType,
      location: 'Odisha',
      dateJoined: new Date().toISOString().split('T')[0],
      status: 'Approved',
      grantAmount: 'Skill & Placement MoU'
    };

    if (setPartners) {
      setPartners([created, ...partners]);
    } else if (onAddPartner) {
      onAddPartner(created);
    }
    setShowModal(false);
    setOrgName('');
    setContactPerson('');
    notify(`Partner ${created.orgName} added successfully!`, 'success');
  };

  // Verification & Status Change Handlers
  const handleApprovePartner = async (prt) => {
    const updated = { ...prt, status: 'Approved' };
    if (setPartners) {
      setPartners(prev => prev.map(p => (p.id === prt.id || (p.firestoreId && p.firestoreId === prt.firestoreId)) ? updated : p));
    }
    const docId = prt.firestoreId || prt.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "partners", docId), { status: 'Approved', updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Firestore partner approve notice:", e);
      }
    }
    notify(`✓ Verified & Approved partner application for ${prt.orgName || prt.name}!`, 'success');
  };

  const handleRejectPartner = async (prt) => {
    const updated = { ...prt, status: 'Rejected' };
    if (setPartners) {
      setPartners(prev => prev.map(p => (p.id === prt.id || (p.firestoreId && p.firestoreId === prt.firestoreId)) ? updated : p));
    }
    const docId = prt.firestoreId || prt.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "partners", docId), { status: 'Rejected', updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Firestore partner reject notice:", e);
      }
    }
    notify(`Rejected partner application for ${prt.orgName || prt.name}.`, 'info');
  };

  const handlePendingPartner = async (prt) => {
    const updated = { ...prt, status: 'Pending' };
    if (setPartners) {
      setPartners(prev => prev.map(p => (p.id === prt.id || (p.firestoreId && p.firestoreId === prt.firestoreId)) ? updated : p));
    }
    const docId = prt.firestoreId || prt.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "partners", docId), { status: 'Pending', updatedAt: new Date().toISOString() });
      } catch (e) {
        console.warn("Firestore partner pending notice:", e);
      }
    }
    notify(`Marked ${prt.orgName || prt.name} as Pending Verification.`, 'info');
  };

  const handleDeletePartner = async (prt) => {
    if (window.confirm(`Are you sure you want to delete partner "${prt.orgName || prt.name}"?`)) {
      const docId = prt.firestoreId || prt.id;
      if (docId) {
        try {
          await deleteDoc(doc(db, "partners", docId));
        } catch (e) {
          console.warn("Firestore partner delete notice:", e);
        }
      }
      if (setPartners) {
        setPartners(prev => prev.filter(p => p.id !== prt.id && (!prt.firestoreId || p.firestoreId !== prt.firestoreId)));
      }
      notify(`Deleted partner ${prt.orgName || prt.name}.`, 'info');
    }
  };

  const handleOpenEdit = (prt) => {
    setEditingPartner(prt);
    setEditForm({
      orgName: prt.orgName || prt.name || '',
      contactPerson: prt.contactPerson || '',
      email: prt.email || '',
      phone: prt.phone || prt.mobile || '',
      partnerType: prt.partnerType || 'CSR Corporate Partner',
      location: prt.location || 'Odisha',
      status: prt.status || 'Approved',
      interests: prt.interests || prt.grantAmount || '',
      notes: prt.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.orgName.trim()) {
      notify('Please enter organization name', 'error');
      return;
    }
    const updated = {
      ...editingPartner,
      orgName: editForm.orgName,
      name: editForm.orgName,
      contactPerson: editForm.contactPerson,
      email: editForm.email,
      phone: editForm.phone,
      mobile: editForm.phone,
      partnerType: editForm.partnerType,
      location: editForm.location,
      status: editForm.status,
      interests: editForm.interests,
      grantAmount: editForm.interests,
      notes: editForm.notes
    };
    if (setPartners) {
      setPartners(prev => prev.map(p => (p.id === editingPartner.id || (p.firestoreId && p.firestoreId === editingPartner.firestoreId)) ? updated : p));
    }
    const docId = editingPartner.firestoreId || editingPartner.id;
    if (docId) {
      try {
        await updateDoc(doc(db, "partners", docId), updated);
      } catch (e) {
        console.warn("Firestore partner edit notice:", e);
      }
    }
    setEditingPartner(null);
    notify(`✓ Updated partner ${editForm.orgName}!`, 'success');
  };

  const filteredPartners = partners.filter(p => {
    const isApp = p.status?.toLowerCase() === 'pending' || p.status?.toLowerCase() === 'application' || p.status?.toLowerCase() === 'submitted';
    if (subTab === 'partner-applications') return isApp;
    
    // Main partner listings should ONLY show Approved / Verified / Active partners!
    if (isApp || p.status?.toLowerCase() === 'rejected') return false;

    if (subTab === 'csr-partners') return p.partnerType?.toLowerCase().includes('csr');
    if (subTab === 'corporate-partners') return p.partnerType?.toLowerCase().includes('corporate');
    if (subTab === 'training-partners') return p.partnerType?.toLowerCase().includes('training');
    if (subTab === 'employment-partners') return p.partnerType?.toLowerCase().includes('employment') || p.partnerType?.toLowerCase().includes('employed');
    if (subTab === 'ngo-partners') return p.partnerType?.toLowerCase().includes('ngo');
    if (subTab === 'gov-partners') return p.partnerType?.toLowerCase().includes('gov') || p.partnerType?.toLowerCase().includes('ssc') || p.partnerType?.toLowerCase().includes('institutional');
    return true; // all-partners
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Partner Organizations & Alliances</h1>
          <p className="text-xs text-slate-500">CSR sponsors, Sector Skill Councils (SSCs), corporate employers & NGO networks</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>+ Add Partner</span>
        </button>
      </div>

      {/* Filter Dropdown & Quick Sub-Nav */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Filter Partners:</span>
          <select
            value={subTab}
            onChange={(e) => setSubTab(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#123B5D] outline-none cursor-pointer"
          >
            <option value="all-partners">🌐 All Partners ({partners.length})</option>
            <option value="csr-partners">🏛️ CSR Partners</option>
            <option value="corporate-partners">🏙️ Corporate Partners</option>
            <option value="training-partners">🎓 Training Partners</option>
            <option value="employment-partners">💼 Employment Partners</option>
            <option value="ngo-partners">🤝 NGO Partners</option>
            <option value="gov-partners">🏛️ Gov / Institutional</option>
            <option value="partner-applications">📝 Partner Applications ({partners.filter(p => p.status?.toLowerCase() === 'pending').length})</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredPartners.length}</span> records
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 uppercase tracking-wider font-bold">
                <th className="p-4">Organization</th>
                <th className="p-4">Contact Person & Email</th>
                <th className="p-4">Partner Category</th>
                <th className="p-4">Location</th>
                <th className="p-4">Date Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4">Impact / Focus Area</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No Partners Found</p>
                      <p className="text-xs text-slate-500">Partner applications submitted via the public website will appear here in real-time.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((prt) => (
                  <tr key={prt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-3">
                        {prt.logo ? (
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            <img src={prt.logo} alt={prt.orgName} className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{prt.orgName}</div>
                          <div className="text-[10px] text-blue-600 font-mono">{prt.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-900">
                      <div className="font-semibold text-slate-900">{prt.contactPerson}</div>
                      <div className="text-[10px] text-slate-500">{prt.email}</div>
                      {prt.phone && <div className="text-[10px] text-slate-500">{prt.phone}</div>}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold text-[10px]">
                        {prt.partnerType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{prt.location}</td>
                    <td className="p-4 text-slate-600">{prt.dateJoined}</td>
                    <td className="p-4">
                      <StatusBadge status={prt.status} />
                    </td>
                    <td className="p-4 font-bold text-emerald-700">
                      {prt.grantAmount || prt.interests || prt.notes || (prt.hiredStudents ? `${prt.hiredStudents}+ Placements` : 'MoU Active')}
                    </td>
                    
                    {/* Action 3-dot Popover Menu */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <ActionPopover
                        items={[
                          { label: 'View Details', icon: Eye, onClick: () => setViewingPartner(prt) },
                          { label: 'Edit Partner', icon: Edit, onClick: () => handleOpenEdit(prt) },
                          { divider: true },
                          { label: 'Approve & Verify Partner', icon: CheckCircle2, onClick: () => handleApprovePartner(prt) },
                          { label: 'Mark as Pending', icon: Clock, onClick: () => handlePendingPartner(prt) },
                          { divider: true },
                          { label: 'Delete Partner', icon: Trash2, danger: true, onClick: () => handleDeletePartner(prt) }
                        ]}
                      />
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">{viewingPartner.orgName}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {viewingPartner.id} • Joined: {viewingPartner.dateJoined}</p>
              </div>
              <button onClick={() => setViewingPartner(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Contact Person:</span>
                <span className="font-bold text-slate-900">{viewingPartner.contactPerson}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Email Address:</span>
                <span className="font-bold text-slate-900">{viewingPartner.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Phone Number:</span>
                <span className="font-bold text-slate-900">{viewingPartner.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-purple-700">{viewingPartner.partnerType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-bold text-slate-900">{viewingPartner.location}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Status:</span>
                <StatusBadge status={viewingPartner.status} />
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">Interests / Notes:</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
                  {viewingPartner.notes || viewingPartner.interests || viewingPartner.grantAmount || 'No additional notes'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              {viewingPartner.status?.toLowerCase() === 'pending' && (
                <button
                  onClick={() => {
                    handleApprovePartner(viewingPartner);
                    setViewingPartner(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Approve & Verify Partner
                </button>
              )}
              <button
                onClick={() => setViewingPartner(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PARTNER MODAL */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-serif">Edit Partner Information</h3>
              <button onClick={() => setEditingPartner(null)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.orgName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, orgName: e.target.value }))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Contact Person</label>
                  <input
                    type="text"
                    value={editForm.contactPerson}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Partner Type</label>
                  <select
                    value={editForm.partnerType}
                    onChange={(e) => setEditForm(prev => ({ ...prev, partnerType: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="CSR Partner">CSR Partner</option>
                    <option value="Corporate Partner">Corporate Partner</option>
                    <option value="Training Partner">Training Partner</option>
                    <option value="Employment Partner">Employment Partner</option>
                    <option value="NGO Partner">NGO Partner</option>
                    <option value="Government / Institutional">Government / Institutional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Verification Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Active">Active / Approved</option>
                    <option value="Pending">Pending Verification</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Interests / Focus Area / Notes</label>
                <textarea
                  rows={2}
                  value={editForm.interests}
                  onChange={(e) => setEditForm(prev => ({ ...prev, interests: e.target.value }))}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-slate-900 shadow-2xl">
            <h3 className="text-lg font-bold font-serif">Add New Partner Organization</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Organization Name *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Healthcare Sector Skill Council"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Dr. K.V. Subbarao"
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Partner Type</label>
                <select
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="CSR Partner">CSR Partner</option>
                  <option value="Corporate Partner">Corporate Partner</option>
                  <option value="Training Partner">Training Partner</option>
                  <option value="Employment Partner">Employment Partner</option>
                  <option value="NGO Partner">NGO Partner</option>
                  <option value="Government / Institutional">Government / Institutional</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Save Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
