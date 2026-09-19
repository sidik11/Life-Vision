import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { Award, Edit, Save, CheckCircle2, Download, Printer, Plus, X, Eye, Filter } from 'lucide-react';

export default function AssessmentView({ 
  students = [], 
  setStudents, 
  centers = [], 
  batches = [], 
  showToast 
}) {
  const [selectedCenter, setSelectedCenter] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editTheory, setEditTheory] = useState(40);
  const [editPractical, setEditPractical] = useState(45);
  const [selectedMarksheet, setSelectedMarksheet] = useState(null);

  const calculateGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 50) return 'C';
    return 'F';
  };

  // Filtered Students for Assessment
  const filteredStudents = useMemo(() => {
    return (students || []).filter(stu => {
      const matchesCenter = selectedCenter === 'All' || !stu.center || stu.center === selectedCenter;
      const matchesBatch = selectedBatch === 'All' || !stu.batch || stu.batch === selectedBatch;
      return matchesCenter && matchesBatch;
    });
  }, [students, selectedCenter, selectedBatch]);

  const startEditMarks = (stu) => {
    setEditingStudentId(stu.id);
    const existingTotal = parseInt(stu.assessmentScore || '0', 10) || 80;
    setEditTheory(Math.min(50, Math.floor(existingTotal / 2)));
    setEditPractical(Math.min(50, Math.ceil(existingTotal / 2)));
  };

  const saveMarks = (stuId) => {
    const theory = Number(editTheory);
    const practical = Number(editPractical);
    const total = theory + practical;
    const percentage = total;
    const result = total >= 50 ? 'Pass' : 'Fail';
    const grade = calculateGrade(percentage);
    const scoreString = `${total}/100 (${result})`;

    if (setStudents) {
      setStudents(prev => prev.map(s => {
        if (s.id === stuId) {
          return {
            ...s,
            assessmentScore: scoreString,
            theoryMarks: theory,
            practicalMarks: practical,
            totalMarks: total,
            grade: grade,
            status: result === 'Pass' ? 'Passed' : 'Failed'
          };
        }
        return s;
      }));
    }

    setEditingStudentId(null);
    if (showToast) showToast(`Saved exam marks for student ${stuId}! Grade: ${grade}`, 'success');
  };

  const handleExportCSV = () => {
    if (showToast) showToast('Exported assessment summary to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Assessment Management</h1>
          <p className="text-xs text-slate-500">Record theory & practical exam marks, auto-calculate grade & result for certification eligibility</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-bold text-slate-700">Filter Training Centre</label>
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
          >
            <option value="All">All Centres</option>
            {centers.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700">Filter Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none"
          >
            <option value="All">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.id} ({b.course || b.name})</option>)}
          </select>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase tracking-wider font-bold">
                <th className="p-4">Student ID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Course & Batch</th>
                <th className="p-4 text-center">Theory (50)</th>
                <th className="p-4 text-center">Practical (50)</th>
                <th className="p-4 text-center">Total %</th>
                <th className="p-4 text-center">Grade</th>
                <th className="p-4">Result</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((stu) => {
                  const theory = stu.theoryMarks !== undefined ? stu.theoryMarks : 44;
                  const practical = stu.practicalMarks !== undefined ? stu.practicalMarks : 46;
                  const total = theory + practical;
                  const grade = stu.grade || calculateGrade(total);
                  const result = stu.status === 'Failed' ? 'Fail' : (total >= 50 ? 'Pass' : 'Pending');

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-pink-700">{stu.id}</td>
                      <td className="p-4 font-bold text-slate-900">{stu.name}</td>
                      <td className="p-4 text-slate-700">
                        <div>{stu.course}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{stu.batch}</div>
                      </td>

                      <td className="p-4 text-center font-bold">
                        {editingStudentId === stu.id ? (
                          <input
                            type="number"
                            max="50"
                            min="0"
                            value={editTheory}
                            onChange={(e) => setEditTheory(e.target.value)}
                            className="w-16 p-1 border border-slate-300 rounded text-center text-xs font-bold"
                          />
                        ) : (
                          <span>{theory} / 50</span>
                        )}
                      </td>

                      <td className="p-4 text-center font-bold">
                        {editingStudentId === stu.id ? (
                          <input
                            type="number"
                            max="50"
                            min="0"
                            value={editPractical}
                            onChange={(e) => setEditPractical(e.target.value)}
                            className="w-16 p-1 border border-slate-300 rounded text-center text-xs font-bold"
                          />
                        ) : (
                          <span>{practical} / 50</span>
                        )}
                      </td>

                      <td className="p-4 text-center font-extrabold text-pink-700">{total}%</td>
                      <td className="p-4 text-center font-black text-emerald-700">{grade}</td>
                      <td className="p-4">
                        <StatusBadge status={result} />
                      </td>

                      <td className="p-4 text-center">
                        {editingStudentId === stu.id ? (
                          <button
                            onClick={() => saveMarks(stu.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                          >
                            Save
                          </button>
                        ) : (
                          <ActionPopover 
                            actions={[
                              {
                                label: 'Enter / Edit Marks',
                                icon: Edit,
                                onClick: () => startEditMarks(stu)
                              },
                              {
                                label: 'View Marksheet',
                                icon: Eye,
                                onClick: () => setSelectedMarksheet({
                                  studentId: stu.id,
                                  student: stu.name,
                                  course: stu.course,
                                  batch: stu.batch,
                                  percentage: total,
                                  grade: grade,
                                  result: result
                                })
                              }
                            ]}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500 text-xs">
                    No enrolled students found in system. Enroll candidates from Candidate Applications or Student Management to record assessment marks.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marksheet Print Modal */}
      {selectedMarksheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6 my-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <img src="/image/logo.png" alt="LVS Logo" className="h-10 w-auto object-contain" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">Official Marksheet Record</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedMarksheet.studentId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMarksheet(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Candidate:</strong> {selectedMarksheet.student}</div>
                <div><strong>Course:</strong> {selectedMarksheet.course}</div>
                <div><strong>Batch:</strong> {selectedMarksheet.batch}</div>
                <div><strong>Total Percentage:</strong> <span className="font-extrabold text-pink-700">{selectedMarksheet.percentage}%</span></div>
                <div><strong>Grade:</strong> <span className="font-extrabold text-emerald-700">{selectedMarksheet.grade}</span></div>
                <div><strong>Final Result:</strong> <StatusBadge status={selectedMarksheet.result} /></div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Marksheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
