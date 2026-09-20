import React, { useState } from 'react';
import { 
  Building, Plus, Search, Edit, Trash2, Shield, 
  Users, CheckCircle2, XCircle, X, AlertTriangle, User 
} from 'lucide-react';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from '../../../firebase';

export default function DepartmentModule({ 
  departments = [], 
  setDepartments, 
  staffList = [], 
  showToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(null);

  // Form State for Add Department
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    description: '',
    status: 'Active',
    departmentHeadId: '',
    departmentHeadName: '',
    departmentHeadDesignation: '',
    departmentHeadEmail: '',
    departmentHeadContact: ''
  });

  // Handle staff selection for Department Head
  const handleHeadStaffSelect = (staffId) => {
    if (!staffId) {
      setFormData(prev => ({
        ...prev,
        departmentHeadId: '',
        departmentHeadName: '',
        departmentHeadDesignation: '',
        departmentHeadEmail: '',
        departmentHeadContact: ''
      }));
      return;
    }

    const selectedStaff = staffList.find(s => (s.id || s.employeeId) === staffId || s.firestoreId === staffId);
    if (selectedStaff) {
      setFormData(prev => ({
        ...prev,
        departmentHeadId: selectedStaff.id || selectedStaff.employeeId || '',
        departmentHeadName: selectedStaff.name || '',
        departmentHeadDesignation: selectedStaff.role || selectedStaff.designation || '',
        departmentHeadEmail: selectedStaff.email || '',
        departmentHeadContact: selectedStaff.phone || ''
      }));
    }
  };

  // Search filter
  const filteredDepts = departments.filter(d => {
    const term = searchQuery.toLowerCase();
    const nameMatch = (d.departmentName || d.name || '').toLowerCase().includes(term);
    const codeMatch = (d.departmentCode || d.code || '').toLowerCase().includes(term);
    const headMatch = (d.departmentHeadName || d.departmentHead || '').toLowerCase().includes(term);
    return nameMatch || codeMatch || headMatch;
  });

  // Count staff assigned to a department
  const getDeptStaffStats = (deptName) => {
    const assignedStaff = staffList.filter(s => (s.department || '').toLowerCase() === (deptName || '').toLowerCase());
    const totalStaff = assignedStaff.length;
    const activeStaff = assignedStaff.filter(s => s.status === 'Active' || s.approvalStatus === 'Approved').length;
    return { totalStaff, activeStaff, assignedStaff };
  };

  // Submit Add Department
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentName.trim() || !formData.departmentCode.trim()) {
      if (showToast) showToast('Please fill in Department Name and Department Code.', 'error');
      return;
    }

    setLoading(true);
    const generatedDeptId = `DEPT-${formData.departmentCode.trim().toUpperCase()}`;

    const newDeptRecord = {
      departmentId: generatedDeptId,
      departmentName: formData.departmentName.trim(),
      name: formData.departmentName.trim(),
      departmentCode: formData.departmentCode.trim().toUpperCase(),
      code: formData.departmentCode.trim().toUpperCase(),
      description: formData.description.trim(),
      status: formData.status,
      
      departmentHeadId: formData.departmentHeadId,
      departmentHeadName: formData.departmentHeadName.trim() || 'Unassigned',
      departmentHead: formData.departmentHeadName.trim() || 'Unassigned',
      departmentHeadDesignation: formData.departmentHeadDesignation,
      departmentHeadEmail: formData.departmentHeadEmail,
      departmentHeadContact: formData.departmentHeadContact,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const ref = await addDoc(collection(db, "departments"), {
        ...newDeptRecord,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      newDeptRecord.firestoreId = ref.id;

      if (setDepartments) {
        setDepartments(prev => [newDeptRecord, ...prev]);
      }

      setLoading(false);
      setShowAddModal(false);
      
      // Reset Form
      setFormData({
        departmentName: '', departmentCode: '', description: '', status: 'Active',
        departmentHeadId: '', departmentHeadName: '', departmentHeadDesignation: '',
        departmentHeadEmail: '', departmentHeadContact: ''
      });

      if (showToast) showToast(`Department "${newDeptRecord.departmentName}" created & available in Add Staff dropdown!`, 'success');

    } catch (err) {
      console.warn("Firestore add department notice:", err);
      setLoading(false);
      if (setDepartments) {
        setDepartments(prev => [newDeptRecord, ...prev]);
      }
      setShowAddModal(false);
    }
  };

  // Submit Edit Department
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDept || !editingDept.departmentName) return;

    const updated = { 
      ...editingDept,
      updatedAt: new Date().toISOString()
    };

    if (setDepartments) {
      setDepartments(prev => prev.map(d => (d.departmentCode === updated.departmentCode || (d.firestoreId && d.firestoreId === updated.firestoreId)) ? updated : d));
    }

    if (updated.firestoreId) {
      try {
        await updateDoc(doc(db, "departments", updated.firestoreId), updated);
      } catch (err) {
        console.warn("Firestore update dept notice:", err);
      }
    }

    setEditingDept(null);
    if (showToast) showToast(`Department "${updated.departmentName}" updated!`, 'success');
  };

  // Toggle Activate / Deactivate
  const handleToggleStatus = async (dept) => {
    const nextStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...dept, status: nextStatus };

    if (setDepartments) {
      setDepartments(prev => prev.map(d => (d.departmentCode === dept.departmentCode || (d.firestoreId && d.firestoreId === dept.firestoreId)) ? updated : d));
    }

    if (dept.firestoreId) {
      try {
        await updateDoc(doc(db, "departments", dept.firestoreId), { status: nextStatus, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn("Firestore status notice:", err);
      }
    }

    if (showToast) showToast(`Department "${dept.departmentName || dept.name}" is now ${nextStatus}.`, 'info');
  };

  // Delete Department with Guard Against Assigned Staff
  const handleDeleteClick = (dept) => {
    const deptName = dept.departmentName || dept.name;
    const stats = getDeptStaffStats(deptName);
    if (stats.totalStaff > 0) {
      setDeleteWarning({
        deptName: deptName,
        count: stats.totalStaff,
        staffNames: stats.assignedStaff.map(s => s.name).join(', ')
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete department "${deptName}"?`)) {
      if (setDepartments) {
        setDepartments(prev => prev.filter(d => d.departmentCode !== dept.departmentCode && d.firestoreId !== dept.firestoreId));
      }
      if (dept.firestoreId) {
        try {
          deleteDoc(doc(db, "departments", dept.firestoreId));
        } catch (err) {
          console.warn("Firestore delete dept notice:", err);
        }
      }
      if (showToast) showToast(`Department "${deptName}" deleted.`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>Department Structure Management</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-serif">Organization Departments & Head Assignment</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add or manage departments. Created departments automatically sync with the Staff Registration form.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Department</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search department name, code, head..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total Departments: <strong className="text-slate-900">{filteredDepts.length}</strong>
        </span>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Department Name</th>
                <th className="p-3.5">Dept Code</th>
                <th className="p-3.5">Department Head</th>
                <th className="p-3.5">Head Designation</th>
                <th className="p-3.5">Head Contact</th>
                <th className="p-3.5">Assigned Staff</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 font-serif text-sm">No Departments Found</p>
                    <p className="text-2xs text-slate-500 mt-1">
                      No departments created yet in Firebase Firestore. Click <strong>"+ Add Department"</strong> above to create your first department.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDepts.map(dept => {
                  const deptName = dept.departmentName || dept.name;
                  const deptCode = dept.departmentCode || dept.code;
                  const headName = dept.departmentHeadName || dept.departmentHead || 'Unassigned';
                  const headDesignation = dept.departmentHeadDesignation || '-';
                  const headContact = dept.departmentHeadContact || dept.departmentHeadEmail || '-';
                  const stats = getDeptStaffStats(deptName);
                  const isActive = dept.status === 'Active';

                  return (
                    <tr key={deptCode || dept.firestoreId || dept.departmentId} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Dept Name */}
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{deptName}</span>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md">
                          {deptCode}
                        </span>
                      </td>

                      {/* Head */}
                      <td className="p-3.5 font-bold text-emerald-800">
                        {headName}
                      </td>

                      {/* Head Designation */}
                      <td className="p-3.5 text-slate-600 font-semibold">
                        {headDesignation}
                      </td>

                      {/* Head Contact */}
                      <td className="p-3.5 text-slate-600 font-mono text-2xs">
                        {headContact}
                      </td>

                      {/* Assigned Staff */}
                      <td className="p-3.5 font-black text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                          {stats.totalStaff} Staff ({stats.activeStaff} Active)
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(dept)}
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] cursor-pointer transition-all ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isActive ? '● Active' : '✕ Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingDept({ ...dept })}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-200"
                            title="Edit Department"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(dept)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200"
                            title="Delete Department"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Department Complete Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Add New Department</h3>
                <p className="text-2xs text-slate-500">Created department will immediately sync with Add Staff dropdown.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              {/* SECTION 1: DEPARTMENT INFORMATION */}
              <div className="space-y-3">
                <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-2xs border-b border-slate-100 pb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Department Information</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Department Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.departmentName}
                      onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                      placeholder="e.g. Human Resources"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Department Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.departmentCode}
                      onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                      placeholder="e.g. HR"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="font-bold text-slate-800">Department Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter department scope and responsibilities..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Department Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* SECTION 2: DEPARTMENT HEAD */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-2xs border-b border-slate-100 pb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Department Head</span>
                </h4>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Select Department Head from Staff List</label>
                  <select
                    value={formData.departmentHeadId}
                    onChange={(e) => handleHeadStaffSelect(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
                  >
                    <option value="">-- Select Existing Staff Member (Optional) --</option>
                    {staffList.map(s => (
                      <option key={s.id || s.employeeId || s.firestoreId} value={s.id || s.employeeId || s.firestoreId}>
                        {s.name} ({s.id || s.employeeId}) - {s.role || s.designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Head Full Name</label>
                    <input
                      type="text"
                      value={formData.departmentHeadName}
                      onChange={(e) => setFormData({ ...formData, departmentHeadName: e.target.value })}
                      placeholder="Enter Head Name"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Head Designation</label>
                    <input
                      type="text"
                      value={formData.departmentHeadDesignation}
                      onChange={(e) => setFormData({ ...formData, departmentHeadDesignation: e.target.value })}
                      placeholder="e.g. HR Director"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Head Email Address</label>
                    <input
                      type="email"
                      value={formData.departmentHeadEmail}
                      onChange={(e) => setFormData({ ...formData, departmentHeadEmail: e.target.value })}
                      placeholder="head@lifevisionsociety.org"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Head Contact Number</label>
                    <input
                      type="text"
                      value={formData.departmentHeadContact}
                      onChange={(e) => setFormData({ ...formData, departmentHeadContact: e.target.value })}
                      placeholder="+91 9416362914"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Controls */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Add Department / Create Department</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Edit Department</h3>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Department Name *</label>
                <input
                  type="text"
                  required
                  value={editingDept.departmentName || editingDept.name || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, departmentName: e.target.value, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Dept Code *</label>
                  <input
                    type="text"
                    required
                    value={editingDept.departmentCode || editingDept.code || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, departmentCode: e.target.value.toUpperCase(), code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Status</label>
                  <select
                    value={editingDept.status || 'Active'}
                    onChange={(e) => setEditingDept({ ...editingDept, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Department Head Name</label>
                <input
                  type="text"
                  value={editingDept.departmentHeadName || editingDept.departmentHead || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, departmentHeadName: e.target.value, departmentHead: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Description</label>
                <textarea
                  rows={2}
                  value={editingDept.description || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Update Department
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Guard Warning Modal */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-rose-200 shadow-2xl p-6 space-y-4 relative my-auto text-xs">
            <div className="flex items-center space-x-2 text-rose-700 font-bold">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <h3 className="text-base font-serif text-slate-900">Cannot Delete Department</h3>
            </div>

            <p className="text-slate-600 leading-relaxed font-medium">
              Department <strong>"{deleteWarning.deptName}"</strong> cannot be deleted because <strong>{deleteWarning.count} active staff member(s)</strong> are assigned to it:
            </p>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 font-bold text-rose-900 text-2xs">
              Assigned Staff: {deleteWarning.staffNames}
            </div>

            <p className="text-2xs text-slate-500 font-medium">
              Please reassign these staff members to another department first before attempting to delete this department.
            </p>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setDeleteWarning(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
