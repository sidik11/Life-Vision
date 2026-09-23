import React, { useState, useEffect } from 'react';
import { X, Heart, ShieldCheck, CheckCircle2, User, Mail, Phone, Calendar, CreditCard, MapPin, Globe, Building, Hash, PhoneCall, QrCode, Copy, Upload, FileText, Landmark, Clock } from 'lucide-react';
import { submitDonationRecord, checkDuplicateUtr } from '../utils/donationService';

export default function DonateModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState('2000');
  const [customAmount, setCustomAmount] = useState('');
  const [consent, setConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);
  
  const [paymentMethod, setPaymentMethod] = useState('scanner'); // 'scanner' | 'bank'
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNo, setUtrNo] = useState('');
  const [paymentApp, setPaymentApp] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const presetAmounts = ['500', '1000', '2000', '5000', '10000'];

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
        setFormError('Invalid PAN format (e.g. ABCDE1234F).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Check Duplicate UTR
      const isDuplicate = await checkDuplicateUtr(utrNo);
      if (isDuplicate) {
        setIsSubmitting(false);
        setFormError(`Duplicate Transaction Error: A donation with UTR / Reference ID "${utrNo.trim()}" has already been submitted.`);
        return;
      }

      // 2. Submit Record to Firestore & Storage
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
      setFormError(err?.message || 'Failed to submit donation. Please check network.');
    }
  };

  const handleInputChange = (field, value) => {
    let finalVal = value;
    if (field === 'panNo') {
      finalVal = String(value).toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [field]: finalVal }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative border border-pink-100 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100/90 hover:bg-slate-200 transition-colors cursor-pointer z-20 shadow-xs border border-slate-200/80"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4 animate-scale-up">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-serif font-black text-slate-900">
                Payment Submitted
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Thank you for your donation! We have received your details. We will verify your payment and update you shortly.
              </p>
            </div>

            <div className="bg-pink-50/70 p-3 rounded-xl border border-pink-200 max-w-xs mx-auto shadow-xs space-y-0.5 font-mono text-center">
              <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Donation Reference ID</span>
              <p className="text-sm font-bold text-[#C52B75]">
                {submittedRecord?.donationId || 'LVS-DON-2026-XXXX'}
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedRecord(null);
                  setUtrNo('');
                  setScreenshotFile(null);
                  setScreenshotPreview(null);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#C52B75] hover:bg-[#6B1D52] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Title */}
            <div className="text-center space-y-1 pr-10 sm:pr-12">
              <span className="text-xs font-black text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100 font-serif inline-block">
                Make a Difference
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#6B1D52] tracking-tight">
                Support the Cause
              </h2>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              
              {/* Payment Method Selector Tabs */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 tracking-wide">
                  Choose Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('scanner')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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

              {/* 1. Donation Amount Selector */}
              <div className="space-y-2.5 bg-[#FFF7F6] p-3.5 rounded-2xl border border-pink-100">
                <label className="block text-xs font-extrabold text-slate-800 tracking-wide">
                  Select Donation Amount (₹) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {presetAmounts.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-2.5 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        amount === amt && !customAmount
                          ? 'bg-gradient-to-r from-[#C52B75] to-[#6B1D52] text-white border-[#C52B75] shadow-xs'
                          : 'bg-white border-pink-200 text-slate-700 hover:bg-pink-50'
                      }`}
                    >
                      <span>₹ {amt}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Enter Custom Amount (₹)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 text-xs border border-pink-200 bg-white rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 outline-none font-medium"
                  />
                </div>
              </div>

              {/* If Scan & Pay via UPI is selected */}
              {paymentMethod === 'scanner' && (
                <div className="p-3.5 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200 space-y-2.5 animate-fade-in text-center">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <img 
                      src="/image/payment scanner.jpeg" 
                      alt="Official Payment Scanner QR Code" 
                      className="w-28 h-28 object-contain rounded-xl border border-pink-200 bg-white p-1 shadow-xs shrink-0 mx-auto"
                    />

                    <div className="space-y-1 text-left w-full">
                      <span className="text-3xs font-extrabold tracking-wider text-[#C52B75] uppercase bg-pink-100 px-2 py-0.5 rounded-full inline-block">
                        Direct UPI QR Scanner
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        Scan QR Code using any UPI App
                      </h4>
                      <p className="text-3xs text-slate-600 font-medium leading-relaxed">
                        Scan with GPay, PhonePe, Paytm, or BHIM. Submit your details below for verification.
                      </p>
                      
                      <div className="flex items-center justify-between bg-white border border-pink-200 rounded-xl p-1.5 max-w-xs">
                        <span className="text-xs font-mono font-bold text-slate-800">
                          89139301@ubin
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2 py-1 bg-[#C52B75] text-white text-3xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
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
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-3xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-amber-400" />
                      <span>Life Vision Society Bank Account</span>
                    </span>
                    <span className="text-3xs bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">Union Bank</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-2xs font-medium pt-0.5">
                    <p><span className="text-slate-400 font-bold">Ac. Name:</span> <span className="text-white font-bold">Life Vision Society</span></p>
                    <p><span className="text-slate-400 font-bold">Ac. No:</span> <span className="font-mono text-amber-300 font-extrabold select-all">581101010050231</span></p>
                    <p><span className="text-slate-400 font-bold">Bank:</span> <span className="text-white font-bold">Union Bank</span></p>
                    <p><span className="text-slate-400 font-bold">Branch:</span> <span className="text-white">Narnaul</span></p>
                    <p><span className="text-slate-400 font-bold">IFSC:</span> <span className="font-mono text-amber-300 font-extrabold select-all">UBIN0558117</span></p>
                  </div>
                </div>
              )}

              {/* MANDATORY TRANSACTION PROOF & UTR DETAILS */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <h4 className="text-3xs font-extrabold text-amber-950 uppercase tracking-wider font-serif flex items-center gap-1 border-b border-amber-200 pb-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>Mandatory Proof & UTR Reference ID</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs font-bold text-slate-800 mb-1">
                      Transaction UTR / Ref ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12-digit UTR/Ref ID *"
                      value={utrNo}
                      onChange={(e) => setUtrNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-amber-300 bg-white rounded-xl focus:ring-2 focus:ring-amber-500/30 outline-none font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-800 mb-1">
                      Payment App / Bank Used (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GPay, PhonePe, Bank"
                      value={paymentApp}
                      onChange={(e) => setPaymentApp(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-amber-200 bg-white rounded-xl focus:ring-2 focus:ring-amber-500/30 outline-none font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-800 mb-1">
                    Upload Payment Screenshot *
                  </label>
                  <div className="border-2 border-dashed border-amber-300 bg-white rounded-xl p-3 text-center transition-all relative">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleScreenshotChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    {screenshotPreview ? (
                      <div className="flex items-center justify-between gap-2">
                        <img src={screenshotPreview} alt="Screenshot Preview" className="w-10 h-10 object-cover rounded-lg border border-amber-200" />
                        <span className="text-2xs font-bold text-slate-900 truncate flex-1 text-left">{screenshotFile?.name}</span>
                        <span className="text-3xs font-bold text-amber-700">Change</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <Upload className="w-5 h-5 text-amber-600 mx-auto" />
                        <p className="text-2xs font-bold text-slate-800">Attach Payment Screenshot *</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Donor Personal Details Form Fields Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold tracking-wider text-slate-800 flex items-center gap-1.5 font-serif border-b border-slate-100 pb-1.5">
                  <User className="w-4 h-4 text-[#C52B75]" />
                  <span>Required Donor Details</span>
                </h3>

                {formError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 animate-fade-in">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Email ID *</label>
                    <input
                      type="email"
                      required
                      placeholder="Email ID"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Mobile No *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile No"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="State (e.g. Odisha)"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">PAN Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      value={formData.panNo}
                      onChange={(e) => handleInputChange('panNo', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 outline-none uppercase font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Donation Purpose *</label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 outline-none font-medium"
                    >
                      <option value="Women Empowerment & Tailoring Kits">Women Empowerment & Tailoring Kits</option>
                      <option value="Student Study & Placement Aid">Student Study & Placement Aid</option>
                      <option value="Community Healthcare Camps">Community Healthcare Camps</option>
                      <option value="General Support & Welfare">General Support & Welfare</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 outline-none"
                  />
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-3xs text-amber-900">
                <p className="font-extrabold leading-snug">
                  *Your contributions are eligible for 80G tax benefit under Life Vision Society non-profit registration*
                </p>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-[#C52B75] rounded border-slate-300 accent-[#C52B75]"
                  required
                />
                <span className="text-3xs text-slate-600 font-medium leading-normal">
                  I agree that Life Vision Society can contact me for transaction verification and updates.
                </span>
              </label>

              {/* Submit Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-black py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm tracking-wide active:scale-98 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Uploading & Verifying UTR...' : `Submit Donation Details (₹${amount || '2000'})`}</span>
                  <Heart className="w-4 h-4 fill-white" />
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
