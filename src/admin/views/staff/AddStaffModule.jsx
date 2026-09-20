import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Calendar, Upload, CheckCircle2, Shield, Plus, X } from 'lucide-react';
import { saveToFirestore } from '../../../utils/firebaseSave';

export default function AddStaffModule({ 
  departments = [], 
  staffList = [], 
  setStaffList, 
  showToast, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    parentName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    
    // Contact Details
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Odisha',
    pinCode: '',
    emergencyContact: '+91 9416362914',

    // Employment Details
    employeeId: '',
    role: '',
    department: departments[0]?.departmentName || 'Mobilization',
    joinDate: new Date().toISOString().split('T')[0],
    employmentType: 'Full Time',
    location: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Photo Upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size exceeds the 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.role.trim() || !formData.department.trim()) {
      setError('Please fill in all required fields: Full Name, Email, Mobile Number, Designation, and Department.');
      return;
    }

    setLoading(true);

    // Auto-generate Employee ID if blank
    const generatedId = formData.employeeId.trim() || `STF-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newStaffRecord = {
      id: generatedId,
      employeeId: generatedId,
      name: formData.name.trim(),
      parentName: formData.parentName.trim(),
      dob: formData.dob,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pinCode: formData.pinCode.trim(),
      emergencyContact: formData.emergencyContact.trim() || '+91 9416362914',

      role: formData.role.trim(),
      designation: formData.role.trim(),
      department: formData.department,
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
      joiningDate: formData.joinDate || new Date().toISOString().split('T')[0],
      employmentType: formData.employmentType,
      location: formData.location.trim() || 'Odisha Center',
      
      avatar: photoPreview || '/image/logo.png',
      photoDoc: photoPreview || '',
      status: 'Active',
      approvalStatus: 'Approved',
      registeredAt: new Date().toISOString()
    };

    try {
      await saveToFirestore('staff', newStaffRecord, 'lvs_new_staff');

      if (setStaffList) {
        setStaffList(prev => {
          const exists = prev.some(s => s.id === generatedId || s.email === newStaffRecord.email);
          if (exists) return prev;
          return [newStaffRecord, ...prev];
        });
      }

      setLoading(false);
      if (showToast) showToast(`Staff member "${newStaffRecord.name}" (${generatedId}) created & saved to Firebase!`, 'success');
      
      // Reset form
      setFormData({
        name: '', parentName: '', dob: '', gender: 'Male', bloodGroup: 'O+',
        phone: '', email: '', address: '', city: '', state: 'Odisha', pinCode: '', emergencyContact: '+91 9416362914',
        employeeId: '', role: '', department: departments[0]?.departmentName || 'Mobilization',
        joinDate: new Date().toISOString().split('T')[0], employmentType: 'Full Time', location: ''
      });
      setPhotoPreview(null);

      if (onSuccess) onSuccess();

    } catch (err) {
      console.warn("Error creating staff record:", err);
      setLoading(false);
      setError("Failed to save staff record to Firebase. Please try again.");
    }
  };

  // Department options from dynamic Firestore departments prop + defaults
  const deptOptions = Array.from(new Set([
    'Mobilization',
    'Training',
    'Placement & Livelihood',
    'Operations',
    'Finance',
    'Management',
    'IT & Support',
    ...departments.map(d => d.departmentName).filter(Boolean)
  ]));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto space-y-6">
      
      {/* Form Title Banner */}
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-serif">Add New Staff Member</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in personal, contact, and employment details. Staff will immediately sync across all portal modules and Firebase.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-[#047857] text-xs font-bold rounded-full border border-emerald-200">
          Firebase Direct Sync
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 animate-ping" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. PERSONAL DETAILS SECTION */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>1. Personal Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Staff Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter Staff Full Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Father / Mother Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Father's / Mother's Name</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="Enter Parent Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Date of Birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Photo Upload */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Profile Photo</label>
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 border border-slate-200 rounded-xl">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xs shrink-0">
                    Photo
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-2xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-2xs file:font-bold file:bg-emerald-100 file:text-[#047857] hover:file:bg-emerald-200 cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 2. CONTACT DETAILS SECTION */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>2. Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter 10-digit Mobile Number"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter Email Address"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Emergency Contact Number</label>
              <input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="+91 9416362914"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Address */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-800">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter Full Address"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter City Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Odisha"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* PIN Code */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">PIN Code</label>
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                placeholder="Enter 6-digit PIN Code"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

          </div>
        </div>

        {/* 3. EMPLOYMENT DETAILS SECTION */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span>3. Employment Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Employee ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Employee ID (Optional - Auto Generated if blank)</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="e.g. STF-2026-101"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Designation / Role */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Designation / Role *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Center Coordinator / Senior Trainer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Department Selector (Dynamic from Firestore) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              >
                {deptOptions.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Joining Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Date of Joining</label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            {/* Employment Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contractual">Contractual</option>
                <option value="Trainee">Trainee</option>
              </select>
            </div>

            {/* Work Location */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">Work Location / Office</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bhubaneswar Center / Head Office"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

          </div>
        </div>

        {/* Submit Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Staff & Sync Modules</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
