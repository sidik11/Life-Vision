import React from 'react';
import { X, Award, CheckCircle2, Download, Printer, ShieldCheck, QrCode } from 'lucide-react';

export default function CertificateModal({ certificate, onClose, onShowToast }) {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (onShowToast) onShowToast(`Downloaded Official Certificate ${certificate.certNo} (PDF)`, 'success');
  };

  const verifyUrl = `${window.location.origin}/#/verify-certificate/${certificate.certNo}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto space-y-0 text-slate-900 font-sans">
        
        {/* Modal Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 border border-amber-200 text-amber-800 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">Official Certificate Preview</h3>
              <p className="text-xs text-slate-500 font-mono">Certificate No: {certificate.certNo}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-pink-400" />
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Certificate Graphic Card */}
        <div className="p-6 sm:p-10 bg-slate-100 flex justify-center">
          <div className="w-full max-w-3xl bg-white border-8 border-amber-500/60 rounded-2xl p-8 sm:p-12 relative shadow-xl text-center space-y-6 overflow-hidden">
            {/* Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500" />

            {/* Header */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <img src="/image/logo.png" alt="LVS Logo" className="h-16 w-auto object-contain" />
              <h2 className="text-xl font-black tracking-wider uppercase text-slate-900">
                LIFE VISION SOCIETY
              </h2>
              <p className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                National Vocational Skill Training & Women Empowerment Division
              </p>
            </div>

            {/* Title */}
            <div className="py-2 border-y border-amber-400/40 max-w-md mx-auto">
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 tracking-wide">
                Certificate of Excellence
              </h1>
            </div>

            {/* Main Text */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <p className="italic text-slate-500">This is proudly presented to</p>
              
              <div className="text-2xl sm:text-3xl font-bold text-pink-700 tracking-wide font-serif py-1 underline decoration-pink-300">
                {certificate.student}
              </div>

              <p className="max-w-xl mx-auto leading-relaxed">
                for successfully completing the intensive professional vocational course in <br />
                <strong className="text-slate-900 font-bold text-sm sm:text-base">{certificate.course}</strong> <br />
                with a final assessment grade of <strong className="text-emerald-700 font-extrabold">{certificate.grade || 'A+'}</strong>.
              </p>
            </div>

            {/* Footer Signatures & QR Code */}
            <div className="pt-8 grid grid-cols-3 gap-4 items-end border-t border-slate-200 text-xs">
              <div className="text-center space-y-1">
                <div className="h-10 flex items-center justify-center italic text-pink-700 font-serif font-bold text-sm">
                  Dr. Sunita Sharma
                </div>
                <div className="pt-1 border-t border-slate-300 text-[10px] font-bold text-slate-600">
                  President & Founder, LVS
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-1">
                {/* QR Code Container */}
                <div className="p-2 bg-white border border-slate-300 rounded-xl shadow-xs flex flex-col items-center">
                  <QrCode className="w-10 h-10 text-slate-900" />
                  <span className="text-[8px] font-mono text-slate-500 mt-1">SCAN TO VERIFY</span>
                </div>
                <a
                  href={`/#/verify-certificate/${certificate.certNo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] font-mono text-pink-700 hover:underline font-bold"
                >
                  Verify Online
                </a>
              </div>

              <div className="text-center space-y-1">
                <div className="h-10 flex items-center justify-center italic text-sky-700 font-serif font-bold text-sm">
                  Priya Ranjita Das
                </div>
                <div className="pt-1 border-t border-slate-300 text-[10px] font-bold text-slate-600">
                  Director of Training
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
