import React, { useState } from 'react';
import { 
  Building, Plus, Search, Edit, Trash2, Shield, 
  Users, CheckCircle2, XCircle, X, AlertTriangle 
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

  // Form State
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    departmentHead: '',
    description: '',
    status: 'Active'
  });

  // Default fallback departments if none exist in database yet
  const defaultDepartments = [
    { departmentName: 'Mobilization', departmentCode: 'MOB', departmentHead: 'Sunita Sahu', description: 'Field mobilization & community outreach', status: 'Active' },
    { departmentName: 'Training', departmentCode: 'TRN', departmentHead: 'Priya Ranjita', description: 'NQR skill development & vocational training', status: 'Active' },
    { departmentName: 'Placement & Livelihood', departmentCode: 'PLC', departmentHead: 'Minati Nayak', description: 'Industry placement & wage employment', status: 'Active' },
    { departmentName: 'Operations', departmentCode: 'OPS', departmentHead: 'Rasmita Behera', description: 'Center operations & logistics', status: 'Active' },
    { departmentName: 'Finance', departmentCode: 'FIN', departmentHead: 'Kalyani Swain', description: 'Finance, accounts & 80G compliance', status: 'Active' },
    { departmentName: 'Management', departmentCode: 'MGT', departmentHead: 'Executive Director', description: 'Executive leadership & strategy', status: 'Active' },
    { departmentName: 'IT & Support', departmentCode: 'IT', departmentHead: 'IT Officer', description: 'IT infrastructure & portal management', status: 'Active' }
  ];

  const allDepts = departments.length > 0 ? departments : defaultDepartments;

  // Search filter
  const filteredDepts = allDepts.filter(d => {
    const term = searchQuery.toLowerCase();
    return (d.departmentName || '').toLowerCase().includes(term) || 
           (d.departmentCode || '').toLowerCase().includes(term) ||
           (d.departmentHead || '').toLowerCase().includes(term);
  });

  // Count staff assigned to a department
  const getDeptStaffStats = (deptName) => {
    const assignedStaff = staffList.filter(s => s.department === deptName);
    const totalStaff = assignedStaff.length;
    const activeStaff = assignedStaff.filter(s => s.status === 'Active' || s.approvalStatus === 'Approved').length;
    return { totalStaff, activeStaff, assignedStaff };
  };

  // Submit Add Department
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentName.trim() || !formData.departmentCode.trim()) {
      if (showToast) showToast('Please enter Department Name and Code.', 'error');
      return;
    }

    setLoading(true);
    const newDept = {
      departmentId: `DEPT-${formData.departmentCode.trim().toUpperCase()}`,
      departmentName: formData.departmentName.trim(),
      departmentCode: formData.departmentCode.trim().toUpperCase(),
      departmentHead: formData.departmentHead.trim() || 'Department Head',
      description: formData.description.trim(),
      status: formData.status,
      createdAt: new Date().toISOString()
    };

    try {
      const ref = await addDoc(collection(db, "departments"), {
        ...newDept,
        createdAt: serverTimestamp()
      });
      newDept.firestoreId = ref.id;

      if (setDepartments) {
        setDepartments(prev => [newDept, ...prev]);
      }

      setLoading(false);
      setShowAddModal(false);
      setFormData({ departmentName: '', departmentCode: '', departmentHead: '', description: '', status: 'Active' });

      if (showToast) showToast(`Department "${newDept.departmentName}" created & available in Add Staff dropdown!`, 'success');

    } catch (err) {
      console.warn("Firestore add dept notice:", err);
      setLoading(false);
    }
  };

  // Submit Edit Department
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDept || !editingDept.departmentName) return;

    const updated = { ...editingDept };

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
    if (showToast) showToast(`Department "${updated.departmentName}" details updated!`, 'success');
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
        await updateDoc(doc(db, "departments", dept.firestoreId), { status: nextStatus });
      } catch (err) {
        console.warn("Firestore status notice:", err);
      }
    }

    if (showToast) showToast(`Department "${dept.departmentName}" is now ${nextStatus}.`, 'info');
  };

  // Delete Department with Guard Against Assigned Staff
  const handleDeleteClick = (dept) => {
    const stats = getDeptStaffStats(dept.departmentName);
    if (stats.totalStaff > 0) {
      setDeleteWarning({
        deptName: dept.departmentName,
        count: stats.totalStaff,
        staffNames: stats.assignedStaff.map(s => s.name).join(', ')
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete department "${dept.departmentName}"?`)) {
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
      if (showToast) showToast(`Department "${dept.departmentName}" deleted.`, 'info');
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
          <h2 className="text-xl font-bold text-slate-800 font-serif">Organization Departments & Staff Assignment</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add, edit, or deactivate departments. Created departments automatically sync with the Add Staff form.
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
                <th className="p-3.5">Total Staff</th>
                <th className="p-3.5">Active Staff</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDepts.map(dept => {
                const stats = getDeptStaffStats(dept.departmentName);
                const isActive = dept.status === 'Active';

                return (
                  <tr key={dept.departmentCode || dept.firestoreId} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Dept Name */}
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{dept.departmentName}</span>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md">
                        {dept.departmentCode}
                      </span>
                    </td>

                    {/* Head */}
                    <td className="p-3.5 font-bold text-emerald-800">
                      {dept.departmentHead || 'Department Head'}
                    </td>

                    {/* Total Staff */}
                    <td className="p-3.5 font-black text-slate-900">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                        {stats.totalStaff} Staff
                      </span>
                    </td>

                    {/* Active Staff */}
                    <td className="p-3.5 font-black text-emerald-700">
                      {stats.activeStaff} Active
                    </td>

                    {/* Description */}
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">
                      {dept.description || 'N/A'}
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 relative my-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900 font-serif">Add New Department</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  placeholder="e.g. IT & Software Development"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Dept Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.departmentCode}
                    onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                    placeholder="e.g. IT"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Department Head</label>
                <input
                  type="text"
                  value={formData.departmentHead}
                  onChange={(e) => setFormData({ ...formData, departmentHead: e.target.value })}
                  placeholder="e.g. Chief Technology Officer"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department scope and responsibilities..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Create Department</span>
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
                  value={editingDept.departmentName || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, departmentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Dept Code *</label>
                  <input
                    type="text"
                    required
                    value={editingDept.departmentCode || ''}
                    onChange={(e) => setEditingDept({ ...editingDept, departmentCode: e.target.value.toUpperCase() })}
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
                <label className="font-bold text-slate-800">Department Head</label>
                <input
                  type="text"
                  value={editingDept.departmentHead || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, departmentHead: e.target.value })}
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
