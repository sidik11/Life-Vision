import React, { useState } from 'react';
import { 
  BarChart3, FileSpreadsheet, Download, Calendar, 
  CheckCircle2, TrendingUp, Users, GraduationCap, 
  Building2, Heart, Award, PieChart, ArrowUpRight
} from 'lucide-react';

export default function ReportsView({ activeSubTab = 'report-training', showToast }) {
  const [subTab, setSubTab] = useState(activeSubTab);
  const [dateRange, setDateRange] = useState('2026-Q3');

  const reportTabs = [
    { id: 'report-training', label: '🎓 Training Reports' },
    { id: 'report-student', label: '👩‍🎓 Student Reports' },
    { id: 'report-placement', label: '💼 Placement Reports' },
    { id: 'report-staff', label: '👥 Staff Reports' },
    { id: 'report-partner', label: '🤝 Partner Reports' },
    { id: 'report-donation', label: '💰 Donation Reports' },
    { id: 'report-impact', label: '🌟 Impact Reports' }
  ];

  const handleExport = (reportName) => {
    if (showToast) {
      showToast(`Exported ${reportName} (${dateRange}) as CSV/PDF successfully!`, "success");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0E2F4A] via-[#123B5D] to-[#16A34A] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Executive Analytics & Audits</span>
          </div>
          <h1 className="text-2xl font-bold font-serif">Comprehensive Impact & Operations Reports</h1>
          <p className="text-slate-200 text-xs mt-1">
            Generate and export official performance reports for CSR compliance, government audits & donor reviews.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white/10 border border-white/20 text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none backdrop-blur-md"
          >
            <option value="2026-Q3" className="text-slate-800">FY 2026-27 (Q3 Current)</option>
            <option value="2026-Q2" className="text-slate-800">FY 2026-27 (Q2)</option>
            <option value="2025-26" className="text-slate-800">FY 2025-26 Annual Report</option>
          </select>

          <button
            onClick={() => handleExport(subTab.replace('report-', '').toUpperCase() + ' REPORT')}
            className="px-4 py-2.5 bg-white text-[#123B5D] hover:bg-slate-100 rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#16A34A]" />
            <span>Export CSV / PDF</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              subTab === tab.id 
                ? 'bg-[#123B5D] text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Cards Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Trainees Enrolled</div>
          <div className="text-2xl font-extrabold text-[#123B5D] mt-1">7,540</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2% vs last quarter
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placement Rate</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">86.4%</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 6,515 Successful Placements
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Skill Centers</div>
          <div className="text-2xl font-extrabold text-[#123B5D] mt-1">12 Centers</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Across 8 Odisha Districts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">CSR Grant Mobilization</div>
          <div className="text-2xl font-extrabold text-[#16A34A] mt-1">₹1.45 Cr</div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> Audited & Verified
          </div>
        </div>
      </div>

      {/* Main Report Details Display */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-serif capitalize">
              {subTab.replace('report-', '').toUpperCase()} Summary Report
            </h3>
            <p className="text-xs text-slate-500">
              Generated for period: <strong>{dateRange}</strong> • Compliance standard: NCVT & CSR Schedule VII
            </p>
          </div>

          <button
            onClick={() => handleExport(subTab)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center space-x-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download Detailed Dataset</span>
          </button>
        </div>

        {/* Report Sample Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Metric Category</th>
                <th className="p-3">District / Center</th>
                <th className="p-3">Target</th>
                <th className="p-3">Achieved</th>
                <th className="p-3">Completion %</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {[
                { cat: "Women Vocational Skill Training", center: "Bhubaneswar Skill Center", target: "500 Trainees", achieved: "485 Trainees", pct: "97%", status: "Exceeded Target" },
                { cat: "Beautician & Wellness Batch", center: "Cuttack Skill Hub", target: "350 Trainees", achieved: "340 Trainees", pct: "97.1%", status: "Exceeded Target" },
                { cat: "IT & Computer Literacy", center: "Puri Learning Center", target: "400 Trainees", achieved: "380 Trainees", pct: "95%", status: "On Track" },
                { cat: "Retail & Front Office", center: "Rourkela Skill Center", target: "300 Trainees", achieved: "290 Trainees", pct: "96.6%", status: "On Track" }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{row.cat}</td>
                  <td className="p-3 text-slate-600">{row.center}</td>
                  <td className="p-3 font-mono">{row.target}</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">{row.achieved}</td>
                  <td className="p-3 font-mono font-bold">{row.pct}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
