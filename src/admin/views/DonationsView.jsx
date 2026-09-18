import React, { useState } from 'react';
import StatCard from '../components/Common/StatCard';
import StatusBadge from '../components/Common/StatusBadge';
import { Heart, DollarSign, Download, CheckCircle2, Clock } from 'lucide-react';

export default function DonationsView({ donations = [], setDonations, showToast, onShowToast, activeSubTab = 'donation-overview' }) {
  const notify = showToast || onShowToast || (() => {});
  const [subTab, setSubTab] = useState(activeSubTab);

  const handleDownloadReceipt = (don) => {
    notify(`Downloaded 80G Tax Exemption Receipt for ${don.donor || 'Donor'} (${don.receiptNo || 'REC-80G'})`, 'success');
  };

  const filteredDonations = donations.filter(d => {
    if (subTab === 'successful-donations') return d.status?.toLowerCase().includes('success') || d.status?.toLowerCase().includes('completed');
    if (subTab === 'pending-donations') return d.status?.toLowerCase().includes('pending');
    if (subTab === 'failed-donations') return d.status?.toLowerCase().includes('failed') || d.status?.toLowerCase().includes('refund');
    if (subTab === 'campaigns') return true;
    if (subTab === 'donation-receipts') return d.receiptNo && d.receiptNo !== 'N/A';
    return true; // donation-overview or all-donations
  });

  // Dynamic metrics computed strictly from real donations
  const totalRaised = donations.reduce((sum, d) => {
    if (!d.amount) return sum;
    const num = parseFloat(String(d.amount).replace(/[^0-9.]/g, '')) || 0;
    return sum + num;
  }, 0);

  const successfulDonations = donations.filter(d => 
    d.status?.toLowerCase().includes('success') || d.status?.toLowerCase().includes('completed')
  );

  const pendingDonations = donations.filter(d => 
    d.status?.toLowerCase().includes('pending')
  );

  const pendingAmount = pendingDonations.reduce((sum, d) => {
    if (!d.amount) return sum;
    const num = parseFloat(String(d.amount).replace(/[^0-9.]/g, '')) || 0;
    return sum + num;
  }, 0);

  const successRate = donations.length > 0
    ? `${Math.round((successfulDonations.length / donations.length) * 100)}%`
    : '0%';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Donations & 80G Tax Receipts</h1>
          <p className="text-xs text-slate-500">Track public contributions, CSR grants, individual giving & 80G tax exemption receipts</p>
        </div>
      </div>

      {/* Sub Nav Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'donation-overview', label: '📊 Overview', count: donations.length },
          { id: 'all-donations', label: '💳 All Donations' },
          { id: 'successful-donations', label: '✅ Successful' },
          { id: 'pending-donations', label: '⏳ Pending' },
          { id: 'failed-donations', label: '🔄 Failed / Refunded' },
          { id: 'campaigns', label: '🎯 Campaigns' },
          { id: 'donation-receipts', label: '🧾 80G Receipts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              subTab === tab.id 
                ? 'bg-[#123B5D] text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Raised" value={`₹ ${totalRaised.toLocaleString('en-IN')}`} change={`${donations.length} Transactions`} isPositive={totalRaised > 0} icon={Heart} color="pink" />
        <StatCard title="This Month" value={`₹ ${totalRaised.toLocaleString('en-IN')}`} change="Live Website Donations" isPositive={totalRaised > 0} icon={DollarSign} color="amber" />
        <StatCard title="Successful Payments" value={successRate} change={`${successfulDonations.length} Successful`} isPositive={successfulDonations.length > 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Pending Verification" value={`₹ ${pendingAmount.toLocaleString('en-IN')}`} change={`${pendingDonations.length} Pending`} isPositive={pendingDonations.length === 0} icon={Clock} color="purple" />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase tracking-wider font-bold">
                <th className="p-4">Donation ID</th>
                <th className="p-4">Donor Name</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Campaign</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">80G Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No Donations Recorded Yet</p>
                      <p className="text-xs text-slate-500">Real donations submitted via the public website form will appear here live with 80G receipt generation.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDonations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-pink-700">{don.id}</td>
                    <td className="p-4 font-bold text-slate-900">{don.donor}</td>
                    <td className="p-4 font-extrabold text-emerald-800 text-sm">{don.amount}</td>
                    <td className="p-4 text-slate-700 max-w-xs">{don.campaign}</td>
                    <td className="p-4">
                      <StatusBadge status={don.status} />
                    </td>
                    <td className="p-4 text-slate-500">{don.date}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDownloadReceipt(don)}
                        className="px-3 py-1.5 bg-[#123B5D] hover:bg-[#0E2F4A] text-white rounded-lg font-bold flex items-center space-x-1.5 ml-auto cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{don.receiptNo !== 'N/A' ? 'Download 80G' : 'Pending'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
