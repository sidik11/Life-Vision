import React, { useState } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { Award, Edit, Save, CheckCircle2, Download, Printer, Plus, X, Eye } from 'lucide-react';

export default function AssessmentView({ students = [], showToast }) {
  const [assessments, setAssessments] = useState([
    {
      id: 'ASM-101',
      studentId: 'LVS-OD-101',
      student: 'Sunita Sahu',
      course: 'Tailoring & Stitching',
      batch: 'BATCH-2026-T1',
      theoryMarks: 46,
      practicalMarks: 48,
      maxMarks: 100,
      total: 94,
      percentage: 94,
      result: 'Pass',
      grade: 'A+',
      remarks: 'Top scorer in boutique garment drafting'
    },
    {
      id: 'ASM-102',
      studentId: 'LVS-OD-102',
      student: 'Priya Ranjita Das',
      course: 'Beautician & Wellness',
      batch: 'BATCH-2026-B1',
      theoryMarks: 48,
      practicalMarks: 48,
      maxMarks: 100,
      total: 96,
      percentage: 96,
      result: 'Pass',
      grade: 'A+',
      remarks: 'Excellent bridal makeup & styling practicals'
    },
    {
      id: 'ASM-103',
      studentId: 'LVS-OD-103',
      student: 'Minati Nayak',
      course: 'Tailoring & Stitching',
      batch: 'BATCH-2026-T2',
      theoryMarks: 42,
      practicalMarks: 46,
      maxMarks: 100,
      total: 88,
      percentage: 88,
      result: 'Pass',
      grade: 'A',
      remarks: 'Mastered commercial sewing machine operation'
    },
    {
      id: 'ASM-104',
      studentId: 'LVS-OD-104',
      student: 'Rasmita Behera',
      course: 'Tailoring & Stitching',
      batch: 'BATCH-2026-T3',
      theoryMarks: 38,
      practicalMarks: 42,
      maxMarks: 100,
      total: 80,
      percentage: 80,
      result: 'Pass',
      grade: 'B',
      remarks: 'Good stitching speed and accuracy'
    }
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editTheory, setEditTheory] = useState(0);
  const [editPractical, setEditPractical] = useState(0);
  const [selectedMarksheet, setSelectedMarksheet] = useState(null);

  const calculateGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 50) return 'C';
    return 'F';
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTheory(item.theoryMarks);
    setEditPractical(item.practicalMarks);
  };

  const saveEdit = (id) => {
    const total = Number(editTheory) + Number(editPractical);
    const percentage = total;
    const result = total >= 50 ? 'Pass' : 'Fail';
    const grade = calculateGrade(percentage);

    setAssessments(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          theoryMarks: Number(editTheory),
          practicalMarks: Number(editPractical),
          total,
          percentage,
          result,
          grade
        };
      }
      return a;
    }));

    setEditingId(null);
    if (showToast) showToast('Assessment marks updated successfully!', 'success');
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
              {assessments.map((asm) => (
                <tr key={asm.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-pink-700">{asm.studentId}</td>
                  <td className="p-4 font-bold text-slate-900">{asm.student}</td>
                  <td className="p-4 text-slate-700">
                    <div>{asm.course}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{asm.batch}</div>
                  </td>

                  <td className="p-4 text-center font-bold">
                    {editingId === asm.id ? (
                      <input
                        type="number"
                        max="50"
                        min="0"
                        value={editTheory}
                        onChange={(e) => setEditTheory(e.target.value)}
                        className="w-16 p-1 border border-slate-300 rounded text-center text-xs font-bold"
                      />
                    ) : (
                      <span>{asm.theoryMarks} / 50</span>
                    )}
                  </td>

                  <td className="p-4 text-center font-bold">
                    {editingId === asm.id ? (
                      <input
                        type="number"
                        max="50"
                        min="0"
                        value={editPractical}
                        onChange={(e) => setEditPractical(e.target.value)}
                        className="w-16 p-1 border border-slate-300 rounded text-center text-xs font-bold"
                      />
                    ) : (
                      <span>{asm.practicalMarks} / 50</span>
                    )}
                  </td>

                  <td className="p-4 text-center font-extrabold text-pink-700">{asm.percentage}%</td>
                  <td className="p-4 text-center font-black text-emerald-700">{asm.grade}</td>
                  <td className="p-4">
                    <StatusBadge status={asm.result} />
                  </td>

                  <td className="p-4 text-center">
                    {editingId === asm.id ? (
                      <button
                        onClick={() => saveEdit(asm.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                      >
                        Save
                      </button>
                    ) : (
                      <ActionPopover 
                        actions={[
                          {
                            label: 'Edit Marks',
                            icon: Edit,
                            onClick: () => startEdit(asm)
                          },
                          {
                            label: 'View Marksheet',
                            icon: Eye,
                            onClick: () => setSelectedMarksheet(asm)
                          }
                        ]}
                      />
                    )}
                  </td>
                </tr>
              ))}
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
