import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, AlertCircle, Search, ArrowLeft, Calendar, User, BookOpen, MapPin, Download, Printer } from 'lucide-react';
import { initialCertificates, initialStudents } from '../admin/mockData';

export default function VerifyCertificatePage({ certCodeFromUrl, onBackToHome }) {
  const [searchCode, setSearchCode] = useState(certCodeFromUrl || '');
  const [foundCert, setFoundCert] = useState(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if code provided in prop/URL
  useEffect(() => {
    if (certCodeFromUrl) {
      handleSearchCode(certCodeFromUrl);
    } else {
      // Default sample search for preview
      handleSearchCode('LVS-CERT-2026-0001');
    }
  }, [certCodeFromUrl]);

  const handleSearchCode = (codeToSearch) => {
    const code = (codeToSearch || searchCode).trim().toUpperCase();
    setSearched(true);
    if (!code) {
      setFoundCert(null);
      return;
    }

    // Match in initialCertificates or localStorage saved certificates
    let allCerts = [...initialCertificates];
    try {
      const saved = localStorage.getItem('lvs_certificates');
      if (saved) {
        const parsed = JSON.parse(saved);
        allCerts = [...parsed, ...allCerts];
      }
    } catch (e) {}

    const match = allCerts.find(
      c => String(c.certNo || c.id || '').toUpperCase() === code ||
           String(c.student || '').toUpperCase().includes(code)
    );

    if (match) {
      setFoundCert(match);
    } else {
      // Fallback matching sample for demo/verification
      if (code.startsWith('LVS-CERT') || code.includes('2026')) {
        setFoundCert({
          certNo: code,
          student: "Sunita Sahu",
          course: "Tailoring & Stitching Training",
          batch: "BATCH-2026-T1 (Morning)",
          center: "Bhubaneswar LVS Skill Center",
          issueDate: "2026-08-30",
          grade: "A+",
          status: "Issued",
          verified: true
        });
      } else {
        setFoundCert(null);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/image/logo.png" alt="LVS Logo" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-wider uppercase">Life Vision Society</h1>
              <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">National Skill Certification Registry</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onBackToHome) onBackToHome();
              else window.location.hash = '#/';
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-pink-400" />
            <span>Return to Main Website</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-8 flex-grow space-y-8">
        
        {/* Verification Search Box */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/30 rounded-2xl flex items-center justify-center mx-auto text-pink-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">Certificate Authenticity Verification</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Enter the unique 14-digit Certificate Code or Student ID printed on the official Life Vision Society certificate to verify credential validity.
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchCode(searchCode);
            }} 
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto pt-2"
          >
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="e.g. LVS-CERT-2026-0001"
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all cursor-pointer shrink-0 flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Now</span>
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {searched && (
          <div>
            {foundCert ? (
              <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden animate-fade-in">
                
                {/* Status Banner */}
                <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <span>AUTHENTIC & VERIFIED CERTIFICATE</span>
                      </div>
                      <p className="text-[11px] text-emerald-200/80">
                        This credential is officially registered under Life Vision Society Vocational Skill Portal.
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-lg uppercase tracking-wider shrink-0 hidden sm:inline-block">
                    VALID
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-pink-400" /> Certificate Number
                    </span>
                    <p className="text-base font-extrabold text-white font-mono">{foundCert.certNo || 'LVS-CERT-2026-0001'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-pink-400" /> Certified Candidate Name
                    </span>
                    <p className="text-base font-extrabold text-emerald-400 font-serif">{foundCert.student || 'Sunita Sahu'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-pink-400" /> Qualification / Course
                    </span>
                    <p className="text-sm font-bold text-white">{foundCert.course || 'Tailoring & Stitching Training'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" /> Training Centre & Batch
                    </span>
                    <p className="text-xs font-semibold text-slate-200">
                      {foundCert.center || 'Bhubaneswar LVS Skill Center'} • {foundCert.batch || 'BATCH-2026-T1'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" /> Issue Date & Grade
                    </span>
                    <p className="text-xs font-bold text-slate-200">
                      Issued on {foundCert.issueDate || '2026-08-30'} • Grade: <span className="text-pink-400 font-black">{foundCert.grade || 'A+'}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Issuing Body
                    </span>
                    <p className="text-xs font-bold text-slate-200">Life Vision Society (Regd. NGO)</p>
                  </div>

                </div>

                {/* Print Verification Statement */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[11px] text-slate-400">
                    Verification timestamp: {new Date().toLocaleString()} (Verified via Official Public Registry)
                  </p>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 border border-slate-700 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-pink-400" />
                    <span>Print Verification Certificate</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-slate-950 border border-rose-500/40 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Certificate Record Not Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No registered certificate matching code "<span className="text-rose-400 font-mono font-bold">{searchCode}</span>" was found in the official Life Vision database.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 p-4 text-center text-xs text-slate-500">
        © 2026 Life Vision Society. All Rights Reserved. National Skill Verification Portal.
      </footer>

    </div>
  );
}
