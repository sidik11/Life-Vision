import React, { useState } from 'react';
import StatCard from '../components/Common/StatCard';
import StatusBadge from '../components/Common/StatusBadge';
import { 
  Heart, DollarSign, Download, CheckCircle2, Clock, 
  XCircle, Search, Filter, Calendar, Eye, EyeOff, FileText, Printer, FileSpreadsheet, ShieldCheck
} from 'lucide-react';

export default function DonationsView({ donations = [], setDonations, showToast, onShowToast, activeSubTab = 'donation-overview' }) {
  const notify = showToast || onShowToast || (() => {});
  const [subTab, setSubTab] = useState(activeSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showFullPan, setShowFullPan] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Compute Metrics strictly from live donations dataset
  const successfulDonations = donations.filter(d => 
    d.status?.toLowerCase().includes('success') || d.status?.toLowerCase().includes('completed')
  );

  const pendingDonations = donations.filter(d => 
    d.status?.toLowerCase().includes('pending')
  );

  const failedDonations = donations.filter(d => 
    d.status?.toLowerCase().includes('failed') || d.status?.toLowerCase().includes('refund')
  );

  const totalAmountReceived = successfulDonations.reduce((sum, d) => {
    const raw = d.rawAmount || parseFloat(String(d.amount).replace(/[^0-9.]/g, '')) || 0;
    return sum + raw;
  }, 0);

  // Filtered dataset
  const filteredDonations = donations.filter(d => {
    // 1. Sub-tab filter
    if (subTab === 'successful-donations' && !d.status?.toLowerCase().includes('success')) return false;
    if (subTab === 'pending-donations' && !d.status?.toLowerCase().includes('pending')) return false;
    if (subTab === 'failed-donations' && (!d.status?.toLowerCase().includes('failed') && !d.status?.toLowerCase().includes('refund'))) return false;
    if (subTab === 'donation-receipts' && (!d.receiptNo || d.receiptNo === 'N/A')) return false;

    // 2. Dropdown Status Filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'SUCCESS' && !d.status?.toLowerCase().includes('success')) return false;
      if (statusFilter === 'PENDING' && !d.status?.toLowerCase().includes('pending')) return false;
      if (statusFilter === 'FAILED' && (!d.status?.toLowerCase().includes('failed') && !d.status?.toLowerCase().includes('refund'))) return false;
    }

    // 3. Search Term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchName = d.donor?.toLowerCase().includes(term);
      const matchEmail = d.email?.toLowerCase().includes(term);
      const matchMobile = d.mobile?.includes(term);
      const matchId = d.id?.toLowerCase().includes(term);
      const matchPaymentId = d.paymentId?.toLowerCase().includes(term);
      const matchOrderId = d.orderId?.toLowerCase().includes(term);

      if (!matchName && !matchEmail && !matchMobile && !matchId && !matchPaymentId && !matchOrderId) {
        return false;
      }
    }

    return true;
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    if (donations.length === 0) {
      notify('No donation data to export.', 'warning');
      return;
    }

    const headers = ['Donation ID', 'Donor Name', 'Email', 'Mobile', 'Masked PAN', 'Amount', 'Purpose', 'Payment ID', 'Order ID', 'Status', 'Date', 'Receipt No'];
    const rows = filteredDonations.map(d => [
      `"${d.id || ''}"`,
      `"${d.donor || ''}"`,
      `"${d.email || ''}"`,
      `"${d.mobile || ''}"`,
      `"${d.pan || 'N/A'}"`,
      `"${d.amount || ''}"`,
      `"${d.purpose || d.campaign || ''}"`,
      `"${d.paymentId || ''}"`,
      `"${d.orderId || ''}"`,
      `"${d.status || ''}"`,
      `"${d.date || ''}"`,
      `"${d.receiptNo || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LifeVision_Donations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify('Donation records exported to CSV successfully.', 'success');
  };

  const handleOpenDetails = (don) => {
    setSelectedDonation(don);
    setShowFullPan(false);
  };

  const handlePrintReceipt = (don) => {
    setSelectedDonation(don);
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <span>Donations & 80G Receipts</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Razorpay Verification
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time public donor contributions, 80G tax exemption receipts & Razorpay payment signature logs
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer shrink-0 self-start sm:self-center"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Donation CSV</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'donation-overview', label: '📊 Overview', count: donations.length },
          { id: 'all-donations', label: '💳 All Donations' },
          { id: 'successful-donations', label: '✅ Successful', count: successfulDonations.length },
          { id: 'pending-donations', label: '⏳ Pending', count: pendingDonations.length },
          { id: 'failed-donations', label: '🔄 Failed / Refunded', count: failedDonations.length },
          { id: 'donation-receipts', label: '🧾 80G Receipts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              subTab === tab.id 
                ? 'bg-[#123B5D] text-white shadow-xs' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Requirement 6: KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Donations" value={`${donations.length}`} change="All Recorded" isPositive={donations.length > 0} icon={Heart} color="pink" />
        <StatCard title="Successful" value={`${successfulDonations.length}`} change="Verified Payments" isPositive={successfulDonations.length > 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Total Amount Received" value={`₹ ${totalAmountReceived.toLocaleString('en-IN')}`} change="Verified Revenue" isPositive={totalAmountReceived > 0} icon={DollarSign} color="amber" />
        <StatCard title="Pending" value={`${pendingDonations.length}`} change="Awaiting Gateway" isPositive={pendingDonations.length === 0} icon={Clock} color="purple" />
        <StatCard title="Failed / Cancelled" value={`${failedDonations.length}`} change="Not Charged" isPositive={failedDonations.length === 0} icon={XCircle} color="red" />
      </div>

      {/* Requirement 6: Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Donor, Email, Mobile, Payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#123B5D]/30 focus:border-[#123B5D] outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600">×</button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed / Refunded</option>
            </select>
          </div>
        </div>

      </div>

      {/* Requirement 6: Main Donations Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 uppercase tracking-wider font-bold">
                <th className="p-4">Donation ID</th>
                <th className="p-4">Donor Information</th>
                <th className="p-4">Masked PAN</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Purpose / Category</th>
                <th className="p-4">Payment ID / Order ID</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No Donation Records Found</p>
                      <p className="text-xs text-slate-500">Public donations submitted via Razorpay on the website will appear here in real time.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDonations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#C52B75]">{don.id}</td>
                    
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{don.donor}</div>
                      <div className="text-3xs text-slate-500 truncate max-w-xs">{don.email}</div>
                      <div className="text-3xs text-slate-500">{don.mobile}</div>
                    </td>

                    {/* Masked PAN in General View (ABCDE****F) */}
                    <td className="p-4 font-mono text-slate-700 font-bold">
                      {don.pan || 'N/A'}
                    </td>

                    <td className="p-4 font-black text-emerald-700 text-sm">{don.amount}</td>
                    
                    <td className="p-4 text-slate-700 max-w-xs font-medium truncate">
                      {don.purpose || don.campaign || 'General Welfare Support'}
                    </td>

                    <td className="p-4 font-mono text-2xs text-slate-600">
                      <div><span className="font-bold text-slate-400">PAY: </span>{don.paymentId || 'Pending'}</div>
                      {don.orderId && <div className="text-3xs text-slate-400"><span className="font-bold">ORD: </span>{don.orderId}</div>}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={don.status || 'Successful'} />
                    </td>

                    <td className="p-4 text-slate-500 font-medium">{don.date}</td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenDetails(don)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                          title="View Donation Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => handlePrintReceipt(don)}
                          className="px-2.5 py-1.5 bg-[#123B5D] hover:bg-[#0E2F4A] text-white rounded-lg font-bold flex items-center space-x-1 cursor-pointer shadow-2xs transition-colors"
                          title="Generate 80G Receipt"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-300" />
                          <span>80G Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Requirement 11: VIEW DONATION DETAILS MODAL (Admin Dashboard -> Donation -> Donation Details) */}
      {selectedDonation && !showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-3xs font-black text-[#C52B75] tracking-widest uppercase bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100">
                  Authorized Admin Inspection
                </span>
                <h3 className="text-lg font-serif font-black text-slate-900 mt-1">Donation Details Record</h3>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Donor & Payment Grid */}
            <div className="space-y-4 text-xs">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-400 uppercase text-3xs tracking-wider">Donation ID</span>
                  <span className="font-mono font-bold text-[#C52B75] text-sm">{selectedDonation.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-400 uppercase text-3xs tracking-wider">Payment Status</span>
                  <StatusBadge status={selectedDonation.status || 'Successful'} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-400 uppercase text-3xs tracking-wider">Amount Donated</span>
                  <span className="font-black text-emerald-700 text-base">{selectedDonation.amount}</span>
                </div>
              </div>

              {/* Authorized Donor Details */}
              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                  <span>Donor Identification</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </h4>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-3xs text-slate-400 font-bold block uppercase">Donor Name</span>
                    <span className="font-bold text-slate-900">{selectedDonation.donor}</span>
                  </div>

                  <div>
                    <span className="text-3xs text-slate-400 font-bold block uppercase">Email Address</span>
                    <span className="font-medium text-slate-800 break-all">{selectedDonation.email || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-3xs text-slate-400 font-bold block uppercase">Mobile Number</span>
                    <span className="font-medium text-slate-800">{selectedDonation.mobile || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-3xs text-slate-400 font-bold block uppercase">PAN Number</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-slate-900">
                        {showFullPan ? (selectedDonation.fullPan || selectedDonation.pan) : selectedDonation.pan || 'N/A'}
                      </span>
                      <button
                        onClick={() => setShowFullPan(!showFullPan)}
                        className="text-slate-400 hover:text-[#C52B75] transition-colors p-0.5"
                        title={showFullPan ? "Hide Full PAN" : "Show Full PAN (Authorized Admin Only)"}
                      >
                        {showFullPan ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Specs */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 pb-1">Gateway Verification Specs</h4>
                <div className="grid grid-cols-2 gap-3 bg-pink-50/50 p-3 rounded-xl border border-pink-100">
                  <div>
                    <span className="text-3xs text-slate-400 font-bold block uppercase">Razorpay Payment ID</span>
                    <span className="font-mono text-2xs font-bold text-slate-800">{selectedDonation.paymentId || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-3xs text-slate-400 font-bold block uppercase">Razorpay Order ID</span>
                    <span className="font-mono text-2xs font-bold text-slate-800">{selectedDonation.orderId || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-3xs text-slate-400 font-bold block uppercase">Donation Purpose</span>
                    <span className="font-medium text-slate-800">{selectedDonation.purpose || selectedDonation.campaign}</span>
                  </div>

                  <div>
                    <span className="text-3xs text-slate-400 font-bold block uppercase">Receipt Status</span>
                    <span className="font-bold text-emerald-800">{selectedDonation.receiptStatus || 'Generated'} ({selectedDonation.receiptNo || 'RCP-80G'})</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex-1 bg-[#123B5D] hover:bg-[#0E2F4A] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-300" />
                <span>Generate / Download 80G Receipt</span>
              </button>

              <button
                onClick={() => setSelectedDonation(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL VIEW */}
      {showPrintModal && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[95vh] overflow-y-auto space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Official Life Vision 80G Receipt Document</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-xs relative overflow-hidden" id="admin-80g-receipt">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <img src="/image/logo.png" alt="Life Vision Logo" className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="font-black text-sm text-slate-900 tracking-tight">LIFE VISION SOCIETY</h4>
                  <p className="text-3xs text-slate-500 font-medium">Reg. No: 1234/2012 | 80G Reg: AAATL1234F20261</p>
                  <p className="text-3xs text-slate-500">Odisha, India | support.lifevision@gmail.com</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-3xs text-slate-400 font-bold block uppercase">Donation ID</span>
                  <span className="font-mono font-bold text-[#C52B75]">{selectedDonation.id}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 font-bold block uppercase">Receipt Date</span>
                  <span className="font-bold text-slate-800">{selectedDonation.date}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 font-bold block uppercase">Donor Name</span>
                  <span className="font-bold text-slate-900">{selectedDonation.donor}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 font-bold block uppercase">Amount Donated</span>
                  <span className="font-black text-emerald-700 text-sm">{selectedDonation.amount}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 font-bold block uppercase">Payment ID</span>
                  <span className="font-mono font-medium text-slate-800 text-2xs truncate block">{selectedDonation.paymentId}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 font-bold block uppercase">PAN Number</span>
                  <span className="font-mono font-bold text-slate-800">{selectedDonation.pan}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-3xs text-slate-600 leading-relaxed font-medium">
                80G tax benefit is subject to the eligibility of the donor, the NGO's valid 80G registration, and applicable income-tax rules.
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Download Receipt PDF</span>
              </button>

              <button
                onClick={() => setShowPrintModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
