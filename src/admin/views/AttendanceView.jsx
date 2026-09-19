import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, Save, Download, UserCheck, UserX, Clock, ShieldAlert, History, Lock } from 'lucide-react';
import ActionPopover from '../components/Common/ActionPopover';

export default function AttendanceView({ batches = [], students = [], showToast }) {
  const [selectedCenter, setSelectedCenter] = useState('Bhubaneswar LVS Skill Center');
  const [selectedBatch, setSelectedBatch] = useState('BATCH-2026-T1');
  const [selectedDate, setSelectedDate] = useState('2026-08-30');
  const [sessionType, setSessionType] = useState('Practical Lab'); // Theory, Practical Lab, OJT
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'history'

  // Saved Attendance Records Cache (Prevent duplicates)
  const [savedRecords, setSavedRecords] = useState({});

  // Student list for selected batch
  const [attendanceData, setAttendanceData] = useState({
    'LVS-OD-101': 'Present',
    'LVS-OD-102': 'Present',
    'LVS-OD-103': 'Leave',
    'LVS-OD-104': 'Present',
    'LVS-OD-105': 'Present',
    'LVS-OD-106': 'Absent'
  });

  const recordKey = `${selectedBatch}_${selectedDate}`;
  const isAlreadySaved = Boolean(savedRecords[recordKey]);

  const studentList = useMemo(() => {
    if (students && students.length > 0) {
      return students;
    }
    return [
      { id: 'LVS-OD-101', name: 'Sunita Sahu', phone: '+91 98610 12345' },
      { id: 'LVS-OD-102', name: 'Priya Ranjita Das', phone: '+91 97780 54321' },
      { id: 'LVS-OD-103', name: 'Minati Nayak', phone: '+91 94370 88990' },
      { id: 'LVS-OD-104', name: 'Rasmita Behera', phone: '+91 91240 66778' },
      { id: 'LVS-OD-105', name: 'Kalyani Swain', phone: '+91 99370 11223' },
      { id: 'LVS-OD-106', name: 'Kavita Kumari', phone: '+91 98530 00112' }
    ];
  }, [students]);

  const handleStatusChange = (id, status) => {
    setAttendanceData(prev => ({ ...prev, [id]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated = {};
    studentList.forEach(s => { updated[s.id] = 'Present'; });
    setAttendanceData(updated);
    if (showToast) showToast('Marked all students as Present.', 'info');
  };

  const handleMarkAllAbsent = () => {
    const updated = {};
    studentList.forEach(s => { updated[s.id] = 'Absent'; });
    setAttendanceData(updated);
    if (showToast) showToast('Marked all students as Absent.', 'info');
  };

  const handleSaveAttendance = () => {
    if (isAlreadySaved) {
      if (showToast) showToast(`Attendance for ${selectedBatch} on ${selectedDate} has already been recorded!`, 'error');
      return;
    }

    setSavedRecords(prev => ({
      ...prev,
      [recordKey]: {
        batch: selectedBatch,
        date: selectedDate,
        sessionType,
        records: { ...attendanceData },
        timestamp: new Date().toISOString()
      }
    }));

    if (showToast) showToast(`Attendance for ${selectedBatch} on ${selectedDate} saved successfully!`, 'success');
  };

  const presentCount = Object.values(attendanceData).filter(v => v === 'Present').length;
  const absentCount = Object.values(attendanceData).filter(v => v === 'Absent').length;
  const leaveCount = Object.values(attendanceData).filter(v => v === 'Leave').length;
  const lateCount = Object.values(attendanceData).filter(v => v === 'Late').length;
  const totalStudents = studentList.length || 1;
  const attendancePercentage = Math.round((presentCount / totalStudents) * 100);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Attendance Management</h1>
          <p className="text-xs text-slate-500">Record, calculate percentage & prevent duplicate attendance entries across batches</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'mark' ? 'history' : 'mark')}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <History className="w-4 h-4 text-pink-600" />
            <span>{viewMode === 'mark' ? 'View Attendance Logs' : 'Mark Daily Attendance'}</span>
          </button>

          {viewMode === 'mark' && (
            <button
              onClick={handleSaveAttendance}
              disabled={isAlreadySaved}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
                isAlreadySaved 
                  ? 'bg-slate-400 text-white cursor-not-allowed' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isAlreadySaved ? <Lock className="w-4 h-4 text-amber-300" /> : <Save className="w-4 h-4 text-pink-400" />}
              <span>{isAlreadySaved ? 'Attendance Saved' : 'Save Attendance'}</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'mark' ? (
        <>
          {/* Controls & Selectors Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 shadow-sm text-xs">
            
            <div>
              <label className="font-bold text-slate-700">Training Centre</label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
              >
                {centers.length > 0 ? (
                  centers.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)
                ) : (
                  <option value="All">No Centres Registered Yet</option>
                )}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">Batch Code</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
              >
                {batches.length > 0 ? (
                  batches.map(b => <option key={b.id} value={b.id}>{b.id} ({b.course || b.name})</option>)
                ) : (
                  <option value="All">No Batches Created Yet</option>
                )}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
              >
                <option value="Theory Class">Theory Class</option>
                <option value="Practical Lab">Practical Lab</option>
                <option value="OJT Internship">OJT Internship</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700">Attendance Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
              />
            </div>

          </div>

          {/* Quick Mark & Attendance Percentage Card */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-4 text-xs">
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Present Rate</span>
                <div className="text-xl font-black text-emerald-700">{attendancePercentage}%</div>
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">{presentCount} / {totalStudents} Students Present</p>
                <p className="text-slate-500 text-[11px]">{absentCount} Absent • {leaveCount} Leave • {lateCount} Late</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>
              <button
                onClick={handleMarkAllAbsent}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Mark All Absent</span>
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase tracking-wider font-bold">
                    <th className="p-4">Roll / Student ID</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-center">Attendance Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentList.map((stu) => {
                    const status = attendanceData[stu.id] || 'Present';
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-pink-700">{stu.id}</td>
                        <td className="p-4 font-bold text-slate-900">{stu.name}</td>
                        <td className="p-4 text-slate-600">{stu.phone || '+91 98610 12345'}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            {['Present', 'Absent', 'Leave', 'Late'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleStatusChange(stu.id, opt)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                  status === opt
                                    ? opt === 'Present' ? 'bg-emerald-600 text-white shadow-xs' :
                                      opt === 'Absent' ? 'bg-rose-600 text-white shadow-xs' :
                                      opt === 'Leave' ? 'bg-amber-500 text-white shadow-xs' :
                                      'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* History View */
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-serif">Saved Attendance Log History</h3>
          {Object.keys(savedRecords).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(savedRecords).map(([k, rec]) => (
                <div key={k} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{rec.batch}</span>
                    <p className="text-slate-500 text-[11px]">Date: {rec.date} • Type: {rec.sessionType}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg">Recorded</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No attendance records saved yet for this session.</p>
          )}
        </div>
      )}

    </div>
  );
}
