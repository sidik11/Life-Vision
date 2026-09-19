import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { 
  Eye, GraduationCap, CheckCircle2, Award, Briefcase, 
  Calendar, Phone, MapPin, X, Plus, Search, Filter, Download,
  User, Mail, FileText, Check, AlertCircle, Edit, Trash2
} from 'lucide-react';

export default function StudentsView({ students = [], setStudents, showToast, filter = 'all' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileTab, setProfileTab] = useState('overview'); // overview, attendance, assessment, certificate, placement
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    guardianName: '',
    gender: 'Female',
    dob: '',
    category: 'General',
    aadhar: '',
    phone: '',
    email: '',
    address: '',
    district: 'Bhubaneswar',
    qualification: '12th Pass',
    course: 'Tailoring & Stitching',
    center: 'Bhubaneswar LVS Skill Center',
    batch: 'BATCH-2026-T1',
    status: 'Enrolled'
  });

  const filteredStudents = useMemo(() => {
    return (students || []).filter(stu => {
      if (!stu) return false;
      const sName = String(stu.name || '').toLowerCase();
      const sId = String(stu.id || '').toLowerCase();
      const sPhone = String(stu.phone || '');
      const sCourse = String(stu.course || '');
      const sStatus = String(stu.status || 'Enrolled');

      const matchesSearch = sName.includes(searchTerm.toLowerCase()) || sId.includes(searchTerm.toLowerCase()) || sPhone.includes(searchTerm);
      const matchesStatus = selectedStatusFilter === 'All' || sStatus === selectedStatusFilter;
      const matchesCourse = selectedCourseFilter === 'All' || sCourse.includes(selectedCourseFilter);

      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [students, searchTerm, selectedStatusFilter, selectedCourseFilter]);

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.phone) {
      if (showToast) showToast('Please fill in Student Name and Contact Number.', 'error');
      return;
    }

    const nextIdNum = String(students.length + 1).padStart(4, '0');
    const created = {
      id: `LVS-STUDENT-2026-${nextIdNum}`,
      photo: '/success_story.jpg',
      ...newStudent,
      attendance: '100%',
      assessmentScore: 'Pending',
      certificateStatus: 'In Progress',
      placementStatus: 'Enrolled',
      enrollmentDate: new Date().toISOString().split('T')[0]
    };

    if (setStudents) {
      setStudents(prev => [created, ...prev]);
    }
    setShowAddModal(false);
    setNewStudent({
      name: '',
      guardianName: '',
      gender: 'Female',
      dob: '',
      category: 'General',
      aadhar: '',
      phone: '',
      email: '',
      address: '',
      district: 'Bhubaneswar',
      qualification: '12th Pass',
      course: 'Tailoring & Stitching',
      center: 'Bhubaneswar LVS Skill Center',
      batch: 'BATCH-2026-T1',
      status: 'Enrolled'
    });
    if (showToast) showToast(`Student ${created.name} (${created.id}) enrolled successfully!`, 'success');
  };

  const handleStatusUpdate = (studentId, newStatus) => {
    if (setStudents) {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
    }
    if (showToast) showToast(`Updated student status to "${newStatus}"`, 'info');
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm(`Are you sure you want to remove student ${studentId}?`)) {
      if (setStudents) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
      }
      if (showToast) showToast(`Student ${studentId} deleted successfully.`, 'info');
    }
  };

  const handleExportCSV = () => {
    if (showToast) showToast('Exported student roster to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Student Management</h1>
          <p className="text-xs text-slate-500">Enrolled trainees, attendance records, assessment results & certification pipeline</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Roster</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-pink-700 hover:bg-pink-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, ID or phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="All">All Statuses</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Certified">Certified</option>
            <option value="Placed">Placed</option>
            <option value="Dropped">Dropped</option>
          </select>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="All">All Courses</option>
            <option value="Tailoring">Tailoring & Stitching</option>
            <option value="Beautician">Beautician & Wellness</option>
            <option value="Agriculture">Agriculture & Farming</option>
            <option value="Healthcare">Healthcare & Caregiving</option>
            <option value="Food & Beverages">Food & Beverages</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase tracking-wider font-bold">
                <th className="p-4">Student ID</th>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Course</th>
                <th className="p-4">Batch Code</th>
                <th className="p-4">Training Center</th>
                <th className="p-4">Attendance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-pink-700">{stu.id}</td>
                    <td className="p-4 font-semibold text-slate-900">
                      <div className="flex items-center space-x-3">
                        <img src={stu.photo || '/success_story.jpg'} alt={stu.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{stu.name}</div>
                          <div className="text-[10px] text-slate-500">{stu.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{stu.course}</td>
                    <td className="p-4 font-mono text-slate-700">{stu.batch}</td>
                    <td className="p-4 text-slate-600">{stu.center}</td>
                    <td className="p-4 font-extrabold text-emerald-700">{stu.attendance || '95%'}</td>
                    <td className="p-4">
                      <StatusBadge status={stu.status || 'Active'} />
                    </td>
                    <td className="p-4 text-center">
                      <ActionPopover 
                        actions={[
                          {
                            label: 'View Profile',
                            icon: Eye,
                            onClick: () => {
                              setSelectedStudent(stu);
                              setProfileTab('overview');
                            }
                          },
                          {
                            label: 'Mark as Passed',
                            icon: CheckCircle2,
                            onClick: () => handleStatusUpdate(stu.id, 'Passed')
                          },
                          {
                            label: 'Mark as Placed',
                            icon: Briefcase,
                            onClick: () => handleStatusUpdate(stu.id, 'Placed')
                          },
                          {
                            label: 'Delete Record',
                            icon: Trash2,
                            danger: true,
                            onClick: () => handleDeleteStudent(stu.id)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    No student records found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6 my-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Enroll New Student</h3>
                <p className="text-xs text-slate-500">Add student details manually to training management registry</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    placeholder="e.g. Sunita Sahu"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Father / Guardian Name</label>
                  <input
                    type="text"
                    value={newStudent.guardianName}
                    onChange={(e) => setNewStudent({...newStudent, guardianName: e.target.value})}
                    placeholder="e.g. Ramesh Sahu"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    placeholder="+91 98610 12345"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    placeholder="sunita@gmail.com"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Course / Program</label>
                  <select
                    value={newStudent.course}
                    onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Tailoring & Stitching">Tailoring & Stitching</option>
                    <option value="Beautician & Wellness">Beautician & Wellness</option>
                    <option value="Agriculture & Farming">Agriculture & Farming</option>
                    <option value="Healthcare & Caregiving">Healthcare & Caregiving</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Training Centre</label>
                  <select
                    value={newStudent.center}
                    onChange={(e) => setNewStudent({...newStudent, center: e.target.value})}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Bhubaneswar LVS Skill Center">Bhubaneswar LVS Skill Center</option>
                    <option value="Cuttack Main Skill Hub">Cuttack Main Skill Hub</option>
                    <option value="Puri Rural Skill Hub">Puri Rural Skill Hub</option>
                    <option value="Khordha Vocational Hub">Khordha Vocational Hub</option>
                    <option value="Ganjam Community Care Hub">Ganjam Community Care Hub</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Assigned Batch</label>
                  <input
                    type="text"
                    value={newStudent.batch}
                    onChange={(e) => setNewStudent({...newStudent, batch: e.target.value})}
                    placeholder="BATCH-2026-T1"
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={newStudent.status}
                    onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Enrolled">Enrolled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Passed">Passed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-700 hover:bg-pink-800 text-white font-bold rounded-xl shadow-md"
                >
                  Save & Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabbed Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto space-y-0 text-slate-900">
            
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={selectedStudent.photo || '/success_story.jpg'} alt={selectedStudent.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-300" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-serif">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedStudent.id} • Phone: {selectedStudent.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Sub Tabs */}
            <div className="border-b border-slate-200 bg-slate-100 px-6 flex space-x-4 text-xs font-bold">
              <button
                onClick={() => setProfileTab('overview')}
                className={`py-3 border-b-2 cursor-pointer ${profileTab === 'overview' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-600'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setProfileTab('attendance')}
                className={`py-3 border-b-2 cursor-pointer ${profileTab === 'attendance' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-600'}`}
              >
                Attendance History
              </button>
              <button
                onClick={() => setProfileTab('assessment')}
                className={`py-3 border-b-2 cursor-pointer ${profileTab === 'assessment' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-600'}`}
              >
                Assessment Records
              </button>
              <button
                onClick={() => setProfileTab('certificate')}
                className={`py-3 border-b-2 cursor-pointer ${profileTab === 'certificate' ? 'border-pink-600 text-pink-700' : 'border-transparent text-slate-600'}`}
              >
                Certificate Status
              </button>
            </div>

            {/* Body Content */}
            <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto text-xs">
              {profileTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Academic Details</span>
                      <div className="text-xs space-y-1 text-slate-700">
                        <p><strong>Course:</strong> {selectedStudent.course}</p>
                        <p><strong>Batch:</strong> {selectedStudent.batch}</p>
                        <p><strong>Centre:</strong> {selectedStudent.center}</p>
                        <p><strong>Status:</strong> <StatusBadge status={selectedStudent.status} /></p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Contact & Demographic</span>
                      <div className="text-xs space-y-1 text-slate-700">
                        <p><strong>Mobile:</strong> {selectedStudent.phone}</p>
                        <p><strong>Email:</strong> {selectedStudent.email || 'N/A'}</p>
                        <p><strong>Address:</strong> {selectedStudent.address || 'Odisha'}</p>
                        <p><strong>Enrollment Date:</strong> {selectedStudent.enrollmentDate || '2026-08-01'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'attendance' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 font-bold text-xs">Overall Attendance Percentage</span>
                      <p className="text-2xl font-black text-emerald-700">{selectedStudent.attendance || '96%'}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-200 text-emerald-800 font-bold rounded-lg text-xs">Regular</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Attendance records automatically calculated from daily batch logs.</p>
                </div>
              )}

              {profileTab === 'assessment' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Exam Score & Result</span>
                  <p className="text-lg font-bold text-slate-900">{selectedStudent.assessmentScore || '94/100 (Pass)'}</p>
                  <p className="text-slate-600">Theory Marks: 46/50 • Practical Marks: 48/50</p>
                </div>
              )}

              {profileTab === 'certificate' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <span className="text-amber-900 font-bold uppercase text-[10px]">Certificate Status</span>
                  <p className="text-base font-bold text-amber-900">{selectedStudent.certificateStatus || 'Issued'}</p>
                  <p className="text-amber-800 text-[11px]">Student has satisfied all 6 eligibility criteria for certification.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button onClick={() => setSelectedStudent(null)} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs">
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
