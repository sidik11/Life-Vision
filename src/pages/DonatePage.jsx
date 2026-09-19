import React, { useState } from 'react';
import { Heart, ShieldCheck, CheckCircle2, User, Mail, Phone, Calendar, CreditCard, MapPin, Globe, Building, Hash, PhoneCall, IndianRupee, QrCode, Copy, Sparkles, Award, Users, BookOpen, ChevronLeft, ChevronRight, Scissors } from 'lucide-react';
import RazorpayCheckoutModal from '../components/RazorpayCheckoutModal';

export default function DonatePage({ onOpenApply }) {
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [amount, setAmount] = useState('2000');
  const [customAmount, setCustomAmount] = useState('');
  const [consent, setConsent] = useState(true);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    dob: '',
    panNo: '',
    country: 'India',
    state: '',
    city: '',
    address: '',
    pincode: ''
  });

  const presetAmounts = ['2000', '4000', '8000', '16000'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowRazorpay(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

            {submitted ? (
              <div className="bg-pink-50 border border-pink-200 rounded-3xl p-8 text-center space-y-4 animate-scale-up">
                <div className="w-16 h-16 bg-[#C52B75] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-black text-[#6B1D52]">Thank You for Your Support!</h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  Your contribution of <span className="font-bold text-[#C52B75]">₹{amount}</span> has been recorded. An official 80G tax receipt will be issued and emailed to <span className="font-bold text-slate-900">{formData.email}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Amount Selector */}
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

                {/* Donor Details Fields Grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold tracking-wider text-slate-800 flex items-center gap-1.5 font-serif border-b border-slate-100 pb-2">
                    <User className="w-4 h-4 text-[#C52B75]" />
                    <span>Required Donor Information</span>
                  </h3>

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
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Pan No (For 80G Benefit)</label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={formData.panNo}
                        onChange={(e) => handleInputChange('panNo', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-[#FFF7F6]/40 rounded-xl focus:ring-2 focus:ring-[#C52B75]/30 focus:border-[#C52B75] outline-none"
                      />
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
                    I confirm that I am an Indian citizen and agree to receive transaction updates and 80G tax receipt from Life Vision Society.
                  </span>
                </label>

                {/* Submit Button */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm tracking-wide active:scale-98"
                  >
                    <span>Please Support & Donate</span>
                    <Heart className="w-4 h-4 fill-white" />
                  </button>

                  <div className="bg-amber-400 text-slate-950 font-extrabold py-3 px-4 rounded-2xl text-center shadow-xs flex items-center justify-center gap-2 text-xs tracking-wide">
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>Helpline : +91 9416362914</span>
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* RIGHT COLUMN: SOCIETY OFFICIAL BANK ACCOUNT DETAILS (lg:col-span-5) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
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

      {/* Razorpay Checkout & 80G Receipt Modal */}
      <RazorpayCheckoutModal 
        isOpen={showRazorpay} 
        onClose={() => setShowRazorpay(false)}
        donorData={formData}
        amount={amount}
      />
    </div>
  );
}
