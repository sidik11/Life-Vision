import React from 'react';
import { X, CheckCircle2, Printer } from 'lucide-react';

export default function DonationReceiptModal({ isOpen, onClose, donationRecord }) {
  if (!isOpen || !donationRecord) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative border border-pink-100 max-h-[95vh] overflow-y-auto space-y-5">
        
        {/* Header Close Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900">Donation Receipt Document</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        <div className="text-center space-y-2 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-serif font-black text-emerald-950">Donation Successful ❤️</h2>
          <p className="text-xs sm:text-sm font-bold text-emerald-800">
            Thank you for supporting Life Vision Society.
          </p>
        </div>

        {/* Printable Official 80G Receipt Document */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-xs relative overflow-hidden" id="printable-80g-receipt">
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
            <img src="/image/logo.png" alt="Life Vision Logo" className="w-12 h-12 object-contain" />
            <div>
              <h4 className="font-black text-sm text-slate-900 tracking-tight">LIFE VISION SOCIETY</h4>
              <p className="text-3xs text-slate-500 font-medium">Reg. No: HR/2019/0233651 | 80G Reg: AABAL5246RE20251</p>
              <p className="text-3xs text-slate-500">Odisha, India | support.lifevision@gmail.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-3xs text-slate-400 font-bold block uppercase">Donation ID</span>
              <span className="font-mono font-bold text-[#C52B75]">{donationRecord.id}</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-bold block uppercase">Date</span>
              <span className="font-bold text-slate-800">{donationRecord.date}</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-bold block uppercase">Donor Name</span>
              <span className="font-bold text-slate-900">{donationRecord.donor}</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-bold block uppercase">Amount Donated</span>
              <span className="font-black text-emerald-700 text-sm">{donationRecord.amount}</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-bold block uppercase">Payment ID</span>
              <span className="font-mono font-medium text-slate-800 text-2xs truncate block">{donationRecord.paymentId}</span>
            </div>
            <div>
              <span className="text-3xs text-slate-400 font-bold block uppercase">PAN Number</span>
              <span className="font-mono font-bold text-slate-800">{donationRecord.pan}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-3xs text-slate-600 leading-relaxed font-medium">
            80G tax benefit is subject to the eligibility of the donor, the NGO's valid 80G registration, and applicable income-tax rules.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Download Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#C52B75] hover:opacity-90 text-white text-xs font-bold py-3 px-6 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
