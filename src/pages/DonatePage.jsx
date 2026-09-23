import React, { useState } from 'react';
import { Heart, ShieldCheck, CheckCircle2, User, Mail, Phone, Calendar, CreditCard, MapPin, Globe, Building, Hash, PhoneCall, IndianRupee, QrCode, Copy, Sparkles, Award, Users, BookOpen, ChevronLeft, ChevronRight, Scissors, Upload, FileText, Landmark } from 'lucide-react';
import { submitDonationRecord, checkDuplicateUtr } from '../utils/donationService';

export default function DonatePage({ onOpenApply }) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [amount, setAmount] = useState('2000');
  const [customAmount, setCustomAmount] = useState('');
  const [consent, setConsent] = useState(true);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('scanner'); // 'scanner' | 'bank'
  const [utrNo, setUtrNo] = useState('');
  const [paymentApp, setPaymentApp] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isEnlargedQr, setIsEnlargedQr] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    panNo: '',
    purpose: 'Women Empowerment & Tailoring Kits',
    message: '',
    country: 'India',
    state: '',
    city: '',
    address: '',
    pincode: ''
  });

  const [formError, setFormError] = useState('');
  const presetAmounts = ['500', '1000', '2000', '5000', '10000'];

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('89139301@ubin');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Screenshot file size exceeds 10MB limit. Please upload a smaller image file.');
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setFormError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName || !formData.email || !formData.mobile || !formData.address || !formData.state) {
      setFormError('Please fill in all required donor details (Name, Email, Mobile, Address, State).');
      return;
    }

    if (!utrNo || !utrNo.trim()) {
      setFormError('Transaction UTR / Reference ID is MANDATORY. Please enter your 12-digit UPI UTR or Bank Reference ID.');
      return;
    }

    if (!screenshotFile) {
      setFormError('Payment Screenshot is MANDATORY. Please upload a clear screenshot of your completed payment transaction.');
      return;
    }

    if (formData.panNo && formData.panNo.trim() !== '') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.panNo.trim())) {
        setFormError('Invalid PAN format. Standard format: 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Frontend & Database Duplicate UTR check
      const isDuplicate = await checkDuplicateUtr(utrNo);
      if (isDuplicate) {
        setIsSubmitting(false);
        setFormError(`Duplicate Transaction Error: A donation with UTR / Reference ID "${utrNo.trim()}" has already been submitted.`);
        return;
      }

      // 2. Submit to Firebase Firestore & Storage
      const record = await submitDonationRecord({
        donorName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        state: formData.state,
        panNumber: formData.panNo,
        amount: amount,
        donationPurpose: formData.purpose,
        paymentMethod: paymentMethod === 'bank' ? 'Bank Transfer' : 'UPI Scanner',
        utrNumber: utrNo,
        paymentApp: paymentApp || (paymentMethod === 'bank' ? 'Union Bank A/C' : 'UPI App'),
        bankName: paymentMethod === 'bank' ? 'Union Bank' : 'UPI',
        screenshotFile
      });

      setIsSubmitting(false);
      setSubmittedRecord(record);
      setSubmitted(true);
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err?.message || 'Failed to submit donation. Please check your network and try again.');
    }
  };

  const handleInputChange = (field, value) => {
    let finalVal = value;
    if (field === 'panNo') {
      finalVal = String(value).toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [field]: finalVal }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const impactTiers = [
    {
      amount: '₹ 1,000',
      title: 'Trainee Fabric & Raw Materials',
      desc: 'Provides 1 month of sewing materials, practice cloth, and pattern cutting tools for a tailoring student.'
    },
    {
      amount: '₹ 2,500',
      title: 'Beautician Starter Toolkit',
      desc: 'Sponsors a complete professional beauty kit, skincare materials, and makeup tools for 1 woman trainee.'
    },
    {
      amount: '₹ 5,000',
      title: 'Full Garment Construction Course',
      desc: 'Funds a complete 20-day certified tailoring course including machine maintenance and boutique support.'
    },
    {
      amount: '₹ 10,000',
      title: 'Rural Community Health Camp',
      desc: 'Sponsors a free medical check-up camp, doctor consultation, and medicine distribution for 50 rural families.'
    }
  ];

  return (
    <div className="bg-[#FFF7F6] min-h-screen py-10 animate-fade-in font-sans space-y-16">
      
      {/* Hero Banner Header (Single Image) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden min-h-[380px] lg:min-h-[420px] flex flex-col justify-between border border-pink-900/40">
          
          {/* Single Static Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/image/donate pic.png"
              alt="Donate & Support Hero"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/30 z-10 pointer-events-none" />
          </div>

          {/* Banner Content */}
          <div className="max-w-4xl space-y-4 relative z-20">
            <span className="text-xs font-black text-pink-200 tracking-wider bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-xs font-serif inline-block">
              Transforming Lives Together
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight drop-shadow-md">
              Donate & Support
            </h1>
            <p className="text-pink-200 font-bold text-lg sm:text-xl drop-shadow-xs font-serif">
              Your Generosity Powers Women Empowerment & Community Livelihoods
            </p>
            <p className="text-xs sm:text-sm lg:text-base text-pink-100/90 leading-relaxed pt-2 font-medium max-w-3xl drop-shadow-xs">
              Every single contribution directly funds vocational sewing machines, beauty wellness toolkits, free rural health camps, and youth digital literacy programs across Odisha.
            </p>
          </div>

          {/* Subtitle Badge Bar */}
          <div className="relative z-20 pt-6 border-t border-white/20 mt-6 flex items-center justify-between">
            <span className="text-xs font-bold text-pink-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C52B75]" />
              <span>50% Tax Exemption Eligible under Section 80G</span>
            </span>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* 1. WHY WE NEED YOUR SUPPORT & WHAT YOUR DONATION DOES */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-pink-100/80 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100 inline-block font-serif">
              Transparent Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#6B1D52] tracking-wide">
              Why We Need Your Support
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              In rural and semi-urban communities, thousands of women and youth lack financial autonomy and vocational training. Your donation bridges this gap by offering market-relevant skill development and sustainable job placement.
            </p>
          </div>

          {/* Impact Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#FFF7F6] border border-pink-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-[#C52B75] flex items-center justify-center font-bold">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-black text-[#6B1D52]">Vocational Training</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Providing industrial sewing machines and beauty tools for hands-on practical learning.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF7F6] border border-pink-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6B1D52] flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-black text-[#6B1D52]">Healthcare Camps</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Organizing free preventive health check-ups and medicine distribution in underserved areas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF7F6] border border-pink-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-black text-[#6B1D52]">Youth Livelihoods</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Empowering young men and women with computer literacy and direct job matchmaking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF7F6] border border-pink-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-black text-[#6B1D52]">Boutique Incubation</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Assisting certified trainees with micro-loans and guidance to launch independent parlors and shops.
              </p>
            </div>
          </div>

          {/* Impact Tiers */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-serif font-black text-[#6B1D52] tracking-wide text-center">
              What Your Donation Accomplishes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {impactTiers.map((tier, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-pink-100 shadow-2xs space-y-2 hover:border-pink-300 transition-all">
                  <span className="text-lg font-serif font-black text-[#C52B75] block">{tier.amount}</span>
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-wide font-serif">{tier.title}</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. SIDE-BY-SIDE LAYOUT: DONATION FORM (LEFT) & BANK ACCOUNT DETAILS (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: ONLINE DONATION FORM (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-pink-100 space-y-8">
            <div className="text-left space-y-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-black text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100 inline-block font-serif">
                Online Donation Form
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52] tracking-tight">
                Support the Cause
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Fill in your details below to proceed with your online donation and generate an instant 80G tax receipt.
              </p>
            </div>

            {/* Compact Success Pop-Up Modal */}
            {submitted && submittedRecord && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans">
                <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl relative border border-emerald-100 space-y-4 text-center animate-scale-up">
                  
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-black text-slate-900">
                      Payment Submitted
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Thank you for your donation! We have received your details. We will verify your payment and update you shortly.
                    </p>
                  </div>

                  <div className="bg-pink-50/70 p-3 rounded-xl border border-pink-200 text-xs text-center space-y-0.5 font-mono">
                    <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Donation Reference ID</span>
                    <span className="font-bold text-[#C52B75] text-sm">{submittedRecord.donationId}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setSubmittedRecord(null);
                      setUtrNo('');
                      setScreenshotFile(null);
                      setScreenshotPreview(null);
                    }}
                    className="w-full bg-[#C52B75] hover:bg-[#6B1D52] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Close
                  </button>

                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">

                {/* Payment Method Selector Tabs */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-800 tracking-wide">
                    Choose Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('scanner')}
                      className={`py-3 px-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === 'scanner'
                          ? 'bg-[#C52B75] text-white border-[#C52B75] shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Scan & Pay via UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`py-3 px-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === 'bank'
                          ? 'bg-[#6B1D52] text-white border-[#6B1D52] shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Landmark className="w-4 h-4" />
                      <span>Bank Transfer</span>
                    </button>
                  </div>
                </div>

                {/* Amount Selector */}
                <div className="space-y-3 bg-[#FFF7F6] p-4 sm:p-5 rounded-2xl border border-pink-100">
                  <label className="block text-xs font-extrabold text-slate-800 tracking-wide">
                    Select Donation Amount (₹) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {presetAmounts.map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => {
                          setAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          amount === amt && !customAmount
                            ? 'bg-gradient-to-r from-[#C52B75] to-[#6B1D52] text-white border-[#C52B75] shadow-md scale-102'
                            : 'bg-white border-pink-200 text-slate-700 hover:bg-pink-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="pagePresetAmount" 
                          checked={amount === amt && !customAmount} 
                          readOnly 
                          className="accent-[#C52B75]"
                        />
                        <span>₹ {amt}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Or Enter Custom Amount (₹)"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount(e.target.value);
                      }}
                      className="w-full px-4 py-3 text-xs sm:text-sm border border-pink-200 bg-white rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                    />
                  </div>
                </div>

                {/* SCAN & PAY VIA UPI CONTENT */}
                {paymentMethod === 'scanner' && (
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200 space-y-4 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div 
                        onClick={() => setIsEnlargedQr(true)}
                        className="relative group cursor-pointer shrink-0 bg-white p-2 rounded-2xl border border-pink-200 shadow-sm hover:shadow-md transition-all"
                      >
                        <img 
                          src="/image/payment scanner.jpeg" 
                          alt="Official Payment Scanner QR Code" 
                          className="w-36 h-36 object-contain rounded-xl"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 rounded-2xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                          <span className="text-3xs bg-white text-slate-900 font-bold px-2 py-1 rounded-full shadow-xs">Click to Enlarge</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-left w-full">
                        <span className="text-3xs font-extrabold tracking-wider text-[#C52B75] uppercase bg-pink-100 px-2.5 py-0.5 rounded-full inline-block">
                          Official UPI Scanner
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 font-serif">
                          Scan QR Code with GPay, PhonePe, Paytm, BHIM
                        </h4>
                        <p className="text-2xs text-slate-600 font-medium">
                          Scan the QR code to transfer your donation. After payment, submit your UTR ID and screenshot below for verification.
                        </p>
                        
                        <div className="flex items-center justify-between bg-white border border-pink-200 rounded-xl p-2 max-w-xs">
                          <span className="text-xs font-mono font-bold text-slate-800">
                            89139301@ubin
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="px-2.5 py-1 bg-[#C52B75] hover:bg-[#6B1D52] text-white text-3xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BANK TRANSFER CONTENT */}
                {paymentMethod === 'bank' && (
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-2xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-amber-400" />
                        <span>Life Vision Society Official Bank Account</span>
                      </span>
                      <span className="text-3xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md">Union Bank</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium pt-1">
                      <p><span className="text-slate-400 font-bold">Account Name:</span> <span className="text-white font-bold">Life Vision Society</span></p>
                      <p><span className="text-slate-400 font-bold">Account Number:</span> <span className="font-mono text-amber-300 font-extrabold select-all">581101010050231</span></p>
                      <p><span className="text-slate-400 font-bold">Bank Name:</span> <span className="text-white font-bold">Union Bank</span></p>
                      <p><span className="text-slate-400 font-bold">Branch:</span> <span className="text-white">Narnaul</span></p>
                      <p><span className="text-slate-400 font-bold">IFSC Code:</span> <span className="font-mono text-amber-300 font-extrabold select-all">UBIN0558117</span></p>
                    </div>

                    <p className="text-3xs text-slate-400 pt-1 border-t border-slate-800/80">
                      Transfer funds via NEFT, RTGS, IMPS, or NetBanking. Kindly upload the bank transaction receipt below.
                    </p>
                  </div>
                )}

                {/* MANDATORY TRANSACTION & SCREENSHOT DETAILS */}
                <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-4">
                  <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider font-serif flex items-center gap-1.5 border-b border-amber-200 pb-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span>Mandatory Transaction Proof & UTR ID</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Transaction UTR / Reference ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="12-digit UTR/Ref ID (e.g., 426182910394)"
                        value={utrNo}
                        onChange={(e) => setUtrNo(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-amber-300 bg-white rounded-xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 outline-none font-mono font-bold text-slate-900"
                      />
                      <span className="text-3xs text-slate-500 mt-1 block">Mandatory for verification check</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        Payment App / Bank Used (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Google Pay, PhonePe, Paytm, Union Bank"
                        value={paymentApp}
                        onChange={(e) => setPaymentApp(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-amber-200 bg-white rounded-xl focus:ring-2 focus:ring-amber-500/30 outline-none font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* MANDATORY SCREENSHOT FILE UPLOAD */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Upload Payment Screenshot *
                    </label>
                    <div className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white rounded-2xl p-4 text-center transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleScreenshotChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      />
                      {screenshotPreview ? (
                        <div className="flex items-center justify-between gap-3">
                          <img src={screenshotPreview} alt="Payment Proof Preview" className="w-14 h-14 object-cover rounded-xl border border-amber-200 shadow-2xs" />
                          <div className="text-left flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{screenshotFile?.name}</p>
                            <p className="text-3xs text-emerald-700 font-bold">✓ Screenshot attached</p>
                          </div>
                          <span className="text-2xs font-bold text-amber-700 hover:underline">Change File</span>
                        </div>
                      ) : (
                        <div className="space-y-1 py-1">
                          <Upload className="w-6 h-6 text-amber-600 mx-auto" />
                          <p className="text-xs font-bold text-slate-800">Click to upload payment screenshot *</p>
                          <p className="text-3xs text-slate-500">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Donor Details Fields Grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold tracking-wider text-slate-800 flex items-center gap-1.5 font-serif border-b border-slate-100 pb-2">
                    <User className="w-4 h-4 text-[#C52B75]" />
                    <span>Required Donor Information</span>
                  </h3>

                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 animate-fade-in">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Email ID *</label>
                      <input
                        type="email"
                        required
                        placeholder="Email ID"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile No *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Mobile No"
                        value={formData.mobile}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Select State *</label>
                      <input
                        type="text"
                        required
                        placeholder="State (e.g. Odisha)"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        PAN Number (For 80G Tax Benefit)
                      </label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        value={formData.panNo}
                        onChange={(e) => handleInputChange('panNo', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none uppercase tracking-wider font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Donation Purpose *</label>
                      <select
                        value={formData.purpose}
                        onChange={(e) => handleInputChange('purpose', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                      >
                        <option value="Women Empowerment & Tailoring Kits">Women Empowerment & Tailoring Kits</option>
                        <option value="Student Study & Placement Aid">Student Study & Placement Aid</option>
                        <option value="Community Healthcare Camps">Community Healthcare Camps</option>
                        <option value="General Support & Welfare">General Support & Welfare</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Residential / Commercial Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#C52B75] rounded border-slate-300 focus:ring-[#C52B75] accent-[#C52B75]"
                    required
                  />
                  <span className="text-2xs sm:text-xs text-slate-600 font-medium leading-normal">
                    I confirm that I am an Indian citizen and agree to receive transaction verification updates from Life Vision Society.
                  </span>
                </label>

                {/* Submit Button */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm tracking-wide active:scale-98 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Uploading & Verifying UTR...' : `Submit Donation Details (₹${amount || '2000'})`}</span>
                    <Heart className="w-4 h-4 fill-white" />
                  </button>

                  <div className="bg-amber-400 text-slate-950 font-extrabold py-3 px-4 rounded-2xl text-center shadow-xs flex items-center justify-center gap-2 text-xs tracking-wide">
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>Helpline : +91 9416362914</span>
                  </div>
                </div>

              </form>
          </div>

          {/* RIGHT COLUMN: OFFICIAL PAYMENT QR SCANNER & BANK ACCOUNT DETAILS (lg:col-span-5) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            
            {/* OFFICIAL PAYMENT QR SCANNER CARD */}
            <div className="bg-gradient-to-br from-white via-pink-50/40 to-purple-50/30 rounded-3xl p-6 border border-pink-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-pink-100 pb-3">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-[#C52B75]" />
                  <h3 className="text-lg font-serif font-black text-[#6B1D52]">
                    Scan & Pay via UPI
                  </h3>
                </div>
                <span className="text-3xs font-extrabold text-[#C52B75] bg-pink-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Instant Payment
                </span>
              </div>

              {/* QR Image Display */}
              <div 
                onClick={() => setIsEnlargedQr(true)}
                className="relative group cursor-pointer bg-white p-3 rounded-2xl border border-pink-200 shadow-sm flex flex-col items-center hover:shadow-lg transition-all"
              >
                <img 
                  src="/image/payment scanner.jpeg" 
                  alt="Life Vision Society Official Payment Scanner" 
                  className="w-full max-w-[240px] h-auto object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/30 rounded-2xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                  <span className="text-xs bg-white text-slate-900 font-extrabold px-3 py-1.5 rounded-full shadow-md">
                    🔍 Click to Enlarge
                  </span>
                </div>
              </div>

              {/* Copyable UPI Box */}
              <div className="bg-white rounded-2xl border border-pink-200 p-3 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-3xs text-slate-400 font-bold uppercase block tracking-wider">UPI ID</span>
                  <span className="text-sm font-mono font-black text-slate-900">89139301@ubin</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 bg-[#C52B75] hover:bg-[#6B1D52] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                </button>
              </div>

              {/* Supported Apps */}
              <p className="text-2xs text-slate-500 font-medium text-center">
                Accepts Google Pay, PhonePe, Paytm, BHIM, Amazon Pay & any UPI application.
              </p>
            </div>

            {/* SOCIETY OFFICIAL BANK ACCOUNT DETAILS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-6">
              
              {/* Account Details Heading */}
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#E05638] tracking-tight">
                  Account Details
                </h3>
                
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  General A/C:
                </h4>

                <div className="space-y-2 text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                  <p><span className="font-bold text-slate-900">Name -</span> Life Vision Society</p>
                  <p><span className="font-bold text-slate-900">Ac. No -</span> 581101010050231</p>
                  <p><span className="font-bold text-slate-900">Bank -</span> Union Bank</p>
                  <p><span className="font-bold text-slate-900">Branch -</span> Narnaul</p>
                  <p><span className="font-bold text-slate-900">IFSC -</span> UBIN0558117</p>
                </div>
              </div>

              {/* 80G Tax Exemption Receipt Section */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <p className="text-sm sm:text-base font-bold text-slate-900 italic">
                  *80G Tax Exemption Receipt*
                </p>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  After transferring funds, kindly email your payment screenshot and PAN to <a href="mailto:support.lifevision@gmail.com" className="font-bold text-[#C52B75] hover:underline">support.lifevision@gmail.com</a> for your 80G tax receipt.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Scanner Modal */}
      {isEnlargedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-center">
            <button
              onClick={() => setIsEnlargedQr(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              ✕
            </button>
            <h3 className="text-lg font-serif font-black text-[#6B1D52]">Official UPI Payment QR</h3>
            <img 
              src="/image/payment scanner.jpeg" 
              alt="Official Payment Scanner Enlarge" 
              className="w-full h-auto object-contain rounded-2xl border border-slate-200 shadow-md"
            />
            <div className="bg-pink-50 p-2.5 rounded-xl border border-pink-100 flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-900">89139301@ubin</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2.5 py-1 bg-[#C52B75] text-white font-bold rounded-lg text-2xs"
              >
                {copiedUpi ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
