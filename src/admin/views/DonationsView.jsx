import React, { useState, useEffect } from 'react';
import StatCard from '../components/Common/StatCard';
import StatusBadge from '../components/Common/StatusBadge';
import ActionPopover from '../components/Common/ActionPopover';
import { 
  Heart, DollarSign, Download, CheckCircle2, Clock, 
  XCircle, Search, Filter, Calendar, Eye, EyeOff, FileText, Printer, 
  FileSpreadsheet, ShieldCheck, Edit, Trash2, X, ExternalLink, AlertCircle, Check, RefreshCw, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { db, collection, onSnapshot } from '../../firebase';
import { updateDonationStatus, deleteDonationRecord } from '../../utils/donationService';

export default function DonationsView({ donations = [], setDonations, showToast, onShowToast, activeSubTab = 'donation-overview' }) {
  const notify = showToast || onShowToast || (() => {});
  const [subTab, setSubTab] = useState(activeSubTab);
  const [liveDonations, setLiveDonations] = useState(donations);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Modals & Selected items
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [verifyModalDonation, setVerifyModalDonation] = useState(null);
  const [proofViewerUrl, setProofViewerUrl] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Verification Form State
  const [verificationAction, setVerificationAction] = useState('approve'); // 'approve' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('Invalid or unmatched UTR / Transaction ID');
  const [customRejection, setCustomRejection] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  useEffect(() => {
    if (activeSubTab && activeSubTab !== 'donations') {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Real-time Firestore Sync with fallback to prop
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = collection(db, 'donations');
      unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreList = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const rawAmt = Number(data.amount) || 0;
          return {
            firestoreId: docSnap.id,
            id: data.donationId || data.id || docSnap.id,
            donor: data.donorName || data.donor || 'Generous Donor',
            email: data.email || '',
            mobile: data.mobile || '',
            amount: data.formattedAmount || (rawAmt ? `₹ ${rawAmt.toLocaleString('en-IN')}` : `₹ ${data.amount || 0}`),
            rawAmount: rawAmt,
            purpose: data.donationPurpose || data.purpose || 'General Welfare Support',
            paymentMethod: data.paymentMethod || 'UPI Scanner',
            utrNumber: data.utrNumber || 'N/A',
            status: data.status || data.verificationStatus || 'Pending Verification',
            date: data.paymentDate || data.date || new Date().toISOString().split('T')[0],
            time: data.paymentTime || '',
            paymentScreenshotUrl: data.paymentScreenshotUrl || data.screenshotUrl || '',
            pan: data.panNumber || data.pan || 'N/A',
            address: data.address || '',
            state: data.state || '',
            adminRemarks: data.adminRemarks || '',
            rejectionReason: data.rejectionReason || '',
            verifiedAt: data.verifiedAt || '',
            rejectedAt: data.rejectedAt || ''
          };
        });

        if (firestoreList.length > 0) {
          setLiveDonations(firestoreList);
          if (setDonations) setDonations(firestoreList);
        } else if (donations && donations.length > 0) {
          setLiveDonations(donations);
        } else {
          setLiveDonations([]);
        }
        setIsLoading(false);
      }, (err) => {
        console.warn('Firestore donations sync notice:', err);
        if (donations && donations.length > 0) setLiveDonations(donations);
        setIsLoading(false);
      });
    } catch (e) {
      console.warn('Firestore subscription setup error:', e);
      if (donations && donations.length > 0) setLiveDonations(donations);
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // Live dataset
  const dataset = liveDonations.length > 0 ? liveDonations : donations;

  // Key Stats
  const pendingList = dataset.filter(d => d.status === 'Pending Verification' || d.status === 'Pending');
  const verifiedList = dataset.filter(d => d.status === 'Verified' || d.status === 'Successful' || d.status === 'Success');
  const rejectedList = dataset.filter(d => d.status === 'Rejected' || d.status === 'Failed');

  const totalVerifiedRevenue = verifiedList.reduce((sum, d) => sum + (d.rawAmount || 0), 0);
  const upiCount = dataset.filter(d => d.paymentMethod?.toLowerCase().includes('upi')).length;
  const bankCount = dataset.filter(d => d.paymentMethod?.toLowerCase().includes('bank')).length;

  // SubTab-Specific Filtered dataset for Table
  const getSubTabDataset = () => {
    switch (subTab) {
      case 'successful-donations':
        return verifiedList;
      case 'pending-donations':
        return pendingList;
      case 'failed-donations':
        return rejectedList;
      case 'donation-receipts':
        return verifiedList;
      default:
        return dataset;
    }
  };

  const currentTabDataset = getSubTabDataset();

  // Search & Filter SubTab Dataset
  const filteredDonations = currentTabDataset.filter(d => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'Pending Verification' && !(d.status === 'Pending Verification' || d.status === 'Pending')) return false;
      if (statusFilter === 'Verified' && !(d.status === 'Verified' || d.status === 'Successful')) return false;
      if (statusFilter === 'Rejected' && !(d.status === 'Rejected' || d.status === 'Failed')) return false;
    }

    if (methodFilter !== 'ALL') {
      if (methodFilter === 'UPI' && !d.paymentMethod?.toLowerCase().includes('upi')) return false;
      if (methodFilter === 'BANK' && !d.paymentMethod?.toLowerCase().includes('bank')) return false;
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchId = d.id?.toLowerCase().includes(term);
      const matchDonor = d.donor?.toLowerCase().includes(term);
      const matchEmail = d.email?.toLowerCase().includes(term);
      const matchMobile = d.mobile?.includes(term);
      const matchUtr = d.utrNumber?.toLowerCase().includes(term);

      if (!matchId && !matchDonor && !matchEmail && !matchMobile && !matchUtr) return false;
    }

    return true;
  });

  // Verification Submit (Approve / Reject)
  const handleExecuteVerification = async (e) => {
    e.preventDefault();
    if (!verifyModalDonation) return;

    setIsSubmittingVerification(true);
    const targetDocId = verifyModalDonation.firestoreId || verifyModalDonation.id;

    try {
      if (verificationAction === 'approve') {
        const timestamp = new Date().toLocaleString('en-IN');
        await updateDonationStatus(targetDocId, 'Verified', {
          verifiedAt: timestamp,
          adminRemarks: adminRemarks || 'Payment verified by Admin'
        });

        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'donation_approved',
            applicantEmail: verifyModalDonation.email,
            applicantName: verifyModalDonation.donor,
            data: {
              donationId: verifyModalDonation.id,
              amount: verifyModalDonation.amount,
              paymentMethod: verifyModalDonation.paymentMethod,
              utrNumber: verifyModalDonation.utrNumber
            }
          })
        }).catch(err => console.warn('Email dispatch warning:', err));

        notify(`✓ Payment for ${verifyModalDonation.donor} verified! Approval email sent.`, 'success');
      } else {
        const finalReason = rejectionReason === 'Other' ? customRejection : rejectionReason;
        const timestamp = new Date().toLocaleString('en-IN');

        await updateDonationStatus(targetDocId, 'Rejected', {
          rejectedAt: timestamp,
          rejectionReason: finalReason || 'Transaction details could not be verified'
        });

        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'donation_rejected',
            applicantEmail: verifyModalDonation.email,
            applicantName: verifyModalDonation.donor,
            data: {
              donationId: verifyModalDonation.id,
              amount: verifyModalDonation.amount,
              rejectionReason: finalReason
            }
          })
        }).catch(err => console.warn('Email dispatch warning:', err));

        notify(`Payment for ${verifyModalDonation.donor} marked as Rejected. Rejection email sent.`, 'info');
      }

      setVerifyModalDonation(null);
    } catch (err) {
      console.error('Failed to update verification status:', err);
      notify(`Error updating payment status: ${err.message}`, 'error');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  // Record Deletion
  const handleDelete = async (don) => {
    if (window.confirm(`Are you sure you want to delete donation record ${don.id} from ${don.donor}?`)) {
      try {
        if (don.firestoreId) {
          await deleteDonationRecord(don.firestoreId);
        } else {
          setLiveDonations(prev => prev.filter(d => d.id !== don.id));
        }
        notify(`Deleted donation record ${don.id}.`, 'info');
      } catch (err) {
        console.error('Error deleting donation document:', err);
        notify(`Failed to delete record: ${err.message}`, 'error');
      }
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (dataset.length === 0) {
      notify('No donation data available to export.', 'warning');
      return;
    }

    const headers = ['Donation Reference ID', 'Donor Name', 'Email', 'Mobile', 'Amount', 'Payment Method', 'UTR / Transaction ID', 'Status', 'Date', 'Purpose'];
    const rows = filteredDonations.map(d => [
      `"${d.id || ''}"`,
      `"${d.donor || ''}"`,
      `"${d.email || ''}"`,
      `"${d.mobile || ''}"`,
      `"${d.amount || ''}"`,
      `"${d.paymentMethod || ''}"`,
      `"${d.utrNumber || ''}"`,
      `"${d.status || ''}"`,
      `"${d.date || ''}"`,
      `"${d.purpose || ''}"`
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

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <span>
              {subTab === 'donation-overview' && 'Donation Overview'}
              {subTab === 'all-donations' && 'All Donations'}
              {subTab === 'successful-donations' && 'Successful Donations'}
              {subTab === 'pending-donations' && 'Pending Verification'}
              {subTab === 'failed-donations' && 'Failed & Refunded Donations'}
              {subTab === 'donation-receipts' && '80G Donation Receipts'}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Live Sync
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {subTab === 'donation-overview' && 'High-level financial metrics, donation trends, and recent contribution activities.'}
            {subTab === 'all-donations' && 'Complete master registry of all donor contributions and payment records.'}
            {subTab === 'successful-donations' && 'Verified donations with confirmed bank credit and tax exemption eligibility.'}
            {subTab === 'pending-donations' && 'Donations submitted by donors awaiting UTR and screenshot verification.'}
            {subTab === 'failed-donations' && 'Unverified or rejected donation transactions.'}
            {subTab === 'donation-receipts' && 'Official 80G tax exemption receipts for verified donors.'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer shrink-0 self-start sm:self-center"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PAGE VIEW 1: DONATION OVERVIEW (Simple, clean design like other sections) */}
      {/* ========================================================================= */}
      {subTab === 'donation-overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Compact Rectangular 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Card 1: Total Submissions */}
            <div className="bg-white p-3.5 px-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Submissions</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 font-serif tracking-tight">{dataset.length}</span>
                  <span className="text-3xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    All Records
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-pink-50 text-[#C52B75] border border-pink-100 shrink-0">
                <Heart className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Verified Revenue */}
            <div className="bg-white p-3.5 px-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Verified Revenue</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-emerald-700 font-serif tracking-tight">₹{totalVerifiedRevenue.toLocaleString('en-IN')}</span>
                  <span className="text-3xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Confirmed
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Pending Verification */}
            <div className="bg-white p-3.5 px-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Pending Verification</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-amber-900 font-serif tracking-tight">{pendingList.length}</span>
                  <span className="text-3xs font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Action Required
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Rejected / Invalid */}
            <div className="bg-white p-3.5 px-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Rejected / Invalid</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-rose-800 font-serif tracking-tight">{rejectedList.length}</span>
                  <span className="text-3xs font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Declined
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                <XCircle className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Payment Method Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400">Scan & Pay via UPI</span>
                <h3 className="text-2xl font-black text-slate-900 font-serif">{upiCount} Payments</h3>
                <p className="text-xs text-slate-500 font-medium">Direct QR Code scan payments</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#C52B75] flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-400">Bank Transfer (NEFT/IMPS)</span>
                <h3 className="text-2xl font-black text-slate-900 font-serif">{bankCount} Payments</h3>
                <p className="text-xs text-slate-500 font-medium">Union Bank account transfers</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-serif">Recent Donation Submissions</h3>
              <button onClick={() => setSubTab('all-donations')} className="text-xs font-bold text-[#123B5D] hover:underline flex items-center gap-1">
                <span>View All ({dataset.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto pb-12 min-h-[220px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 uppercase tracking-wider font-bold">
                    <th className="p-3">Reference ID</th>
                    <th className="p-3">Donor Name</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dataset.slice(0, 5).map(don => (
                    <tr key={don.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-[#C52B75]">{don.id}</td>
                      <td className="p-3 font-bold text-slate-900">{don.donor}</td>
                      <td className="p-3 font-black text-emerald-700">{don.amount}</td>
                      <td className="p-3 text-slate-600">{don.paymentMethod}</td>
                      <td className="p-3"><StatusBadge status={don.status} /></td>
                      <td className="p-3 text-right">
                        <ActionPopover
                          items={[
                            ...(don.status === 'Pending Verification' || don.status === 'Pending' ? [
                              { label: 'Verify Payment', icon: CheckCircle2, onClick: () => { setVerifyModalDonation(don); setVerificationAction('approve'); } }
                            ] : []),
                            { label: 'View Details', icon: Eye, onClick: () => setSelectedDonation(don) },
                            ...(don.paymentScreenshotUrl ? [
                              { label: 'View Proof', icon: ExternalLink, onClick: () => setProofViewerUrl(don.paymentScreenshotUrl) }
                            ] : []),
                            ...(don.status === 'Verified' || don.status === 'Successful' ? [
                              { label: 'Download Receipt', icon: Printer, onClick: () => { setSelectedDonation(don); setShowPrintModal(true); } }
                            ] : []),
                            { divider: true },
                            { label: 'Delete Record', icon: Trash2, danger: true, onClick: () => handleDelete(don) }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE VIEW 2: ALL DONATIONS (NO TOP Metric Cards - as explicitly requested) */}
      {/* ========================================================================= */}
      {subTab === 'all-donations' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="font-bold text-slate-600">Status:</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent font-bold text-slate-800 outline-none">
                  <option value="ALL">All Statuses</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="font-bold text-slate-600">Method:</span>
                <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="bg-transparent font-bold text-slate-800 outline-none">
                  <option value="ALL">All Methods</option>
                  <option value="UPI">UPI Scanner</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Reference ID, Donor, UTR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#123B5D]/30"
              />
            </div>
          </div>

          {/* Master Donations Table (NO top cards above this) */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="overflow-x-auto pb-16 min-h-[260px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 uppercase tracking-wider font-bold">
                    <th className="p-4">Reference ID</th>
                    <th className="p-4">Donor Details</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">UTR / Ref ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-slate-500 font-bold">No donation records found.</td>
                    </tr>
                  ) : (
                    filteredDonations.map(don => (
                      <tr key={don.id} className="hover:bg-slate-50/80">
                        <td className="p-4 font-mono font-bold text-[#C52B75]">{don.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{don.donor}</div>
                          <div className="text-3xs text-slate-500">{don.email}</div>
                          <div className="text-3xs text-slate-500">{don.mobile}</div>
                        </td>
                        <td className="p-4 font-black text-emerald-700 text-sm">{don.amount}</td>
                        <td className="p-4 text-slate-700 font-semibold">{don.paymentMethod}</td>
                        <td className="p-4 font-mono font-bold text-2xs text-amber-900">{don.utrNumber}</td>
                        <td className="p-4 text-slate-500">{don.date}</td>
                        <td className="p-4"><StatusBadge status={don.status} /></td>
                        <td className="p-4 text-right">
                          <ActionPopover
                            items={[
                              ...(don.status === 'Pending Verification' || don.status === 'Pending' ? [
                                { label: 'Verify Payment', icon: CheckCircle2, onClick: () => { setVerifyModalDonation(don); setVerificationAction('approve'); } }
                              ] : []),
                              { label: 'View Details', icon: Eye, onClick: () => setSelectedDonation(don) },
                              ...(don.paymentScreenshotUrl ? [
                                { label: 'View Proof', icon: ExternalLink, onClick: () => setProofViewerUrl(don.paymentScreenshotUrl) }
                              ] : []),
                              ...(don.status === 'Verified' || don.status === 'Successful' ? [
                                { label: 'Download Receipt', icon: Printer, onClick: () => { setSelectedDonation(don); setShowPrintModal(true); } }
                              ] : []),
                              { divider: true },
                              { label: 'Delete Record', icon: Trash2, danger: true, onClick: () => handleDelete(don) }
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE VIEW 3: SUCCESSFUL DONATIONS (Dedicated Green Theme) */}
      {/* ========================================================================= */}
      {subTab === 'successful-donations' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-emerald-900 text-white p-6 rounded-2xl border border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-emerald-300">Confirmed Revenue</span>
              <h2 className="text-2xl font-serif font-black">Verified Donations Registry</h2>
              <p className="text-xs text-emerald-200 mt-1">Confirmed bank payments with active 80G tax receipt eligibility.</p>
            </div>
            <div className="text-right">
              <span className="text-2xs text-emerald-300 block font-bold">Total Verified Revenue</span>
              <span className="text-2xl font-black font-mono text-emerald-300">₹ {totalVerifiedRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="overflow-x-auto pb-16 min-h-[260px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-emerald-50/50 uppercase tracking-wider font-bold">
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Donor Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">UTR Number</th>
                  <th className="p-4">Verified Date</th>
                  <th className="p-4 text-right">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {verifiedList.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-slate-500">No verified donations yet.</td></tr>
                ) : (
                  verifiedList.map(don => (
                    <tr key={don.id} className="hover:bg-slate-50/80">
                      <td className="p-4 font-mono font-bold text-[#C52B75]">{don.id}</td>
                      <td className="p-4 font-bold text-slate-900">{don.donor}</td>
                      <td className="p-4 font-black text-emerald-700 text-sm">{don.amount}</td>
                      <td className="p-4 font-semibold text-slate-700">{don.paymentMethod}</td>
                      <td className="p-4 font-mono text-slate-800">{don.utrNumber}</td>
                      <td className="p-4 text-slate-500">{don.verifiedAt || don.date}</td>
                      <td className="p-4 text-right">
                        <ActionPopover
                          items={[
                            { label: 'Download Receipt', icon: Printer, onClick: () => { setSelectedDonation(don); setShowPrintModal(true); } },
                            { label: 'View Details', icon: Eye, onClick: () => setSelectedDonation(don) },
                            ...(don.paymentScreenshotUrl ? [
                              { label: 'View Proof', icon: ExternalLink, onClick: () => setProofViewerUrl(don.paymentScreenshotUrl) }
                            ] : []),
                            { divider: true },
                            { label: 'Delete Record', icon: Trash2, danger: true, onClick: () => handleDelete(don) }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE VIEW 4: PENDING DONATIONS (Dedicated Actionable Amber Theme) */}
      {/* ========================================================================= */}
      {subTab === 'pending-donations' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-amber-900 text-white p-6 rounded-2xl border border-amber-800 flex items-center justify-between">
            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-amber-300">Action Required</span>
              <h2 className="text-2xl font-serif font-black">Pending Payment Verifications</h2>
              <p className="text-xs text-amber-200 mt-1">Review donor UTR reference IDs and uploaded payment screenshots to approve or reject.</p>
            </div>
            <div className="text-right">
              <span className="text-2xs text-amber-300 block font-bold">Awaiting Action</span>
              <span className="text-2xl font-black font-mono text-amber-300">{pendingList.length} Submissions</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="overflow-x-auto pb-16 min-h-[260px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-amber-50/50 uppercase tracking-wider font-bold">
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Donor Information</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">UTR Number</th>
                  <th className="p-4">Proof Screenshot</th>
                  <th className="p-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingList.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-slate-500 font-bold">No pending donation verifications.</td></tr>
                ) : (
                  pendingList.map(don => (
                    <tr key={don.id} className="hover:bg-slate-50/80">
                      <td className="p-4 font-mono font-bold text-[#C52B75]">{don.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{don.donor}</div>
                        <div className="text-3xs text-slate-500">{don.email}</div>
                        <div className="text-3xs text-slate-500">{don.mobile}</div>
                      </td>
                      <td className="p-4 font-black text-emerald-700 text-sm">{don.amount}</td>
                      <td className="p-4 text-slate-700 font-semibold">{don.paymentMethod}</td>
                      <td className="p-4 font-mono font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">{don.utrNumber}</td>
                      <td className="p-4">
                        {don.paymentScreenshotUrl ? (
                          <button onClick={() => setProofViewerUrl(don.paymentScreenshotUrl)} className="text-3xs font-bold text-[#123B5D] hover:underline flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> View Proof
                          </button>
                        ) : (
                          <span className="text-3xs text-slate-400">No File</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setVerifyModalDonation(don); setVerificationAction('approve'); }}
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-3xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </button>
                          <ActionPopover
                            items={[
                              { label: 'Verify Payment', icon: CheckCircle2, onClick: () => { setVerifyModalDonation(don); setVerificationAction('approve'); } },
                              { label: 'Reject Payment', icon: XCircle, danger: true, onClick: () => { setVerifyModalDonation(don); setVerificationAction('reject'); } },
                              { label: 'View Details', icon: Eye, onClick: () => setSelectedDonation(don) },
                              ...(don.paymentScreenshotUrl ? [
                                { label: 'View Proof', icon: ExternalLink, onClick: () => setProofViewerUrl(don.paymentScreenshotUrl) }
                              ] : []),
                              { divider: true },
                              { label: 'Delete Record', icon: Trash2, danger: true, onClick: () => handleDelete(don) }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE VIEW 5: FAILED / REJECTED DONATIONS (Dedicated Red Theme) */}
      {/* ========================================================================= */}
      {subTab === 'failed-donations' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-rose-950 text-white p-6 rounded-2xl border border-rose-900 flex items-center justify-between">
            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-rose-300">Declined Submissions</span>
              <h2 className="text-2xl font-serif font-black">Rejected & Invalid Submissions</h2>
              <p className="text-xs text-rose-200 mt-1">Donations rejected due to unmatched UTR numbers, illegible proof, or duplicate submissions.</p>
            </div>
            <div className="text-right">
              <span className="text-2xs text-rose-300 block font-bold">Total Rejected</span>
              <span className="text-2xl font-black font-mono text-rose-300">{rejectedList.length} Records</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="overflow-x-auto pb-16 min-h-[260px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-rose-50/50 uppercase tracking-wider font-bold">
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Donor Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">UTR Number</th>
                  <th className="p-4">Rejection Reason</th>
                  <th className="p-4">Rejected Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {rejectedList.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-slate-500 font-bold">No rejected donation records.</td></tr>
                ) : (
                  rejectedList.map(don => (
                    <tr key={don.id} className="hover:bg-slate-50/80">
                      <td className="p-4 font-mono font-bold text-[#C52B75]">{don.id}</td>
                      <td className="p-4 font-bold text-slate-900">{don.donor}</td>
                      <td className="p-4 font-black text-rose-700">{don.amount}</td>
                      <td className="p-4 font-mono text-slate-700">{don.utrNumber}</td>
                      <td className="p-4 text-rose-800 font-semibold">{don.rejectionReason || 'Unverified transaction'}</td>
                      <td className="p-4 text-slate-500">{don.rejectedAt || don.date}</td>
                      <td className="p-4 text-right">
                        <ActionPopover
                          items={[
                            { label: 'View Details', icon: Eye, onClick: () => setSelectedDonation(don) },
                            ...(don.paymentScreenshotUrl ? [
                              { label: 'View Proof', icon: ExternalLink, onClick: () => setProofViewerUrl(don.paymentScreenshotUrl) }
                            ] : []),
                            { divider: true },
                            { label: 'Delete Record', icon: Trash2, danger: true, onClick: () => handleDelete(don) }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE VIEW 6: DONATION RECEIPTS (Dedicated 80G Tax Exemption Page) */}
      {/* ========================================================================= */}
      {subTab === 'donation-receipts' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-[#123B5D] text-white p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-emerald-300">Tax Exemption Section 80G</span>
              <h2 className="text-2xl font-serif font-black">Official 80G Tax Receipts</h2>
              <p className="text-xs text-slate-300 mt-1">Generate and print official tax exemption certificates for verified donors.</p>
            </div>
            <div className="text-right">
              <span className="text-2xs text-slate-300 block font-bold">Receipt Eligible</span>
              <span className="text-2xl font-black font-mono text-emerald-300">{verifiedList.length} Donors</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="overflow-x-auto pb-16 min-h-[260px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase tracking-wider font-bold">
                  <th className="p-4">Receipt No</th>
                  <th className="p-4">Donation Ref ID</th>
                  <th className="p-4">Donor Name</th>
                  <th className="p-4">PAN Number</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {verifiedList.length === 0 ? (
                  <tr><td colSpan="7" className="p-10 text-center text-slate-500 font-bold">No 80G receipts available.</td></tr>
                ) : (
                  verifiedList.map(don => (
                    <tr key={don.id} className="hover:bg-slate-50/80">
                      <td className="p-4 font-mono font-bold text-slate-800">RCP-80G-2026-{don.id.slice(-4)}</td>
                      <td className="p-4 font-mono text-[#C52B75] font-bold">{don.id}</td>
                      <td className="p-4 font-bold text-slate-900">{don.donor}</td>
                      <td className="p-4 font-mono text-slate-700 font-bold">{don.pan || 'N/A'}</td>
                      <td className="p-4 font-black text-emerald-700">{don.amount}</td>
                      <td className="p-4 text-slate-500">{don.date}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedDonation(don); setShowPrintModal(true); }}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-3xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Print PDF</span>
                          </button>
                          <ActionPopover
                            items={[
                              { label: 'Download Receipt', icon: Printer, onClick: () => { setSelectedDonation(don); setShowPrintModal(true); } },
                              { label: 'View Details', icon: Eye, onClick: () => setSelectedDonation(don) },
                              ...(don.paymentScreenshotUrl ? [
                                { label: 'View Proof', icon: ExternalLink, onClick: () => setProofViewerUrl(don.paymentScreenshotUrl) }
                              ] : []),
                              { divider: true },
                              { label: 'Delete Record', icon: Trash2, danger: true, onClick: () => handleDelete(don) }
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* VERIFY PAYMENT MODAL (Approve / Reject Dialog) */}
      {/* ========================================================================= */}
      {verifyModalDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Verification Required
                </span>
                <h3 className="text-lg font-serif font-black text-slate-900 mt-1">
                  Verify Donation Payment
                </h3>
              </div>
              <button onClick={() => setVerifyModalDonation(null)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Reference ID:</span>
                <span className="font-mono font-bold text-[#C52B75]">{verifyModalDonation.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Donor Name:</span>
                <span className="font-bold text-slate-900">{verifyModalDonation.donor}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">Amount:</span>
                <span className="font-black text-emerald-700 text-sm">{verifyModalDonation.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">UTR / Reference ID:</span>
                <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {verifyModalDonation.utrNumber}
                </span>
              </div>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setVerificationAction('approve')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  verificationAction === 'approve' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Verify</span>
              </button>

              <button
                type="button"
                onClick={() => setVerificationAction('reject')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  verificationAction === 'reject' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Submission</span>
              </button>
            </div>

            <form onSubmit={handleExecuteVerification} className="space-y-4 text-xs">
              {verificationAction === 'approve' ? (
                <div className="space-y-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                  <p className="text-2xs text-emerald-900 font-medium">
                    Approving will update status to <strong>Verified</strong> in Firestore and dispatch an approval email to <strong>{verifyModalDonation.email}</strong>.
                  </p>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Admin Remarks (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Bank statement confirmed"
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-rose-50/60 p-4 rounded-2xl border border-rose-100">
                  <p className="text-2xs text-rose-900 font-medium">
                    Rejecting will update status to <strong>Rejected</strong> and dispatch a notification email detailing the reason to <strong>{verifyModalDonation.email}</strong>.
                  </p>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Rejection Reason *</label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium outline-none"
                    >
                      <option value="Invalid or unmatched UTR / Transaction ID">Invalid or unmatched UTR / Transaction ID</option>
                      <option value="Illegible payment screenshot proof">Illegible payment screenshot proof</option>
                      <option value="Duplicate donation submission">Duplicate donation submission</option>
                      <option value="Payment not credited to bank account">Payment not credited to bank account</option>
                      <option value="Other">Other / Custom Reason</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingVerification}
                  className={`flex-1 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    verificationAction === 'approve' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {isSubmittingVerification ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm & Dispatch Email</span>}
                </button>

                <button type="button" onClick={() => setVerifyModalDonation(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROOF SCREENSHOT VIEWER MODAL */}
      {/* ========================================================================= */}
      {proofViewerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Payment Screenshot Proof</span>
              </h3>
              <button onClick={() => setProofViewerUrl(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 flex items-center justify-center p-2 min-h-[300px]">
              <img src={proofViewerUrl} alt="Payment Proof" className="max-h-[60vh] max-w-full object-contain rounded-lg" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a href={proofViewerUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#123B5D] hover:underline font-bold flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4" />
                <span>Open High-Res Original</span>
              </a>
              <button onClick={() => setProofViewerUrl(null)} className="bg-slate-100 text-slate-700 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedDonation && !showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-3xs font-black text-[#C52B75] uppercase bg-pink-50 px-2.5 py-1 rounded-full border border-pink-100">
                  Donation Record Audit
                </span>
                <h3 className="text-lg font-serif font-black text-slate-900 mt-1">Donation Details</h3>
              </div>
              <button onClick={() => setSelectedDonation(null)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center"><span className="text-slate-400 uppercase text-3xs font-bold">Reference ID</span><span className="font-mono font-bold text-[#C52B75]">{selectedDonation.id}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-400 uppercase text-3xs font-bold">Status</span><StatusBadge status={selectedDonation.status} /></div>
              <div className="flex justify-between items-center"><span className="text-slate-400 uppercase text-3xs font-bold">Amount</span><span className="font-black text-emerald-700 text-sm">{selectedDonation.amount}</span></div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">Donor Details</h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Name</span><span className="font-bold text-slate-900">{selectedDonation.donor}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Email</span><span className="font-medium text-slate-800 break-all">{selectedDonation.email || 'N/A'}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Mobile</span><span className="font-medium text-slate-800">{selectedDonation.mobile || 'N/A'}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">PAN</span><span className="font-mono font-bold text-slate-900">{selectedDonation.pan}</span></div>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">Payment Info</h4>
              <div className="grid grid-cols-2 gap-3 bg-pink-50/40 p-3.5 rounded-2xl border border-pink-100">
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Method</span><span className="font-bold text-slate-800">{selectedDonation.paymentMethod}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">UTR Number</span><span className="font-mono font-bold text-amber-900">{selectedDonation.utrNumber}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Date</span><span className="font-medium text-slate-800">{selectedDonation.date}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Purpose</span><span className="font-medium text-slate-800">{selectedDonation.purpose}</span></div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2 border-t border-slate-100">
              {(selectedDonation.status === 'Verified' || selectedDonation.status === 'Successful') && (
                <button onClick={() => setShowPrintModal(true)} className="flex-1 bg-[#123B5D] hover:bg-[#0E2F4A] text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                  <Printer className="w-4 h-4 text-emerald-300" />
                  <span>Download Receipt</span>
                </button>
              )}
              <button onClick={() => setSelectedDonation(null)} className="bg-slate-100 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 80G RECEIPT PRINT MODAL */}
      {/* ========================================================================= */}
      {showPrintModal && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-slate-200 max-h-[95vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Official Life Vision 80G Tax Exemption Receipt</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-xs" id="admin-80g-receipt">
              <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
                <img src="/image/logo.png" alt="Life Vision Logo" className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="font-black text-sm text-slate-900">LIFE VISION SOCIETY</h4>
                  <p className="text-3xs text-slate-500 font-medium">Reg. No: HR/2019/0233651 | 80G Reg: AABAL5246RE20251</p>
                  <p className="text-3xs text-slate-500">Odisha, India | support.lifevision@gmail.com</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Donation ID</span><span className="font-mono font-bold text-[#C52B75]">{selectedDonation.id}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Date</span><span className="font-bold text-slate-800">{selectedDonation.date}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Donor Name</span><span className="font-bold text-slate-900">{selectedDonation.donor}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">Amount Donated</span><span className="font-black text-emerald-700 text-sm">{selectedDonation.amount}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">UTR / Reference ID</span><span className="font-mono font-bold text-slate-800 text-2xs">{selectedDonation.utrNumber}</span></div>
                <div><span className="text-3xs text-slate-400 font-bold block uppercase">PAN Number</span><span className="font-mono font-bold text-slate-800">{selectedDonation.pan}</span></div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-3xs text-slate-600 font-medium">
                Tax exemption under Section 80G of Income Tax Act 1961 is applicable. Life Vision Society acknowledges receipt of this contribution.
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button onClick={() => window.print()} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                <Printer className="w-4 h-4" />
                <span>Print / Download PDF</span>
              </button>
              <button onClick={() => setShowPrintModal(false)} className="bg-slate-100 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
