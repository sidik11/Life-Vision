import React, { useState, useEffect } from 'react';
import { X, Heart, ShieldCheck, CheckCircle2, User, Mail, Phone, Calendar, CreditCard, MapPin, Globe, Building, Hash, PhoneCall } from 'lucide-react';
import { initiateRazorpayPayment } from '../utils/razorpayHandler';
import DonationReceiptModal from './DonationReceiptModal';

export default function DonateModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState('2000');
  const [customAmount, setCustomAmount] = useState('');
  const [consent, setConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedRecord, setCompletedRecord] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    dob: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName || !formData.email || !formData.mobile) {
      setFormError('Please fill in all required donor details.');
      return;
    }

    if (formData.panNo && formData.panNo.trim() !== '') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.panNo.trim())) {
        setFormError('Invalid PAN format (e.g. ABCDE1234F).');
        return;
      }
    }

    // Direct Launch of Razorpay System without intermediate modal
    initiateRazorpayPayment({
      donorData: formData,
      amount: amount,
      onStart: () => setIsSubmitting(true),
      onSuccess: (record) => {
        setIsSubmitting(false);
        setCompletedRecord(record);
      },
      onError: (msg) => {
        setIsSubmitting(false);
        setFormError(msg || 'Payment failed. Please try again.');
      },
      onCancel: () => {
        setIsSubmitting(false);
      }
    });
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
          <div className="text-center py-10 space-y-4 animate-scale-up">
            <div className="w-16 h-16 bg-pink-100 text-[#C52B75] rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-black text-[#6B1D52]">Thank You for Your Contribution!</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
              Your support empowers women and provides skill development for communities. An official 80G tax receipt will be issued and emailed to <span className="font-bold text-slate-800">{formData.email}</span>.
            </p>
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

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* 1. Donation Amount Selector */}
              <div className="space-y-3 bg-[#FFF7F6] p-4 sm:p-5 rounded-2xl border border-pink-100">
                <label className="block text-xs font-extrabold text-slate-800 tracking-wide">
                  Select Donation Amount (₹)
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
                        name="presetAmount" 
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
                    placeholder="Enter Other Amount (₹)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-pink-200 bg-white rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                  />
                </div>
              </div>

              {/* 2. Impact Callout Note */}
              <div className="p-3.5 bg-gradient-to-r from-[#6B1D52] to-[#4A1039] text-white text-center rounded-2xl shadow-xs">
                <p className="text-2xs sm:text-xs font-black tracking-wider text-pink-200">
                  Your donation will provide urgent vocational skill training & relief to empower lives
                </p>
              </div>

              {/* 3. Donor Personal Details Form Fields Grid */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-extrabold tracking-wider text-slate-800 flex items-center gap-1.5 font-serif border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-[#C52B75]" />
                  <span>Donor Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Enter Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Enter Email ID *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="Email ID"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Enter Mobile No *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="Mobile No"
                        value={formData.mobile}
                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Date of Birth (DOB) *</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">
                      PAN Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        value={formData.panNo}
                        onChange={(e) => handleInputChange('panNo', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none uppercase font-mono tracking-wider"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Donation *</label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none font-medium"
                    >
                      <option value="Women Empowerment & Tailoring Kits">Women Empowerment & Tailoring Kits</option>
                      <option value="Student Study & Placement Aid">Student Study & Placement Aid</option>
                      <option value="Community Healthcare Camps">Community Healthcare Camps</option>
                      <option value="General Support & Welfare">General Support & Welfare</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Country *</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">Select State *</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-700 mb-1">City *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Address *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Full Residential / Commercial Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-700 mb-1">Pincode *</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. 80G Tax Exemption Legal Disclaimer */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-2xs sm:text-xs text-amber-900 space-y-1">
                <p className="font-extrabold leading-snug">
                  *Your contributions are eligible for upto 50% tax benefit under Section 80G as Life Vision Society is registered as a non-profit organization*
                </p>
                <p className="font-bold text-amber-800 pt-0.5">
                  PAN: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">[YOUR_PAN_NUMBER]</span> | 80G NUMBER: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300">[YOUR_80G_REGISTRATION_NUMBER]</span>
                </p>
              </div>

              {/* 5. Communication Consent Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#C52B75] rounded border-slate-300 focus:ring-[#C52B75] accent-[#C52B75]"
                />
                <span className="text-2xs sm:text-xs text-slate-600 font-medium leading-normal">
                  You agree that Life Vision Society can reach out to you through Whatsapp/email/SMS/Phone to provide information of your donation, campaigns, 80G receipt etc.
                </span>
              </label>

              {/* 6. Action Submit Button & Helpline Banner */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-black py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base tracking-wide active:scale-98"
                >
                  <span>Submit & Proceed ₹{amount || '2000'}</span>
                  <Heart className="w-5 h-5 fill-white" />
                </button>

                <div className="bg-amber-400 text-slate-950 font-black py-3 px-4 rounded-2xl text-center shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide">
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  <span>Call Now : +91 9416362914</span>
                </div>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* Official 80G Receipt Modal on Success */}
      <DonationReceiptModal 
        isOpen={Boolean(completedRecord)} 
        onClose={() => {
          setCompletedRecord(null);
          onClose();
        }}
        donationRecord={completedRecord}
      />
    </div>
  );
}
