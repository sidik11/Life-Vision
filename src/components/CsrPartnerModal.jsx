import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, Building2, User, Phone, Mail, Briefcase, DollarSign, CheckSquare } from 'lucide-react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';

export default function CsrPartnerModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    budget: '₹5 Lakhs - ₹15 Lakhs',
    interests: ['Women Empowerment', 'Skill Development'],
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPartner = {
      id: `PRT-OD-${Math.floor(10 + Math.random() * 90)}`,
      orgName: formData.companyName || 'Corporate CSR Partner',
      contactPerson: `${formData.contactPerson || 'Contact Person'} (${formData.designation || 'CSR Lead'})`,
      email: formData.email || 'partner@company.com',
      phone: formData.phone || '+91 98000 00000',
      partnerType: 'CSR Corporate Partner',
      logo: '/company/Privir Healthcare.jpg',
      location: 'Odisha / Corporate HQ',
      dateJoined: new Date().toISOString().split('T')[0],
      status: 'Pending',
      programsSupported: 1,
      budget: formData.budget || '₹5 Lakhs - ₹15 Lakhs',
      interests: formData.interests.join(', ') || 'Women Empowerment',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, "partners"), newPartner);
      newPartner.firestoreId = docRef.id;
    } catch (firebaseErr) {
      console.warn("Firebase partner save notice:", firebaseErr);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3500);
  };

  const interestOptions = [
    'Women Empowerment',
    'Skill Development',
    'Education',
    'Livelihood',
    'Healthcare',
    'Community Development',
  ];

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-pink-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100/90 hover:bg-slate-200 transition-colors cursor-pointer z-20 shadow-xs border border-slate-200/80"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 bg-pink-100 text-[#C52B75] rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-black text-[#6B1D52]">Thank You!</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
              Thank you for your interest in partnering with us. Our team will contact you shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="pr-10 sm:pr-12">
              <div className="inline-flex items-center gap-1.5 text-2xs font-extrabold text-[#C52B75] tracking-wider bg-pink-50 px-3 py-1 rounded-full mb-2 border border-pink-100">
                <Building2 className="w-3.5 h-3.5" />
                <span>Corporate & CSR Initiatives</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-[#6B1D52] tracking-tight">
                Become a CSR Partner
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Partner with Life Vision Society to drive meaningful CSR programs and sustainable community impact.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Steel / HDFC Foundation"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Person *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. CSR Lead / HR Manager"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="corporate@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CSR Budget / Support Type
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium bg-white"
                >
                  <option value="Under ₹5 Lakhs">Under ₹5 Lakhs</option>
                  <option value="₹5 Lakhs - ₹15 Lakhs">₹5 Lakhs - ₹15 Lakhs</option>
                  <option value="₹15 Lakhs - ₹50 Lakhs">₹15 Lakhs - ₹50 Lakhs</option>
                  <option value="₹50 Lakhs+">₹50 Lakhs+</option>
                  <option value="Equipment / Machine Sponsorship">Equipment / Machine Sponsorship</option>
                  <option value="Training Center Infrastructure Setup">Training Center Infrastructure Setup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Area of Interest (Select All That Apply)
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#FFF7F6] p-3 rounded-xl border border-pink-100">
                  {interestOptions.map((opt) => {
                    const isChecked = formData.interests.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleInterestToggle(opt)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer border ${
                          isChecked 
                            ? 'bg-[#C52B75] text-white border-[#C52B75] shadow-2xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-pink-200'
                        }`}
                      >
                        <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message / Requirements
                </label>
                <textarea
                  rows="3"
                  placeholder="Share details about your CSR focus, preferred districts, or partnership requirements..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C52B75] to-[#6B1D52] hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-98"
              >
                <span>Submit Partnership Request</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
