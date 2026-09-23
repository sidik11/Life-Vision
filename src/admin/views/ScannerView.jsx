import React from 'react';
import { QrCode, Printer, Download, ShieldCheck } from 'lucide-react';

export default function ScannerView({ showToast }) {
  const handlePrintScanner = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* 1. Header Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Official NGO Administration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-serif">
            Official NGO QR Scanner Poster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Official pre-designed Life Vision Society QR Scanner poster ready for viewing and printing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <a
            href="/image/payment scanner.jpeg"
            download="Life_Vision_Society_Official_Payment_Scanner.jpeg"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-300"
          >
            <Download className="w-4 h-4" />
            <span>Download Poster</span>
          </a>

          <button
            onClick={handlePrintScanner}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print NGO Poster</span>
          </button>
        </div>
      </div>

      {/* 2. SCREEN PREVIEW VIEW (Hidden when printing) */}
      <div className="max-w-3xl mx-auto print:hidden">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-6 space-y-4 flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 text-slate-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official QR Poster Preview</span>
            </div>
            
            <button
              onClick={handlePrintScanner}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Poster</span>
            </button>
          </div>

          {/* Display Scanner.png Image */}
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2 sm:p-4">
            <img 
              src="/image/payment scanner.jpeg" 
              alt="Life Vision Society Official QR Scanner Poster" 
              className="max-h-[75vh] w-auto object-contain rounded-xl shadow-md"
            />
          </div>

        </div>
      </div>

      {/* 3. PRINT-ONLY VIEW: Prints ONLY the Scanner.png image */}
      <div className="hidden print:flex fixed inset-0 bg-white items-center justify-center p-0 m-0 z-[99999]">
        <img 
          src="/image/payment scanner.jpeg" 
          alt="Life Vision Society Official QR Scanner Poster" 
          className="w-full h-auto max-h-screen object-contain mx-auto my-auto"
        />
      </div>

    </div>
  );
}
